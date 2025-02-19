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

3. **Speech-to-Speech**  
   - OpenAI realtime api for speech to speech allowing for natural sounding low latency calls

4. **Voice Calls with Twilio**  
   - Initiate calls to restaurants to make reservations or ask questions.  
   - Configure Twilio websockets to handle call flows.

---

## Architecture

1. **Next.js Frontend**  
   - Collects user input (cuisine preferences, location, etc.).  
   - Displays recommendations and call status.

2. **Next.js API Routes**  
   - `/api/photo` get restaurant photos from google maps
   - `/api/geocoding` get location data from google maps 
   - `/api/places` get all necessary place information from each location
   - `/api/call` to place outgoing calls with Twilio.  

3. **OpenAI (ChatGPT)**  
   - Processes user and chatbot dialogue for reservations.

5. **Twilio**  
   - Manages actual phone calls (outgoing and/or incoming).  
   - Fetches TTS audio from a publicly accessible URL or uses `<Say>` TwiML.

---

## Prerequisites

- **Node.js** (>=14.x recommended)
- **npm** or **Yarn**
- **OpenAI Account** (for ChatGPT API Key)
- **Twilio Account** (for phone calls, SID, Auth Token, purchased phone number)
- A publicly accessible URL for Twilio websockets (for production deployment)
- **google maps api account** (for accessing all the google maps data)
- **ngrok account** (necessary for twilio voice calls use forwarding address in your env as the domain)

---

## Installation

1. **Clone the Repository**  
2. **put in the necessary keys in our own .env file**
3. **build using npm run custombuild**
4. **ngrok http 6060 (or whatever port you want)**
5. **place forwarding address in your env**
6. **run using npm run customdev**
