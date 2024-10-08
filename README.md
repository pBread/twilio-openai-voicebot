# Minimalist Voice Bot with Twilio & OpenAI Realtime

This project demonstrates how to integrate [Twilio's Programmable Voice API](https://www.twilio.com/docs/voice) with [OpenAI's real-time streaming API](https://platform.openai.com/docs/guides/realtime/overview) to enable real-time voice agents. Users can make voice calls via Twilio and the system proxies the audio with OpenAI's Realtime API.

## How it Works

- The `/incoming-call` endpoint responds to Twilio's incoming call webhook with the TwiML noun [`<Stream/>`](https://www.twilio.com/docs/voice/twiml/stream)
- A [Media Stream](https://www.twilio.com/docs/voice/media-streams) is established with the app's websocket endpoint.
- Audio packets from the voice call are forwarded to [OpenAI's Realtime API](https://platform.openai.com/docs/guides/realtime/overview).
- OpenAI responds with audio packets, which are forwarded to Twilio.

## Getting Started

- [Twilio account](https://www.twilio.com/try-twilio) with a [phone number](https://help.twilio.com/articles/223135247-How-to-Search-for-and-Buy-a-Twilio-Phone-Number-from-Console)
- [OpenAI Platform Account](https://platform.openai.com/signup) and `OPENAI_API_KEY`
- [nGrok installed globally](https://ngrok.com/docs/getting-started/), if you want to run it locally

# Get Started

### 1. Clone Repo

```bash
git clone https://github.com/pBread/twilio-openai-voicebot-simple
cd twilio-openai-voicebot-simple
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Environment Variables

```bash
OPENAI_API_KEY=your-openai-api-key
```

```bash
HOSTNAME=your-private-ngrok-domain

or

HOSTNAME=your-deployment-host
```

### 4. Start NGrok Tunnel

Expose your local server (port 3000) using nGrok

```bash
npm run grok
```

<b>Important:</b> if you do not have a private ngrok domain, you must start your nGrok tunnel first and add the domain as your `HOSTNAME` env variable. The app must know what the public domain is before it is started.

### 5. Run the App

This command will start the Express server which handles incoming Twilio webhook requests and media streams.

```bash
npm run dev
```

### 6. Configure Twilio Phone Number Webhooks

Go to your [Twilio Console](https://console.twilio.com/) and configure the Voice webhooks for your Twilio phone number:

- <b>Incoming Call Webhook</b>: Select `POST` and set url to: https://your-ngrok-domain.ngrok.io/incoming-call
- <b>Call Status Update Webhook</b>: Select `POST` and set url to: https://your-ngrok-domain.ngrok.io/call-status-update

### 7. Place a Call to Your Twilio Phone Number

You're all set. Place a call to your Twilio Phone Number and you should see the real-time transcript logged to your local terminal.
