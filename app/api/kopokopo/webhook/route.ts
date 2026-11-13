import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { verifyKopoKopoSignature } from "@/libs/kopokopo";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-kopokopo-signature") ||
      request.headers.get("X-KopoKopo-Signature");

    // 1. Verify webhook signature
    // If webhook secret is set in .env, enforce validation
    if (process.env.KOPOKOPO_WEBHOOK_SECRET) {
      const isValid = verifyKopoKopoSignature(rawBody, signature);
      if (!isValid) {
        console.warn("Invalid Kopo Kopo webhook signature. Payload:", rawBody);
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Extract event details
    // Topic can be in payload.topic or payload.data.type
    const topic = payload.topic || payload.data?.type || "";
    const attributes = payload.data?.attributes || {};
    const eventData = attributes.event || {};
    const resource = eventData.resource || attributes.resource || {};
    const metadata = attributes.metadata || {};

    console.log(`[Kopo Kopo Webhook] Received topic: "${topic}"`);

    // -------------------------------------------------------------
    // Scenario A: M-PESA STK Push Result ("incoming_payment")
    // -------------------------------------------------------------
    if (
      topic === "incoming_payment" ||
      topic.includes("incoming_payment") ||
      eventData.type === "Incoming Payment"
    ) {
      const paymentStatus = attributes.status; // "Success" or "Failed"
      const orderId = metadata.orderId;
      const mpesaReceipt = resource.reference || resource.id;

      console.log(
        `[Kopo Kopo STK Callback] Order: ${orderId}, Status: ${paymentStatus}, Receipt: ${mpesaReceipt}`
      );

      if (orderId) {
        if (paymentStatus === "Success") {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "complete",
              mpesaReceipt: mpesaReceipt || null,
              deliveryStatus: "pending",
            },
          });
          console.log(`[Order ${orderId}] marked as complete.`);
        } else {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "failed",
            },
          });
          console.log(`[Order ${orderId}] marked as failed.`);
        }
      }
    }

    // -------------------------------------------------------------
    // Scenario B: Buy Goods (Till) Transaction ("buygoods_transaction_received")
    // -------------------------------------------------------------
    else if (
      topic === "buygoods_transaction_received" ||
      topic.includes("buygoods") ||
      eventData.type === "Buygoods Transaction Received"
    ) {
      const mpesaReceipt = resource.reference;
      const amount = parseFloat(resource.amount || "0");
      const senderPhone = resource.sender_phone_number;
      const senderName = `${resource.sender_first_name || ""} ${resource.sender_last_name || ""}`.trim();

      console.log(
        `[Buy Goods Received] Receipt: ${mpesaReceipt}, Amount: ${amount}, From: ${senderPhone} (${senderName})`
      );

      // Match against any pending order for this customer and amount
      if (senderPhone && amount > 0) {
        const matchingOrder = await prisma.order.findFirst({
          where: {
            status: "pending",
            amount: amount,
            OR: [
              { phoneNumber: senderPhone },
              { phoneNumber: senderPhone.replace(/^\+/, "") },
              { phoneNumber: `0${senderPhone.slice(4)}` },
            ],
          },
          orderBy: { createDate: "desc" },
        });

        if (matchingOrder) {
          await prisma.order.update({
            where: { id: matchingOrder.id },
            data: {
              status: "complete",
              mpesaReceipt: mpesaReceipt,
              paymentMethod: "buy_goods",
            },
          });
          console.log(`Matched and completed order ${matchingOrder.id} from Buy Goods till payment.`);
        }
      }
    }

    // -------------------------------------------------------------
    // Scenario C: Paybill / B2B Transaction ("b2b_transaction_received")
    // -------------------------------------------------------------
    else if (
      topic === "b2b_transaction_received" ||
      topic.includes("b2b") ||
      eventData.type === "B2b Transaction Received"
    ) {
      const reference = resource.reference;
      const amount = parseFloat(resource.amount || "0");
      const senderPhone = resource.sender_phone_number;

      console.log(
        `[Paybill / B2B Received] Reference: ${reference}, Amount: ${amount}, Phone: ${senderPhone}`
      );

      if (senderPhone && amount > 0) {
        const matchingOrder = await prisma.order.findFirst({
          where: {
            status: "pending",
            amount: amount,
          },
          orderBy: { createDate: "desc" },
        });

        if (matchingOrder) {
          await prisma.order.update({
            where: { id: matchingOrder.id },
            data: {
              status: "complete",
              mpesaReceipt: reference,
              paymentMethod: "paybill",
            },
          });
        }
      }
    }

    // Acknowledge receipt to Kopo Kopo with 200 OK
    return NextResponse.json(
      { status: "success", received: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing Kopo Kopo webhook:", error);
    // Returning 200/500: If unexpected error, return 500 so Kopo Kopo may retry
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

