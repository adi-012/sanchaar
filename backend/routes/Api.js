import {Router} from "express";
import User from "../models/User.js"
import UserChat from "../models/UserChats.js";
import Chat from "../models/Chats.js"
import { userSockets } from "../index.js";

const router = Router();

router.post("/fetchChats", async(req, res) => {
    try {
        const userChat = await UserChat.findOne({username: req.user.username})
        if (!userChat) return res.send("error")

        const chatIds = userChat.chatList.map(chat => chat.chatId)

        const chats = await Chat.find({_id : {$in : chatIds }})

        res.json({chatList: userChat.chatList, chats})
    }catch(e) {
        res.send("error")
    }
})

router.post("/findUser", async (req, res) => {
    try {
        if (req.body.searchKey === req.user.username) {
            return res.send("")
        }
        const user = await User.findOne({username: req.body.searchKey})

        if (!user) {
            return res.send("no user")
        }

        const userChat = await UserChat.findOne({username: req.user.username,
        chatList: {
            $elemMatch : {recvName: req.body.searchKey}
        }
        })
        if (userChat) {
            return res.send("")
        }

        return res.send(user.username)

    } catch (e) {
        return res.status(500).send("error")
    }
})

router.post("/message", async (req, res) => {
    try {
        const {message, selectedChat, timestamp, recvName} = req.body
        const chat = await Chat.findById(selectedChat)

        if (!chat) return res.send('error')

        const newMessage = {
            senderName: req.user.username,
            text: message,
            timestamp: timestamp
        }
        chat.messages.push(newMessage)
        await chat.save()

        const userChat1 = await UserChat.findOne({username: req.user.username})
        const userChat2 = await UserChat.findOne({username: recvName})
        const chatItem1 = userChat1.chatList.find(chat => chat.chatId.toString() === selectedChat)
        const chatItem2 = userChat2.chatList.find(chat => chat.chatId.toString() === selectedChat)

        chatItem1.lastUpdate = timestamp;

        chatItem2.seen = false;
        chatItem2.lastUpdate = timestamp;

        await userChat1.save();
        await userChat2.save();

        const socket1 = userSockets.get(req.user.username)
        const socket2 = userSockets.get(recvName)

        if (socket1) {
            socket1.send(JSON.stringify({type: 'msg', chatId: selectedChat ,message: newMessage}))
        }

        if (socket2) {
            socket2.send(JSON.stringify({type: 'msg', chatId: selectedChat ,message: newMessage}))
        }

        res.send({msg: "message sent"})

    }catch(e){
        console.log(e)
        res.send('error')
    }
})

router.post("/updateSeen", async (req, res) => {
    try {
        const {chatId} = req.body

        const userChat = await UserChat.findOne({username: req.user.username})

        if (!userChat) return res.send('error')

        const chatItem = userChat.chatList.find(item => item.chatId.toString() === chatId);

        if (!chatItem) return res.send('error')

        chatItem.seen = true;
        await userChat.save()

    }catch (e) {
        res.send("error")
    }
})

router.post("/addUser", async (req, res) => {
    try {
        const userChat1 = await UserChat.findOne({username: req.user.username})
        const userChat2 = await UserChat.findOne({username: req.body.username})
        if (!userChat1 || !userChat2) {
            return res.send("error")
        }

        const newChat = new Chat({
            messages: []
        })

        await newChat.save()

        const curTime = Date.now()

        const chatItem1 = {
            chatId: newChat._id,
            recvName: req.body.username,
            seen: false,
            lastUpdate: curTime
        }

        const chatItem2 = {
            chatId: newChat._id,
            recvName: req.user.username,
            seen: false,
            lastUpdate: curTime
        }


        userChat1.chatList.push(chatItem1)
        userChat2.chatList.push(chatItem2)
        await userChat1.save();
        await userChat2.save();

        const socket1 = userSockets.get(req.user.username)
        const socket2 = userSockets.get(req.body.username)

        if (socket1) {
            socket1.send(JSON.stringify({type: 'chat', chat: chatItem1}))
        }

        if (socket2) {
            socket2.send(JSON.stringify({type: 'chat', chat: chatItem2}))
        }

        res.json({msg: 'success'})
    } catch (e) {
        console.log(e)
        res.send("error")
    }
})

export default router;