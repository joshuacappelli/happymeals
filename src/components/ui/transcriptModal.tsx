// import React, { useState, useEffect, useRef } from "react";

// const TranscriptModal = ({ isOpen, onClose }) => {
//     const [aiTranscript, setAiTranscript] = useState("");
//     const [userTranscript, setUserTranscript] = useState("");
//     const socketRef = useRef<WebSocket | null>(null); // Store WebSocket persistently

//     useEffect(() => {
//         if (!isOpen) {
//             console.log("Modal is closed, not opening WebSocket.");
//             return;
//         }

//         const rawDomain = process.env.NEXT_PUBLIC_DOMAIN;
//         if (!rawDomain) {
//             console.error("DOMAIN environment variable is missing");
//             return;
//         }

//         const DOMAIN = rawDomain.replace(/(^\w+:|^)\/\//, "").replace(/\/+$/, "");
        
//         if (socketRef.current) {
//             console.log("WebSocket already exists, reusing connection.");
//             return;
//         }

//         console.log("Opening WebSocket connection...");
//         const socket = new WebSocket(`wss://${DOMAIN}/media-stream`);
//         socketRef.current = socket;

//         socket.onopen = () => {
//             console.log("WebSocket connection established");
//             socket.send(JSON.stringify({ type: "connection_init" }));
//         }

//         socket.onmessage = (event) => {
//             console.log("Raw message type:", event.type);
//             try {
//         // Handle only text messages
//                 if (typeof event.data !== 'string') {
//                     console.warn("Received non-text message, ignoring");
//                     return;
//                 }
                
//                 const data = JSON.parse(event.data);
//                 console.log("Parsed WebSocket Data:", data);
//                 console.log("event type: ", data.event);

//                 if (data.event === "transcript.ai") {
//                     setAiTranscript((prev) => `${prev} ${data.transcript}`.trim());
//                 } else if (data.event === "transcript.user") {
//                     setUserTranscript((prev) => `${prev} ${data.transcript}`.trim());
//                 } else {
//                     console.log("Other WebSocket event:", data.event);
//                 }
//             } catch (error) {
//                 console.error("Error parsing WebSocket message:", error);
//             }
//         };

//         socket.onerror = (error) => console.error("WebSocket error on client:", error);
//         socket.onclose = (event) => {
//             console.warn("WebSocket closed:", event);
//             socketRef.current = null; // Reset ref when closed
//         };

//         const heartbeatInterval = setInterval(() => {
//             if (socket.readyState === WebSocket.OPEN) {
//                 socket.send(JSON.stringify({ type: "heartbeat" }));
//             }
//         }, 30000);

//         return () => {
//             console.log("Closing WebSocket connection...");
//             clearInterval(heartbeatInterval);
//             socketRef.current?.close();
//             socketRef.current = null;
//         };
//     }, [isOpen]);

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//             <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
//                 <h2 className="text-lg font-semibold mb-2">Live Transcription</h2>
//                 <p className="text-sm font-bold">User:</p>
//                 <p className="text-gray-700 border-b pb-2">{userTranscript || "Waiting for input..."}</p>
                
//                 <p className="text-sm font-bold mt-2">AI:</p>
//                 <p className="text-gray-700">{aiTranscript || "Waiting for response..."}</p>

//                 <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
//                     Close
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default TranscriptModal;

import React, { useState, useEffect, useRef } from "react";

const TranscriptModal = ({ isOpen, onClose }) => {
    const [aiTranscript, setAiTranscript] = useState("");
    const [userTranscript, setUserTranscript] = useState("");
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!isOpen) {
            console.log("Modal is closed, skipping WebSocket connection.");
            return;
        }

        const rawDomain = process.env.NEXT_PUBLIC_DOMAIN;
        if (!rawDomain) {
            console.error("DOMAIN environment variable is missing");
            return;
        }

        const DOMAIN = rawDomain.replace(/(^\w+:|^)\/\//, "").replace(/\/+$/, "");
        const socket = new WebSocket(`wss://${DOMAIN}/media-stream`);
        socketRef.current = socket;

        console.log("WebSocket connection attempting...");

        socket.onopen = () => {
            console.log("WebSocket connection established");
        };

        socket.onmessage = (event) => {
            console.log("Received WebSocket message:", event.data);

            try {
                const data = JSON.parse(event.data);
                if (data.event === "transcript.ai") {
                    setAiTranscript((prev) => `${prev} ${data.transcript}`.trim());
                } else if (data.event === "transcript.user") {
                    setUserTranscript((prev) => `${prev} ${data.transcript}`.trim());
                } else {
                    console.log("Unhandled WebSocket event:", data.event);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error, event.data);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onclose = (event) => {
            console.warn("WebSocket closed:", event);
        };

        return () => {
            console.log("Closing WebSocket connection...");
            socket.close();
            socketRef.current = null;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-lg font-semibold mb-2">Live Transcription</h2>
                <p className="text-sm font-bold">User:</p>
                <p className="text-gray-700 border-b pb-2">{userTranscript || "Waiting for input..."}</p>
                
                <p className="text-sm font-bold mt-2">AI:</p>
                <p className="text-gray-700">{aiTranscript || "Waiting for response..."}</p>

                <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
                    Close
                </button>
            </div>
        </div>
    );
};

export default TranscriptModal;
