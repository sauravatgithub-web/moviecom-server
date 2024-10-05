import { getSockets } from "../lib/helper.js";
import { 
    MOVIE_REQUEST_ACCEPTED, MOVIE_REQUEST_DECLINED, REQUEST_TO_WATCH_MOVIE,
    PAUSE, PLAY, CANCEL
} from "../constants/events.js";

export const movieCommands = (io, socket, userSocketIDs, onlineUsers) => {
    const user = socket.user;
    if(user && user._id) userSocketIDs.set(user._id.toString(), socket.id);

    socket.on('watch-movie-request', ({ chatName, members, movie }) => {
        const displayMessage = `${chatName} wants to watch ${movie.name} together with you.`;
        const membersSocket = getSockets(members);
        socket.to(membersSocket).emit(REQUEST_TO_WATCH_MOVIE, {displayMessage, members, movie});
    })

    socket.on('movie-request-declined', ({ movieMembers }) => {
        const membersSocket = getSockets(movieMembers);
        socket.to(membersSocket).emit(MOVIE_REQUEST_DECLINED);
    })

    socket.on('movie-request-accepted', ({ movieMembers, movie }) => {
        const membersSocket = getSockets(movieMembers);
        io.to(membersSocket).emit(MOVIE_REQUEST_ACCEPTED, {movieMembers, movie});
    })

    socket.on(PLAY, ({ movieMembers, time }) => {
        const membersSocket = getSockets(movieMembers);
        socket.to(membersSocket).emit(PLAY, {time});
    })

    socket.on(PAUSE, ({ movieMembers, time }) => {
        const membersSocket = getSockets(movieMembers);
        socket.to(membersSocket).emit(PAUSE, {time});
    })

    socket.on(CANCEL, ({ movieMembers }) => {
        const membersSocket = getSockets(movieMembers);
        socket.to(membersSocket).emit(CANCEL);
    })
}