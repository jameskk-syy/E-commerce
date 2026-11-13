import { createHmac, timingSafeEqual } from "crypto";
import { Buffer } from "buffer";

const BASE_URL = process.env.KOPOKOPO_BASE_URL || "https://sandbox.kopokopo.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtain an OAuth 2.0 bearer token using client_credentials.
 * Caches the token in-memory until 1 minute before expiry.
 */
export async function getKopoKopoToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token;
  }

  const clientId = process.env.KOPOKOPO_CLIENT_ID;
  const clientSecret = process.env.KOPOKOPO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Kopo Kopo credentials: KOPOKOPO_CLIENT_ID and KOPOKOPO_CLIENT_SECRET must be set."
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(`${BASE_URL}/oauth/v4/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to obtain Kopo Kopo token (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  const expiresInMs = (data.expires_in || 3600) * 1000;

  cachedToken = {
    token: data.access_token,
    expiresAt: now + expiresInMs,
  };

  return data.access_token;
}

/**
 * Initiates an M-Pesa STK Push request via Kopo Kopo v4 Incoming Payments API.
 */
export interface StkPushParams {
  phoneNumber?: string;
  phone?: string;
  amount: number;
  currency?: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

export async function initiateKopoKopoStkPush(params: StkPushParams) {
  const token = await getKopoKopoToken();
  const tillNumber = process.env.KOPOKOPO_TILL_NUMBER;

  if (!tillNumber) {
    throw new Error("KOPOKOPO_TILL_NUMBER is not configured in .env");
  }

  const payload = {
    payment_channel: "M-PESA STK Push",
    till_number: tillNumber,
    first_name: params.firstName || "Customer",
    last_name: params.lastName || "User",
    phone_number: params.phoneNumber || params.phone || "",
    amount: {
      currency: params.currency || "KES",
      value: params.amount.toFixed(2),
    },
    email: params.email || undefined,
    callback_url: params.callbackUrl,
    metadata: params.metadata || {},
  };

  const response = await fetch(`${BASE_URL}/api/v4/incoming_payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const location = response.headers.get("location");
  let responseData: any = null;

  try {
    responseData = await response.json();
  } catch {
    // Some 201 Created responses have an empty body with just the Location header
  }

  if (response.status === 201) {
    const paymentRequestId = location ? location.split("/").pop() : null;
    return {
      success: true,
      location,
      paymentRequestId,
      requestId: paymentRequestId,
      data: responseData,
      status: response.status,
    };
  }

  return {
    success: false,
    status: response.status,
    error: responseData || response.statusText,
    location: null,
    paymentRequestId: null,
    requestId: null,
    data: null,
  };
}

/**
 * Validates the HMAC-SHA256 signature in Kopo Kopo webhook requests.
 */
export function verifyKopoKopoSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const secret = process.env.KOPOKOPO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("KOPOKOPO_WEBHOOK_SECRET is not set; skipping signature verification");
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  try {
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    // In Node.js, timingSafeEqual requires buffers of identical byteLength
    if (sigBuffer.byteLength !== expectedBuffer.byteLength) {
      return false;
    }

    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return signature.toLowerCase() === expectedSignature.toLowerCase();
  }
}
