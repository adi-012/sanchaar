import { userSockets } from "../index.js";

const handleMessage = (username, data) => {
    switch(data.type) {
        case 'offer':
            sendToUser(data.target, {
                type: 'offer',
                offer: data.offer,
                sender: username
            });
            break;
        case 'answer':
            sendToUser(data.target, {
                type: 'answer',
                answer: data.answer,
                sender: username
            });
            break;
        case 'candidate':
            sendToUser(data.target, {
                type: 'candidate',
                candidate: data.candidate,
                sender: username
            });
            break;
        case 'cutCall':
            sendToUser(data.target, {
                type: 'cutCall',
                sender: username
            });
            break;
        default:
            console.log(`Unknown message type: ${data.type}`);
    }
}

const sendToUser = (username, message) => {
    const ws = userSockets.get(username)
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
    } else {
        console.log("No user online with that username")
    }
}

export default handleMessage