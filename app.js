import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import { connectDB } from './utils/features.js';
import { Server } from 'socket.io';
import { corsOptions } from "./constants/config.js";
import cookieParser from 'cookie-parser';
import userRoute from './routes/user.js';
import chatRoute from './routes/chat.js';
import adminRoute from './routes/admin.js';
import { socketAuthenticator } from './middlewares/auth.js';
import { errorMiddleware } from './middlewares/error.js';
import { messagingCommands } from './sockets/messaging.js';
import { callCommands } from './sockets/call.js';

dotenv.config({
    path: "./.env",
})
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
export const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
export const adminSecretKey = process.env.ADMIN_SECRET_KEY || "riemannIntegration";
export const userSocketIDs = new Map();
export const onlineUsers = new Set();

connectDB(mongoURI);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: corsOptions,
});

app.set('io', io);

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use('/api/v1/user', userRoute);
app.use('/api/v1/chat', chatRoute);
app.use('/api/v1/admin', adminRoute);

app.get('/', (req, res) => {
    res.send("I am rocker");
});

io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, 
        async(err) => await socketAuthenticator(err, socket, next)
    );
});

io.on("connection", (socket) => {
    messagingCommands(io, socket, userSocketIDs, onlineUsers);
    callCommands(io, socket, userSocketIDs, onlineUsers);
})

app.use(errorMiddleware);

server.listen(port, () => {
    console.log(`Server is listening at port ${port} in ${envMode}`);
})


