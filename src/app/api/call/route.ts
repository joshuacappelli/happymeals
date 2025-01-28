// pages/api/call.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { client as twilioClient } from '@/app/lib/twilioclient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to } = req.body;

  if (!to) {
    return res.status(400).json({ error: 'Missing "to" phone number in request body.' });
  }

  try {
    const outboundTwiML = `<?xml version="1.0" encoding="UTF-8"?><Response><Connect><Stream url="wss://${process.env.DOMAIN?.replace(
      /(^\w+:|^)\/\//,
      ''
    ).replace(/\/+$/, '')}/api/media-stream" /></Connect></Response>`;

    if (!process.env.PHONE_NUMBER_FROM) {
      return res.status(500).json({ error: 'Missing PHONE_NUMBER_FROM in environment variables.' });
    }

    const call = await twilioClient.calls.create({
      from: process.env.PHONE_NUMBER_FROM,
      to,
      twiml: outboundTwiML,
    });

    console.log(`Call started with SID: ${call.sid}`);
    res.status(200).json({ message: 'Call initiated', callSid: call.sid });
  } catch (error: any) {
    console.error('Error making call:', error);
    res.status(500).json({ error: 'Failed to initiate call', details: error.message });
  }
}
