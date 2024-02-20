import { Server, WebSocket } from "ws";
import { WebSocketEndpoint, wsBroadcast } from "./WebSocketServer";

var server: Server<WebSocket>;

export type XRCStatusMessage = XRCStatusLabUpdateMessage;

export type XRCStatusLabUpdateMessage = {
    type: "labUpdate"
}



function onCreate(newServer: Server<WebSocket>) {
  server = newServer;
}

function onConnection(server: Server<WebSocket>, connection: WebSocket) {
  console.log("New status connection!");
}

export function sendLabUpdateNotification() {
    let msg: XRCStatusLabUpdateMessage = {
        type: "labUpdate"
    }

    wsBroadcast(server, JSON.stringify(msg));
}

const XRCStatusWebSocket: WebSocketEndpoint = {
  path: "/api/status",
  onCreate,
  onConnection,
};

export default XRCStatusWebSocket;