import { getSockets } from "../lib/helper.js";

export const movieCommands = (io, socket, userSocketIDs, onlineUsers) => {
    const user = socket.user;
    if(user && user._id) userSocketIDs.set(user._id.toString(), socket.id);

    socket.on('watch-movie-request', ({ chatName, members, movie }) => {
        const displayMessage = `${chatName} wants to watch ${movie.name} together with you.`;
        const membersSocket = getSockets(members);
        socket.to(membersSocket).emit('request-to-watch-movie', {displayMessage, members, movie});
    })

    socket.on('movie-request-declined', ({ movieMembers }) => {
        const membersSocket = getSockets(movieMembers);
        socket.to(membersSocket).emit('movieRequest-declined');
    })

    socket.on('movie-request-accepted', ({ movieMembers, movie }) => {
        const membersSocket = getSockets(movieMembers);
        io.to(membersSocket).emit('movieRequest-accepted', {movieMembers, movie});
    })

    socket.on('play', ({ movieMembers, time }) => {
        const membersSocket = getSockets(movieMembers);
        socket.to(membersSocket).emit('play', {time});
    })

    socket.on('pause', ({ movieMembers, time }) => {
        const membersSocket = getSockets(movieMembers);
        socket.to(membersSocket).emit('pause', {time});
    })

    socket.on('cancel', ({ movieMembers }) => {
        const membersSocket = getSockets(movieMembers);
        socket.to(membersSocket).emit('cancel');
    })
}