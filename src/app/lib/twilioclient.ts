// lib/twilioClient.ts

import twilio from 'twilio';

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  throw new Error(
    'TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in environment variables.'
  );
}

export const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
