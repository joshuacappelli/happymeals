# AI Restaurant Recommendation & Calling App

This project provides restaurant recommendations based on user preferences and can initiate AI-driven phone calls to restaurants. It uses [Next.js](https://nextjs.org/) for the web app, [OpenAI](https://openai.com/) (ChatGPT) for recommendation and conversation logic, [ElevenLabs](https://beta.elevenlabs.io/) for text-to-speech synthesis, and [Twilio](https://www.twilio.com/) for managing phone calls.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [Running Locally](#running-locally)
  - [Making Restaurant Recommendations](#making-restaurant-recommendations)
  - [Initiating Phone Calls](#initiating-phone-calls)
  - [Text-to-Speech](#text-to-speech)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [License](#license)

---

## Features

1. **Restaurant Recommendations**  
   - Uses ChatGPT to generate restaurant suggestions based on user preferences (e.g., cuisine, location, dietary restrictions).

2. **AI-Driven Dialog**  
   - ChatGPT can further refine or adjust recommendations based on user feedback.

3. **Text-to-Speech**  
   - ElevenLabs synthesizes ChatGPT’s text responses into natural-sounding voice.

4. **Voice Calls with Twilio**  
   - Initiate calls to restaurants to make reservations or ask questions.  
   - Configure Twilio webhooks to handle call flows.

---

## Architecture

1. **Next.js Frontend**  
   - Collects user input (cuisine preferences, location, etc.).  
   - Displays recommendations and call status.

2. **Next.js API Routes**  
   - `/api/chat` to communicate with ChatGPT.  
   - `/api/voice` to generate ElevenLabs TTS audio.  
   - `/api/call` to place outgoing calls with Twilio.  
   - `/api/voice-call-twiml` to provide Twilio instructions (TwiML) during calls.

3. **OpenAI (ChatGPT)**  
   - Processes user messages and preferences to generate restaurant recommendations or conversation text.

4. **ElevenLabs**  
   - Converts ChatGPT text into speech audio files.

5. **Twilio**  
   - Manages actual phone calls (outgoing and/or incoming).  
   - Fetches TTS audio from a publicly accessible URL or uses `<Say>` TwiML.

---

## Prerequisites

- **Node.js** (>=14.x recommended)
- **npm** or **Yarn**
- **OpenAI Account** (for ChatGPT API Key)
- **ElevenLabs Account** (for TTS API Key)
- **Twilio Account** (for phone calls, SID, Auth Token, purchased phone number)
- A publicly accessible URL for Twilio webhooks (for production deployment)

---

## Installation

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/your-username/ai-restaurant-app.git
   cd ai-restaurant-app
