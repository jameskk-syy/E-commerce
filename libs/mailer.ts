import nodemailer from "nodemailer";

interface SendOtpOptions {
  email: string;
  code: string;
  subject?: string;
}

export async function sendOtpEmail({ email, code, subject = "Your TechHub Security Code" }: SendOtpOptions): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"TechHub Security" <${user || "security@techhub.co.ke"}>`;

  // Visual terminal output for development / testing
  console.log("\n=======================================================");
  console.log(`  [OTP DISPATCH] Recipient: ${email}`);
  console.log(`  [OTP DISPATCH] 6-Digit Code: >>> ${code} <<<`);
  console.log(`  [OTP DISPATCH] Valid for: 10 minutes`);
  console.log("=======================================================\n");

  // If SMTP is not yet configured, gracefully skip sending real email
  if (!host || !user || !pass) {
    console.warn(
      "[Mailer Notice] SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) not fully set in .env. Email simulated in terminal."
    );
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { background: #09090b; padding: 28px 32px; text-align: center; }
            .brand { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
            .brand span { color: #4f46e5; }
            .content { padding: 32px; }
            .title { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: #0f172a; }
            .text { font-size: 14px; line-height: 1.5; color: #64748b; margin-bottom: 24px; }
            .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
            .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #09090b; font-family: monospace; }
            .badge { display: inline-block; padding: 4px 10px; background: #fee2e2; color: #b91c1c; border-radius: 6px; font-size: 11px; font-weight: 700; margin-top: 8px; }
            .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">tech<span>hub</span></div>
            </div>
            <div class="content">
              <div class="title">Two-Factor Authentication Code</div>
              <div class="text">Use the single-use 6-digit verification code below to verify your identity and access your TechHub account:</div>
              <div class="otp-box">
                <div class="otp-code">${code}</div>
                <div class="badge">Expires in 10 minutes</div>
              </div>
              <div class="text" style="font-size: 13px;">If you did not request this verification code, please ignore this email or change your password immediately.</div>
            </div>
            <div class="footer">
              TechHub Kenya &bull; Secure Authentication Portal<br />
              This is an automated security transmission. Do not reply.
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from,
      to: email,
      subject,
      text: `Your TechHub single-use verification code is: ${code}. It expires in 10 minutes.`,
      html: htmlContent,
    });

    console.log(`[Mailer Success] Sent OTP email successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("[Mailer Error] Failed to send email via SMTP:", error);
    // Don't throw fatal error - allow development / testing to continue
    return false;
  }
}

