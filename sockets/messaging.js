import CryptoJS from 'crypto-js';
import { v4 as uuid } from 'uuid';

import { 
    ALERT, 
    NEW_MESSAGE, NEW_MESSAGE_ALERT, 
    NEW_REQUEST, ONLINE_USERS, REFETCH_CHATS, 
    CHAT_JOINED, CHAT_LEAVED, START_TYPING, STOP_TYPING
} from "../constants/events.js";

import { getSockets } from "../lib/helper.js";
import { Message } from "../models/message.js";

export const messagingCommands = (io, socket, userSocketIDs, onlineUsers) => {
    const user = socket.user;
    if(user && user._id) userSocketIDs.set(user._id.toString(), socket.id);
    
    socket.on(NEW_MESSAGE, async({ chatId, members, message }) => {
        const messageForRealTime = {
            content: message,
            _id: uuid(),
            sender: {
                _id: user._id,
                name: user.name,
            },
            chat: chatId,
            createdAt: new Date().toISOString()
        }
        const messageForDB = {
            content: CryptoJS.AES.encrypt(message, process.env.MESSAGE_SECRET).toString(),
            sender: user._id,
            chat: chatId,
        }

        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime, 
        })
        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

        try {await Message.create(messageForDB)} catch(error) { console.log(error) };        
    })

    socket.on(START_TYPING, ({ members, chatId }) => {
        const membersSocket = getSockets(members);
        socket.to(membersSocket).emit(START_TYPING, { chatId })
    })

    socket.on(STOP_TYPING, ({ members, chatId }) => {
        const membersSocket = getSockets(members);
        socket.to(membersSocket).emit(STOP_TYPING, { chatId })
    })

    socket.on(NEW_REQUEST, (members) => {
        console.log("abcd");
        console.log(members);
    })

    socket.on(ALERT, ({ members, chatId }) => {
        const membersSocket = getSockets(members);
        socket.to(membersSocket).emit(ALERT, { chatId })
    })

    socket.on(REFETCH_CHATS, ({ members, chatId }) => {
        const membersSocket = getSockets(members);
        socket.to(membersSocket).emit(REFETCH_CHATS, { chatId })
    })

    socket.on(CHAT_JOINED, ({ userId, members }) => {
        onlineUsers.add(userId.toString());
        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
    })

    socket.on(CHAT_LEAVED, ({ userId, members }) => {
        onlineUsers.delete(userId.toString());
        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
    })
    
    socket.on("disconnect", () => {
        userSocketIDs.delete(user._id.toString());
        onlineUsers.delete(user._id.toString());
        socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
    })
}