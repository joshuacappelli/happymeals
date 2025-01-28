// lib/utils.ts

import { client as twilioClient } from '@/app/lib/twilioclient';

export async function isNumberAllowed(to: string): Promise<boolean> {
  try {
    // Uncomment and modify the consentMap as needed
    // const consentMap = {"+18005551212": true}
    // if (consentMap[to]) return true;

    // Check if the number is a Twilio phone number in the account
    const incomingNumbers = await twilioClient.incomingPhoneNumbers.list({ phoneNumber: to });
    if (incomingNumbers.length > 0) {
      return true;
    }

    // Check if the number is a verified outgoing caller ID
    const outgoingCallerIds = await twilioClient.outgoingCallerIds.list({ phoneNumber: to });
    if (outgoingCallerIds.length > 0) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking phone number:', error);
    return false;
  }
}

export async function makeCall(to: string) {
  try {
    const isAllowed = await isNumberAllowed(to);
    if (!isAllowed) {
      console.warn(`The number ${to} is not recognized as a valid outgoing number or caller ID.`);
      process.exit(1);
    }

    const outboundTwiML = `<?xml version="1.0" encoding="UTF-8"?><Response><Connect><Stream url="wss://${process.env.DOMAIN?.replace(/(^\w+:|^)\/\//, '').replace(/\/+$/, '')}/api/media-stream" /></Connect></Response>`;
    if (!process.env.PHONE_NUMBER_FROM) {
      return console.error('Missing PHONE_NUMBER_FROM in environment variables.');
    }

    const call = await twilioClient.calls.create({
      from: process.env.PHONE_NUMBER_FROM,
      to,
      twiml: outboundTwiML,
    });

    console.log(`Call started with SID: ${call.sid}`);
  } catch (error: any) {
    console.error('Error making call:', error.message);
  }
}
