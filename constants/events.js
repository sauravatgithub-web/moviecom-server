const ALERT = "ALERT";
const REFETCH_CHATS = "REFETCH_CHATS";

const NEW_MESSAGE_ALERT = "NEW_MESSAGE_ALERT";
const NEW_ATTACHMENT = "NEW_ATTACHMENT";

const NEW_REQUEST = "NEW_REQUEST";
const NEW_NOTIFICATION = "NEW_NOTIFICATION";
const NEW_MESSAGE = "NEW_MESSAGE";

const START_TYPING = "START_TYPING";
const STOP_TYPING = "STOP_TYPING"
const CHAT_JOINED = "CHAT_JOINED";
const CHAT_LEAVED = "CHAT_LEAVED"

const ONLINE_USERS = "ONLINE_USERS";

const MAKE_CALL = 'make-call';
const CALL_REQUEST = 'call-request';
const CALL_ENDED_NOT_RECIEVED = 'call-ended-not-recieved';
const CALL_ENDED_BEFORE_RECIEVING = 'call-ended-before-recieving';

const REJECT_CALL = 'reject-call';
const ACCEPT_CALL = 'accept-call';
const CALL_REJECTED = 'call-rejected';
const CALL_ACCEPTED = 'call-accepted';

const PEER_NEGOTIATION_NEEDED = 'peer-negotiation-needed';
const PEER_NEGOTIATION_DONE = 'peer-negotiation-done';
const PEER_NEGOTIATION_FINAL = 'peer-negotiation-final';

const CALL_ENDED = 'call-ended';
const END_CALL = 'end-call';

const REQUEST_TO_WATCH_MOVIE = 'request-to-watch-movie';
const MOVIE_REQUEST_DECLINED = 'movieRequest-declined';
const MOVIE_REQUEST_ACCEPTED = 'movieRequest-accepted';

const PLAY = 'play';
const PAUSE = 'pause';
const CANCEL = 'cancel';

export { 
    ALERT, 
    NEW_ATTACHMENT, NEW_MESSAGE, NEW_MESSAGE_ALERT, 
    NEW_REQUEST, NEW_NOTIFICATION, 
    REFETCH_CHATS, ONLINE_USERS,
    START_TYPING, STOP_TYPING, CHAT_JOINED, CHAT_LEAVED, 

    MAKE_CALL, CALL_REQUEST, CALL_ENDED_NOT_RECIEVED, CALL_ENDED_BEFORE_RECIEVING, 
    REJECT_CALL, ACCEPT_CALL, CALL_REJECTED, CALL_ACCEPTED, 
    PEER_NEGOTIATION_NEEDED, PEER_NEGOTIATION_DONE, PEER_NEGOTIATION_FINAL, 
    CALL_ENDED, END_CALL,
    
    REQUEST_TO_WATCH_MOVIE, MOVIE_REQUEST_DECLINED, MOVIE_REQUEST_ACCEPTED,
    PLAY, PAUSE, CANCEL
};