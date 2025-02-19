import { NextResponse } from "next/server";
import twilio from "twilio";

// Load Environment Variables
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  PHONE_NUMBER_FROM,
  DOMAIN: rawDomain,
} = process.env;

// Check if required env variables exist
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !PHONE_NUMBER_FROM || !rawDomain) {
  throw new Error("Missing required Twilio environment variables");
}

// Initialize Twilio Client
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// TwiML Response (Tells Twilio to use WebSocket)
const DOMAIN = rawDomain.replace(/(^\w+:|^)\/\//, '').replace(/\/+$/, ''); // Clean protocols and slashes

const outboundTwiML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${DOMAIN}/media-stream" />
  </Connect>
</Response>`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to } = body;
    console.log("post request body: ", to);

    if (!to) {
      console.error("Missing 'to' phone number in request!");
      return NextResponse.json({ error: "Missing 'to' phone number" }, { status: 400 });
    }

    console.log(` Making a call to ${to}`);

    const call = await client.calls.create({
      from: PHONE_NUMBER_FROM!,
      to,
      twiml: outboundTwiML, 
    });

    console.log(`Call started with SID: ${call.sid}`);

    return NextResponse.json({ success: true, sid: call.sid });
  } catch (error) {
    console.error("Error making call:", error);
    return NextResponse.json({ error: "Failed to initiate call" }, { status: 500 });
  }
}

