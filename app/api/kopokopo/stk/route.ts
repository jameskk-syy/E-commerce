import { NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { initiateKopoKopoStkPush } from "@/libs/kopokopo";

/**
 * Format Kenya phone numbers to standard E.164: +2547XXXXXXXX or +2541XXXXXXXX
 */
function formatKenyanPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("+254")) return cleaned;
  if (cleaned.startsWith("254")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+254${cleaned.slice(1)}`;
  return `+254${cleaned}`;
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { items, phoneNumber, customerName, customerEmail, address } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required for M-Pesa STK Push." },
        { status: 400 }
      );
    }

    const formattedPhone = formatKenyanPhone(phoneNumber);
    if (!/^\+254[17]\d{8}$/.test(formattedPhone)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid Kenyan phone number (e.g., 0712345678, 0112345678, or +254712345678).",
        },
        { status: 400 }
      );
    }

    // Calculate total amount in KES
    const totalAmount = items.reduce((acc: number, item: any) => {
      return acc + (item.price || 0) * (item.quantity || 1);
    }, 0);

    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid order amount." }, { status: 400 });
    }

    // Customer Name & Email resolution (Support Guest Checkout)
    const orderCustomerName =
      currentUser?.name || customerName?.trim() || "Guest Customer";
    const orderCustomerEmail =
      currentUser?.email || customerEmail?.trim() || null;

    // Split customer name for Kopo Kopo request
    const nameParts = orderCustomerName.trim().split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "Client";

    // 1. Create a pending Order in Prisma (allows guest orders with userId = null)
    const newOrder = await prisma.order.create({
      data: {
        userId: currentUser?.id || null,
        customerName: orderCustomerName,
        customerEmail: orderCustomerEmail,
        amount: totalAmount,
        currency: "KES",
        status: "pending",
        deliveryStatus: "pending",
        paymentMethod: "kopokopo_stk",
        phoneNumber: formattedPhone,
        products: items,
        address: address || null,
      },
    });

    // 2. Prepare callback URL (pointing to our webhook endpoint)
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/kopokopo/webhook`;

    // 3. Trigger Kopo Kopo API v4 STK Push Request
    const stkResponse = await initiateKopoKopoStkPush({
      amount: totalAmount,
      phoneNumber: formattedPhone,
      phone: formattedPhone,
      firstName,
      lastName,
      email: orderCustomerEmail || undefined,
      callbackUrl,
      metadata: {
        orderId: newOrder.id,
        app: "TechHub Kenya",
        isGuest: !currentUser,
      },
    });

    // 4. Update the Order with the Kopo Kopo payment request ID for reconciliation
    if (stkResponse?.requestId) {
      await prisma.order.update({
        where: { id: newOrder.id },
        data: {
          paymentIntentId: stkResponse.requestId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      requestId: stkResponse.requestId,
      message:
        "M-Pesa STK prompt sent to your phone. Please enter your M-Pesa PIN to complete payment.",
    });
  } catch (error: any) {
    console.error("Kopo Kopo STK error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to initiate M-Pesa STK prompt. Please check your credentials.",
      },
      { status: 500 }
    );
  }
}
