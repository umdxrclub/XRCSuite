import { GlobalSlugs } from "../../slugs";
import { broadcast, WebSocketEndpoint } from "../WebSocketServer";
import { Server, WebSocket, WebSocketServer } from "ws";

var server: Server<WebSocket>

type WakeOnLANCommand = {
    type: "wol",
    mac: string
}

type SetRGBCommand = {
    type: "rgb",
    color: string
}

type BaseStationPowerCommand = {
    type: "baseStationPower",
    power: boolean
}

type LabCommand = WakeOnLANCommand | SetRGBCommand | BaseStationPowerCommand;

function sendLabCommand(command: LabCommand) {
    broadcast(server, JSON.stringify(command))
}

function onCreate(newServer: Server<WebSocket>) {
    server = newServer
}

function onConnection(server: Server<WebSocket>, connection: WebSocket) {
    console.log("New connection!")
}


export function sendWakeOnLAN(mac: string) {
    let payload: WakeOnLANCommand = {
        type: "wol",
        mac: mac
    }

    sendLabCommand(payload)
}

export function setLabLightsColor(color: string) {
    sendLabCommand({ type: "rgb", color: color })
}

export function setBaseStationPower(on: boolean) {
    sendLabCommand({ type: "baseStationPower", power: on })
}

const LabWebSocket: WebSocketEndpoint = {
    global: GlobalSlugs.Lab,
    path: "/ws",
    onCreate: onCreate,
    onConnection: onConnection
}

export default LabWebSocket;