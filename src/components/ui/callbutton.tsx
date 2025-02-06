import { makeCall } from "@/app/lib/makecall";

interface CallButtonProps {
  phoneNumber: string;
}

export default function CallButton({ phoneNumber }: CallButtonProps) {
  const handleCall = async () => {
    if (!phoneNumber) {
      alert("No phone number provided");
      return;
    }

    console.log(`Initiating call to ${phoneNumber}`);
    const result = await makeCall(phoneNumber);

    if (result) {
      alert(`Call started successfully! Call SID: ${result.sid}`);
    } else {
      alert("Failed to start call. Check console for details.");
    }
  };

  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
      onClick={handleCall}
    >
      Call {phoneNumber}
    </button>
  );
}
