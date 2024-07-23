import mongoose from 'mongoose'

const userChatSchema = new mongoose.Schema({
    username: {type: String, required: true, ref: 'User'},
    chatList: [{
        chatId: {type: mongoose.Schema.Types.ObjectId, ref:'Chat'},
        recvName: { type: String, required: true},
        seen: {type: Boolean, default: false},
        lastUpdate: {type: Date, default:  Date.now}
    }]
})

const UserChat = mongoose.model('UserChat',userChatSchema)

export default UserChat