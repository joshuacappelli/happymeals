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
      className="px-6 py-3 font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-lg shadow-sm hover:bg-blue-500 hover:text-white hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-200 focus:outline-none"
      onClick={handleCall}
    >
      Call {phoneNumber}
    </button>
  );
}
