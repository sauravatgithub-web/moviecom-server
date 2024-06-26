import { getSockets } from "../lib/helper.js";

export const callCommands = (socket, userSocketIDs) => {
    const user = socket.user;
    if(user && user._id) userSocketIDs.set(user._id.toString(), socket.id);

    socket.on('make-call', ({ chatId, members, user, offer }) => {
        const room = chatId;
        const displayMessage = `Incoming call from ${user.name}`;

        const membersSocket = getSockets(members);
        socket.to(membersSocket).emit('call-request', { members, displayMessage, room, offer });
    });

    socket.on('call-ended-not-recieved', ({ callMembers }) => {
        const membersSocket = getSockets(callMembers);
        socket.to(membersSocket).emit('call-ended-before-recieving');
    })

    socket.on('reject-call', ({callMembers}) => {
        const membersSocket = getSockets(callMembers);
        socket.to(membersSocket).emit('call-rejected');
    })

    socket.on('accept-call', ({callMembers, room, ans}) => {
        const membersSocket = getSockets(callMembers);
        socket.to(membersSocket).emit('call-accepted', {callMembers, room, ans});
    })

    socket.on('peer-negotiation-needed', ({ callMembers, offer }) => {
        const membersSocket = getSockets(callMembers);
        socket.to(membersSocket).emit('peer-negotiation-needed', {callMembers, offer});
    })

    socket.on('peer-negotiation-done', ({ callMembers, ans }) => {
        const membersSocket = getSockets(callMembers);
        socket.to(membersSocket).emit('peer-negotiation-final', {callMembers, ans});
    })

    socket.on('call-ended', ({ callMembers }) => {
        const membersSocket = getSockets(callMembers);
        socket.to(membersSocket).emit('end-call', {callMembers});
    })
}