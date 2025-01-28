import { makeCall } from '@/app/lib/utils';

const phoneNumberToCall = process.argv[2];

if (!phoneNumberToCall) {
  console.error('Please provide a phone number to call as a command-line argument.');
  process.exit(1);
}

makeCall(phoneNumberToCall);
