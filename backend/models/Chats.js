import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    messages: [{
        senderName: {type: String, required: true},
        text: {type: String, required: true},
        timestamp: {type: Date, default: Date.now}
    }
    ]
})

const Chat = mongoose.model('Chat', chatSchema);

export default Chat