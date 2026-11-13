import prisma from "@/libs/prismadb";
import bcryptjs from "bcryptjs";
import { NextResponse } from "next/server";

/**
 * Format Kenya phone number to E.164: +254XXXXXXXXX
 */
function normalizeKenyanPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("+254")) return cleaned;
  if (cleaned.startsWith("254")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+254${cleaned.slice(1)}`;
  return `+254${cleaned}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phoneNumber } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 400 }
      );
    }

    // Format and validate Kenyan phone number
    let formattedPhone: string | null = null;
    if (phoneNumber) {
      formattedPhone = normalizeKenyanPhone(phoneNumber);
      if (!/^\+254[17]\d{8}$/.test(formattedPhone)) {
        return NextResponse.json(
          {
            error:
              "Please provide a valid Kenyan phone number (e.g. +254 712 345 678 or 0712 345 678)",
          },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user: STRICTLY ENFORCE role: "USER" (customers only)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        hashedPassword,
        phoneNumber: formattedPhone,
        role: "USER", // Prevents elevation of privilege
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("[Register Error]", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong registering your account" },
      { status: 500 }
    );
  }
}
