import { userSockets } from "..";

const handleMessage = (username, data) => {
    switch(data.type) {
        case 'offer':
            sendToUser(data.target, {
                type: 'offer',
                offer: data.offer,
                sender: senderId
            });
            break;
        case 'answer':
            sendToUser(data.target, {
                type: 'answer',
                answer: data.answer,
                sender: senderId
            });
            break;
        case 'candidate':
            sendToUser(data.target, {
                type: 'candidate',
                candidate: data.candidate,
                sender: senderId
            });
            break;
        case 'cutCall':
            sendToUser(data.target, {
                type: 'cutCall',
                sender: senderId
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