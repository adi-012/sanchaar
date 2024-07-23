import MongoStore from "connect-mongo";
import session from "express-session";

export default session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl:"mongodb://localhost:2717/chatapp", collectionName: 'sessions'})
})