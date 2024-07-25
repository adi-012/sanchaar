import express from 'express';
import passport from "passport";
import mongoose from "mongoose";
import cors from "cors"
import { WebSocketServer } from 'ws';
import SessionMiddleware from './middlewares/SessionMiddleware.js';
import ConfigurePassport from "./config/passport.js"
import AuthRouter from "./routes/Auth.js"
import apiRouter from "./routes/Api.js"
import handleMessage from './controllers/socketMessages.js';
import dotenv from "dotenv"

dotenv.config()

const port = process.env.PORT || 3000
const mongo_url = process.env.MONGODB_URL

const app = express();

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}))

app.use(SessionMiddleware)

app.use(passport.authenticate('session'))

ConfigurePassport(passport)

app.use("/auth", AuthRouter)
app.use("/api", apiRouter)

mongoose.connect(mongo_url)
.then(() => {
    console.log("connected to db")
})
.catch(err => {
    console.error(err);
    console.log("failed to connect to db");
    process.exit(1);
})

const server = app.listen(port, () => {
    console.log(`server is listening on port ${port}`)
})

const wsAuth = (req, cb) => {
    SessionMiddleware(req, {}, () => {
        if (req.session && req.session.passport && req.session.passport.user) {
            cb(true, req.session.passport.user)
        } else {
            cb(false, null)
        }
    })
}

const wss = new WebSocketServer({server})

const userSockets = new Map()

wss.on('connection', async (conn, req) => {

    wsAuth(req, (isAuthenticated, user) => {
        if (!isAuthenticated) {
            return conn.close()
        }
        conn.user = user
        userSockets.set(user.username, conn)

        const userList = Array.from(userSockets.keys())

        const userws = Array.from(userSockets.values())

        const onlineUsers = {type:'onlineUsers', userList}
        console.log(onlineUsers)

        userws.forEach(ws => ws.send(JSON.stringify(onlineUsers)))

        conn.on('close', ()=> {
            console.log(conn.user.username, "closed")
            userSockets.delete(conn.user.username)
            const userList = Array.from(userSockets.keys())

            const userws = Array.from(userSockets.values())
            const onlineUsers = {type:'onlineUsers', userList}
            userws.forEach(ws => ws.send(JSON.stringify(onlineUsers)))
        })

        conn.on('message', e => {
            const data = JSON.parse(e)
            handleMessage(conn.user.username, data)
        })
    })
})

export {userSockets}