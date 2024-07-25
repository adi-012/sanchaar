import MongoStore from "connect-mongo";
import session from "express-session";
import dotenv from "dotenv"

dotenv.config()
const mongo_url = process.env.MONGODB_URL

export default session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl:mongo_url, collectionName: 'sessions'})
})