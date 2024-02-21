import { Server, WebSocket } from "ws";
import { WebSocketEndpoint, wsBroadcast } from "./WebSocketServer";

var server: Server<WebSocket>;
var heartbeatTimer: NodeJS.Timer | undefined;

export type XRCStatusMessage = XRCStatusLabUpdate | XRCStatusHeartbeat;

export type XRCStatusLabUpdate = {
  type: "labUpdate";
};

export type XRCStatusHeartbeat = {
  type: "heartbeat";
};

function onCreate(newServer: Server<WebSocket>) {
  server = newServer;
  heartbeatTimer = setInterval(sendHeartbeat, 60 * 1000);
}

function onClose() {
  clearInterval(heartbeatTimer);
  heartbeatTimer = undefined;
}

function onConnection(server: Server<WebSocket>, connection: WebSocket) {
  console.log("New status connection!");
}

export function sendLabUpdateNotification() {
  let msg: XRCStatusLabUpdate = {
    type: "labUpdate",
  };

  wsBroadcast(server, JSON.stringify(msg));
}

function sendHeartbeat() {
  let msg: XRCStatusHeartbeat = {
    type: "heartbeat",
  };

  wsBroadcast(server, JSON.stringify(msg));
}

const XRCStatusWebSocket: WebSocketEndpoint = {
  path: "/api/status",
  onCreate,
  onConnection,
  onClose,
};

export default XRCStatusWebSocket;
