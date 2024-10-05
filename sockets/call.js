import { getSockets } from "../lib/helper.js";
import { 
    MAKE_CALL, CALL_REQUEST,
    CALL_ENDED_BEFORE_RECIEVING, CALL_ENDED_NOT_RECIEVED,
    ACCEPT_CALL, CALL_ACCEPTED, CALL_REJECTED, REJECT_CALL,
    PEER_NEGOTIATION_DONE, PEER_NEGOTIATION_FINAL, PEER_NEGOTIATION_NEEDED,
    CALL_ENDED, END_CALL, 
} from "../constants/events.js";

export const callCommands = (socket, userSocketIDs) => {
    const user = socket.user;
    if(user && user._id) userSocketIDs.set(user._id.toString(), socket.id);

    socket.on(MAKE_CALL, ({ chatId, members, user, offer }) => {
        const room = chatId;
        const displayMessage = `Incoming call from ${user.name}`;

        const membersSocket = getSockets(members);
        socket.to(membersSocket).emit(CALL_REQUEST, { members, displayMessage, room, offer });
    });

    socket.on(CALL_ENDED_NOT_RECIEVED, ({ callMembers }) => {
        const membersSocket = getSockets(callMembers);
        socket.to(membersSocket).emit(CALL_ENDED_BEFORE_RECIEVING);
    })

    socket.on(REJECT_CALL, ({ callMembers }) => {
        const membersSocket = getSockets(callMembers);
        socket.to(membersSocket).emit(CALL_REJECTED);
    })

    socket.on(ACCEPT_CALL, ({ callMembers, room, ans }) => {
        const membersSocket = getSockets(callMembers);
        socket.to(membersSocket).emit(CALL_ACCEPTED, {callMembers, room, ans});
    })

    socket.on(PEER_NEGOTIATION_NEEDED, ({ callMembers, offer }) => {
        const membersSocket = getSockets(callMembers);
        socket.to(membersSocket).emit(PEER_NEGOTIATION_NEEDED, {callMembers, offer});
    })

    socket.on(PEER_NEGOTIATION_DONE, ({ callMembers, ans }) => {
        const membersSocket = getSockets(callMembers);
        socket.to(membersSocket).emit(PEER_NEGOTIATION_FINAL, {callMembers, ans});
    })

    socket.on(CALL_ENDED, ({ callMembers }) => {
        const membersSocket = getSockets(callMembers);
        socket.to(membersSocket).emit(END_CALL, {callMembers});
    })
}