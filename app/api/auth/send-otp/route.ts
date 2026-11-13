import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { sendOtpEmail } from "@/libs/mailer";
import bcryptjs from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, verifyPassword = false } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account registered with this email address" },
        { status: 404 }
      );
    }

    // 2. If verifyPassword flag is true, check password before generating OTP
    if (verifyPassword) {
      if (!password || !user.hashedPassword) {
        return NextResponse.json(
          { error: "Password is required" },
          { status: 400 }
        );
      }
      const isMatch = await bcryptjs.compare(password, user.hashedPassword);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Invalid password provided" },
          { status: 401 }
        );
      }
    }

    // 3. Invalidate previous unused OTPs for this email
    await prisma.otpVerification.updateMany({
      where: {
        email: normalizedEmail,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // 4. Generate random secure 6-digit code (e.g. 100000 - 999999)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 5. Store in database
    await prisma.otpVerification.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt,
        used: false,
      },
    });

    // 6. Send email via SMTP (or log in terminal if SMTP keys not yet populated)
    await sendOtpEmail({
      email: normalizedEmail,
      code,
      subject: `TechHub Security: Your 6-digit verification code is ${code}`,
    });

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      devOtp: code, // Provided for developer preview on OTP page
      role: user.role,
      message: `A 6-digit verification code has been dispatched to ${normalizedEmail}`,
    });
  } catch (error: any) {
    console.error("[send-otp error]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error dispatching OTP" },
      { status: 500 }
    );
  }
}

