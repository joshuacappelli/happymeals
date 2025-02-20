import { makeCall } from "@/app/lib/makecall";

interface CallButtonProps {
  phoneNumber: string;
  onCallStart: () => void; // New prop to open modal
}

export default function CallButton({ phoneNumber, onCallStart }: CallButtonProps) {
  const handleCall = async () => {
    if (!phoneNumber) {
      alert("No phone number provided");
      return;
    }

    console.log("Initiating call to ${phoneNumber}");
    const result = await makeCall(phoneNumber);

    if (result) {
      onCallStart(); // Open the modal when the call starts
    } else {
      alert("Failed to start call. Check console for details.");
    }
  };

  return (
    <button
      className="px-6 py-3 font-semibold bg-white border-2 border-crimson rounded-lg shadow-sm hover:bg-crimson hover:text-white hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-crimson focus:outline-none"
      onClick={handleCall}
    >
      Call {phoneNumber}
    </button>
  );
}