const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const redis = require('redis');
const cors = require('cors');
let RedisStore = require('connect-redis')(session);

const { 
    MONGO_USER, 
    MONGO_PASSWORD, 
    MONGO_IP, 
    MONGO_PORT, 
    REDIS_URL, 
    REDIS_PORT, 
    SESSION_SECRET 
    } = require('./config/config');

let redisClient = redis.createClient({
        host: REDIS_URL,
        port: REDIS_PORT,
    }) 

const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

const connectWithRetry = () => {
    mongoose
    .connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`)
    .then(() => console.log("Successfully connected"))
    .catch((err)=>{
        console.log(err)
        setTimeout(connectWithRetry, 5000);
    });
}

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}))
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 60000,
    },
}))

app.use(express.json())

app.get('/api/v1/', (req,res)=>{
    res.send("<h2>Hi There people</h2>")
    console.log('Yeah it ran')
})

app.use('/api/v1/users', userRouter)
app.use('/api/v1/posts', postRouter)

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`Listening on port ${port}...`)
})