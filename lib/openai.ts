import WS from "ws";
import conf from "../config.json";
import log from "./logger";
import type {
  OpenAIActions,
  OpenAIStreamMessage,
  OpenAIStreamMessageTypes,
} from "./openai-types";

export let ws: WS | null = null;

function dispatch(event: OpenAIActions) {
  ws?.send(JSON.stringify(event));
}

export async function startWs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ws)
      throw Error(
        `There is already an active OpenAI websocket connection. This demo is limited to a single OpenAI connection at a time.`
      );

    log.oai.info("initializing websocket");

    ws = new WS(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
      {
        headers: {
          Authorization: "Bearer " + process.env.OPENAI_API_KEY,
          "OpenAI-Beta": "realtime=v1",
        },
      }
    );

    ws.on("open", () => {
      log.oai.success("websocket opened");
      resolve();
    });

    ws.on("unexpected-response", (req, msg) => {
      log.oai.error("connection failure", msg);
      reject();
    });

    ws.on("close", () => {
      log.oai.warn("webSocket connection closed");
      ws = null;
    });

    ws.on("error", (err) => {
      log.oai.error("websocket error", err);
    });

    ws.on("message", (data: any) => {
      const msg = JSON.parse(data.toString()) as OpenAIStreamMessage;

      switch (msg.type) {
        // bot starts speaking
        case "conversation.item.created":
          break;

        // // user starts speaking
        // case "input_audio_buffer.speech_started":
        //   twlo.clearAudio();
        //   clearAudio();
        //   break;

        // user stops speaking
        case "input_audio_buffer.speech_stopped":
          break;

        // // bot audio packets are forwarded to the Twilio call
        // case "response.audio.delta":
        //   twlo.sendAudio(msg.delta);
        //   break;

        // // bot partial transcript
        // case "response.audio_transcript.delta":
        //   log.oai.info("bot transcript (delta): ", msg.delta);
        //   break;

        // // bot transcript complete
        // case "response.audio_transcript.done":
        //   log.oai.info("bot transcript (final): ", msg.transcript);

        //   break;

        case "error":
          log.oai.error(msg);
          break;

        default:
      }
    });
  });
}

export async function stopWs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ws) {
      log.oai.warn("no WebSocket connection to disconnect");
      resolve();
      return;
    }

    ws.close();

    ws.on("close", () => {
      ws = null;
      resolve();
    });
  });
}

export function clearAudio() {
  dispatch({ type: "input_audio_buffer.clear" });
}

export function sendAudio(audio: string) {
  dispatch({ type: "input_audio_buffer.append", audio });
}

// these config params should probably be set when the OpenAI websocket is initialized
// but, setting them slightly later (i.e. when the Twilio Media starts) seems to make
// OpenAI's bot more responsive
export function setSession() {
  dispatch({
    type: "session.update",
    session: {
      input_audio_format: "g711_ulaw",
      output_audio_format: "g711_ulaw",
      modalities: ["text", "audio"],
      turn_detection: { type: "server_vad" },

      instructions: conf.openai.instructions,
      temperature: conf.openai.temperature,
      voice: conf.openai.voice,
    },
  });
}

/****************************************************
 Event Subscribers
****************************************************/
export function on<T extends OpenAIStreamMessageTypes>(
  type: T,
  callback: (message: OpenAIStreamMessage & { type: T }) => void
) {
  ws?.on("message", (data) => {
    const msg = JSON.parse(data.toString()) as OpenAIStreamMessage;
    if (msg.type === type) callback(msg as OpenAIStreamMessage & { type: T });
  });
}
