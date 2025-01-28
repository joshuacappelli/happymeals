// pages/api/media-stream.ts

import { NextApiRequest } from 'next';
import { WebSocketServer } from 'ws';
import type { Server as HTTPServer } from 'http';
import { LOG_EVENT_TYPES, SYSTEM_MESSAGE, VOICE } from '@/app/lib/constants';

interface ExtendedNextApiResponse extends NextApiRequest {
  socket: any;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.ws) {
    console.log('Initializing WebSocket server...');
    const wss = new WebSocketServer({ noServer: true });

    wss.on('connection', (ws) => {
      console.log('Client connected');

      const apiKey = process.env.OPENAI_API_KEY;
      const openAiWs = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01&token=${apiKey}`
      );

      let streamSid: string | null = null;

      const sendInitialSessionUpdate = () => {
        const sessionUpdate = {
          type: 'session.update',
          session: {
            turn_detection: { type: 'server_vad' },
            input_audio_format: 'g711_ulaw',
            output_audio_format: 'g711_ulaw',
            voice: VOICE,
            instructions: SYSTEM_MESSAGE,
            modalities: ['text', 'audio'],
            temperature: 0.8,
          },
        };

        console.log('Sending session update:', JSON.stringify(sessionUpdate));
        openAiWs.send(JSON.stringify(sessionUpdate));

        const initialConversationItem = {
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: 'Greet the user with "Hello there! I\'m an AI voice assistant from Twilio and the OpenAI Realtime API. How can I help?"',
              },
            ],
          },
        };

        openAiWs.send(JSON.stringify(initialConversationItem));
        openAiWs.send(JSON.stringify({ type: 'response.create' }));
      };

      openAiWs.onopen = () => {
        console.log('Connected to the OpenAI Realtime API');
        setTimeout(sendInitialSessionUpdate, 100);
      };

      openAiWs.onmessage = (event) => {
        const data = event.data;
        try {
          const response = JSON.parse(data.toString());

          if (LOG_EVENT_TYPES.includes(response.type)) {
            console.log(`Received event: ${response.type}`, response);
          }

          if (response.type === 'session.updated') {
            console.log('Session updated successfully:', response);
          }

          if (response.type === 'response.audio.delta' && response.delta) {
            const audioDelta = {
              event: 'media',
              streamSid: streamSid,
              media: { payload: Buffer.from(response.delta, 'base64').toString('base64') },
            };
            ws.send(JSON.stringify(audioDelta));
          }
        } catch (error) {
          console.error('Error processing OpenAI message:', error, 'Raw message:', data);
        }
      };

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);

          switch (data.event) {
            case 'media':
              if (openAiWs.readyState === WebSocket.OPEN) {
                const audioAppend = {
                  type: 'input_audio_buffer.append',
                  audio: data.media.payload,
                };

                openAiWs.send(JSON.stringify(audioAppend));
              }
              break;
            case 'start':
              streamSid = data.start.streamSid;
              console.log('Incoming stream has started', streamSid);
              break;
            default:
              console.log('Received non-media event:', data.event);
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error, 'Message:', message);
        }
      });

      ws.on('close', () => {
        if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();
        console.log('Client disconnected.');
      });

      openAiWs.onclose = () => {
        console.log('Disconnected from the OpenAI Realtime API');
      };

      openAiWs.onerror = (error) => {
        console.error('Error in the OpenAI WebSocket:', error);
      };
    });

    const server: HTTPServer = res.socket.server as any;

    server.on('upgrade', (request: any, socket: any, head: any) => {
      const { pathname } = new URL(request.url, `http://${request.headers.host}`);

      if (pathname === '/api/media-stream') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    res.socket.server.ws = wss;
    console.log('WebSocket server initialized');
  } else {
    console.log('WebSocket server already initialized');
  }

  res.end();
}
