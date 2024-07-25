import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import User from "../models/User.js"
import UserChats from "../models/UserChats.js"

const router = express.Router();

router.post("/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(404).send("error")
        }
        if (!user) {
            console.log(info);
            if (info.msg === 'no such user') {
                return res.status(404).send("no user")
            } else {
                return res.status(404).send("wrong password")
            }
        }
        req.login(user, err => {
            if (err) return res.send("error")
            return res.send("success")
        })
    })(req, res, next)
})

router.get("/google/login", passport.authenticate('google', {scope: ['profile', 'email']}))

router.get("/google/callback", passport.authenticate('google', {session: true}) ,(req, res)=> {
    res.redirect("http://localhost:5173/auth/google/callback")
})

router.post("/", (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({user : req.user})
    }
    return res.status(404).json({msg: "error"})
})

router.post("/register", async (req, res) => {
    const {username, password, email} = req.body;

    try {
        let user = await User.findOne({username});
        if (user) {
            return res.json({msg: 'duplicate'})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            username,
            password: hashedPassword,
            email
        })
        await newUser.save()

        const userChat = new UserChats({
            username,
            chatList: []
        })

        await userChat.save()

        return res.json({msg: 'created'})
    } catch (err) {
        console.log(err)
        return res.json({msg : "error"})
    }
})

router.post("/logout", (req, res) => {
    req.logout(err => {
        if (err) return res.status(404).send("error")
        return res.send("logged out")
    })
})

export default router;