import LocalStrategy from "passport-local";
import User from "../models/User.js";
import bcrypt from "bcrypt"

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