import LocalStrategy from "passport-local";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/User.js";
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import UserChat from "../models/UserChats.js";

dotenv.config()

export default function(passport) {
    passport.use(new LocalStrategy(
        async function verify(username, password, cb) {
            try {
                const user = await User.findOne({username});
                if (!user) {
                    return cb(null, false, {msg: 'no such user'})
                }
                if (!bcrypt.compareSync(password, user.password)) {
                    return cb(null, false, {msg: 'incorrect password'})
                }
                return cb(null, user)
            } catch (err) {
                return cb(err);
            }
        }
    ))

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID ,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `http://localhost:${process.env.PORT}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
        const userData = profile._json
        try {
            const user = await User.findOne({username: userData.name})
            if (!user) {
                console.log(userData)
                const newUser = new User({
                    username: userData.name,
                    email: userData.email,
                    googleID: userData.sub
                })
                await newUser.save()

                const userChat = new UserChat({
                    username: userData.name,
                    chatList: []
                })

                await userChat.save()

                return done(null, newUser)
            } else {
                return done(null, user)
            }
        } catch(e) {
            return done(e)
        }
    }
    ))

    passport.serializeUser(function(user, cb) {
        process.nextTick(() => {
            return cb(null, {id: user.id, username: user.username})
        })
    })

    passport.deserializeUser((user, cb) => {
        process.nextTick(() => {
            return cb(null, user)
        })
    })
}