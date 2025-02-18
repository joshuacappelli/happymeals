import React, { useState, useEffect } from "react";

const TranscriptModal = ({ isOpen, onClose }) => {
    const [aiTranscript, setAiTranscript] = useState("");
    const [userTranscript, setUserTranscript] = useState("");


    useEffect(() => {
        const rawDomain = process.env.DOMAIN;
        if(!rawDomain) {
            return;
        }

        const DOMAIN = rawDomain.replace(/(^\w+:|^)\/\//, "").replace(/\/+$/, "");

        const socket = new WebSocket(`wss://${DOMAIN}/media-stream`);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.event === "transcript.ai") {
                setAiTranscript(data.transcript);
            } else if (data.event === "transcript.user") {
                setUserTranscript(data.transcript);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            socket.close();
        };
    }, []);

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
