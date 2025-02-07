export async function makeCall(phoneNumber: string) {
    try {
      console.log("phone number sent to makeCall function: ", phoneNumber);
      const response = await fetch("/api/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: phoneNumber }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate call");
      }
  
      const data = await response.json();
      console.log("Call started successfully:", data);
      return data;
    } catch (error) {
      console.error("Error making call:", error);
      return null;
    }
  }
  