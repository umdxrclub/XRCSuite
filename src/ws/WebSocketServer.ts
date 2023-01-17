import http, { IncomingMessage } from "http";
import https from "https";
import { Server, WebSocket } from "ws";
import LabWebSocket from "./Lab/LabWebSocket";

/**
 * A list of all WebSocket endpoints to be hosted.
 */
const WebSocketEndpoints: WebSocketEndpoint[] = [
    LabWebSocket
]

export type WebSocketEndpoint = {
    collection?: string,
    global?: string,
    path: string,
    onCreate?: (server: Server<WebSocket>) => void,
    onConnection?: (server: Server<WebSocket>, socket: WebSocket, request: IncomingMessage) => void,
    onError?: (server: Server<WebSocket>, error: Error) => void,
    onHeaders?: (server: Server<WebSocket>, headers: string[], request: IncomingMessage) => void,
    onClose?: (server: Server<WebSocket>) => void,
    onListening?: (server: Server<WebSocket>) => void
}

/**
 * Broadcasts specified data to all connected clients of a WebSocket server.
 *
 * @param server The server to broadcast on
 * @param data The data to send
 */
export function broadcast(server: Server<WebSocket>, data: string | Buffer | ArrayBuffer | Array<any>) {
    server.clients.forEach(c => c.send(data))
}

/**
 * Creates WebSocket endpoints for all of the endpoints described in the
 * "WebSocketEndpoints" list on a specified HTTP(S) server.
 *
 * @param httpServer The HTTP(S) server to connect the endpoints to.
 */
export function createWebSocketEndpoints(httpServer: http.Server | https.Server) {
    WebSocketEndpoints.forEach(endpoint => {
        var endpointPath = endpoint.path

        if (endpoint.collection) {
            endpointPath = '/api/' + endpoint.collection + endpointPath
        } else if (endpoint.global) {
            endpointPath = '/api/globals/' + endpoint.global + endpointPath
        }

        console.log(endpointPath)
        let wsServer = new Server({ noServer: true, path: endpointPath })

        // Add upgrade endpoint to HTTP(S) server.
        httpServer.on('upgrade', (req, socket, head) => {
            wsServer.handleUpgrade(req, socket, head, socket => {
                wsServer.emit('connection', socket, req);
            })
        })

        // Add handlers to the server
        if (endpoint.onConnection)
            wsServer.on('connection', (socket, req) => endpoint.onConnection(wsServer, socket, req))

        if (endpoint.onError)
            wsServer.on('error', err => endpoint.onError(wsServer, err))

        if (endpoint.onHeaders)
            wsServer.on('headers', (headers, req) => endpoint.onHeaders(wsServer, headers, req))

        if (endpoint.onClose)
            wsServer.on('close', () => endpoint.onClose(wsServer))

        if (endpoint.onListening)
            wsServer.on('listening', () => endpoint.onListening)

        // Send create event
        if (endpoint.onCreate)
            endpoint.onCreate(wsServer)
    });
}