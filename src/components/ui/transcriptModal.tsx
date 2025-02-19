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
        // Connect to the UI updates WebSocket endpoint instead of media-stream
        const socket = new WebSocket(`wss://${DOMAIN}/ui-updates`);
        socketRef.current = socket;

        console.log("UI WebSocket connection attempting...");

        socket.onopen = () => {
            console.log("UI WebSocket connection established");
        };

        socket.onmessage = (event) => {
            console.log("Received UI WebSocket message:", event.data);

            try {
                const data = JSON.parse(event.data);
                if (data.event === "transcript.ai") {
                    setAiTranscript((prev) => {
                        const newTranscript = prev ? `${prev}${data.transcript}` : data.transcript;
                        console.log("Updated AI transcript:", newTranscript);
                        return newTranscript;
                    });
                } else if (data.event === "transcript.user") {
                    setUserTranscript((prev) => {
                        const newTranscript = `${prev} ${data.transcript}`.trim();
                        console.log("Updated user transcript:", newTranscript);
                        return newTranscript;
                    });
                } else {
                    console.log("Unhandled UI WebSocket event:", data.event);
                }
            } catch (error) {
                console.error("Error parsing UI WebSocket message:", error, event.data);
            }
        };

        socket.onerror = (error) => {
            console.error("UI WebSocket error:", error);
        };

        socket.onclose = (event) => {
            console.warn("UI WebSocket closed:", event);
        };

        return () => {
            console.log("Closing UI WebSocket connection...");
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.close();
            }
            socketRef.current = null;
        };
    }, [isOpen]);

    // Reset transcripts when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setAiTranscript("");
            setUserTranscript("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-8">
            <div className="bg-white rounded-xl shadow-2xl w-3/4 h-3/4 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Live Transcription</h2>
                    <button 
                        onClick={onClose} 
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 grid grid-cols-2 gap-8 overflow-hidden">
                    {/* User Transcript */}
                    <div className="flex flex-col h-full">
                        <div className="bg-gray-50 rounded-lg p-6 flex-1 overflow-y-auto">
                            <h3 className="text-lg font-bold text-gray-700 mb-4">User Transcript</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">
                                {userTranscript || "Waiting for input..."}
                            </p>
                        </div>
                    </div>

                    {/* AI Transcript */}
                    <div className="flex flex-col h-full">
                        <div className="bg-blue-50 rounded-lg p-6 flex-1 overflow-y-auto">
                            <h3 className="text-lg font-bold text-crimson mb-4">AI Response</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">
                                {aiTranscript || "Waiting for response..."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranscriptModal;