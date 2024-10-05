import bcrypt from 'bcrypt'
import dotenv from 'dotenv';
import { User } from '../models/user.js'
import { Chat } from '../models/chat.js';
import { Request } from '../models/request.js'
import { getOtherMember } from '../lib/helper.js';
import { tryCatch } from '../middlewares/error.js';
import { ErrorHandler, sendEmail } from '../utils/utility.js';
import { NEW_NOTIFICATION, NEW_REQUEST, REFETCH_CHATS } from '../constants/events.js';
import { cookieOption, emitEvent, sendToken, uploadFilesFromCloudinary } from '../utils/features.js';

dotenv.config();
const emailTokens = {};

const sendOTP = async(email, message, next) => {
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const expirationTime = new Date(Date.now() + (2 * 60 * 60 * 1000));
    const sharedToken = `${otp}`;
  
    try {
        await sendEmail(email, message, sharedToken);
        emailTokens[email] = {otp, expirationTime};
    } 
    catch (error) {
        next(new ErrorHandler("Failed to send OTP email", 500));
    }
}

const confirmOTP = tryCatch(async(req, res, next) => {
    const { email, otp } = req.body;
    if(!email || !otp)
      return next(new ErrorHandler("Please fill all fields", 404));
  
    const sharedOTP = emailTokens[email];
  
    if(sharedOTP && sharedOTP.otp == otp && Date.now() < sharedOTP.expirationTime) {
      return res.status(200).json({ success: true, message: "OTP has been successfully verified." });
    }
    else if(sharedOTP && sharedOTP.otp != otp) {
      return res.status(400).json({ success: false, message: "Incorrect OTP entered." });
    }
    else return res.status(400).json({ success: false, message: "OTP expired." });
})

const setNewPassword = tryCatch(async (req, res, next) => {
    const {email, password} = req.body;
    if(!email || !password) return next(new ErrorHandler("Please enter all fields"));

    const user = await User.findOne({ email }).select("+password");;
    if(!user) return next(new ErrorHandler("Incorrect username"));

    user.password = password;
    await user.save();
    console.log(user.password);

    return res.status(200).json({ success: true, message: "Password changed successfully" });
})
 
const newUser = tryCatch(async (req, res, next) => {
    const {name, username, password, email} = req.body;

    const file = req.file;
    if(!file) return next(new ErrorHandler('Please upload avatar'));

    const result = await uploadFilesFromCloudinary([file]);

    const avatar = {
        public_id: result[0].public_id,
        url: result[0].url,
    };

    const user = await User.create({
        name,
        username,
        password,
        avatar,
        email,
    });

    sendToken(res, user, 200, `Welcome to moviecom`);
});

const login = tryCatch(async(req, res, next) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return next(new ErrorHandler("Username and password are required", 404));
    }

    const user = await User.findOne({ username }).select("+password");
    if(!user) return next(new ErrorHandler("Invalid credentials", 404));

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return next(new ErrorHandler("Invalid credentials", 404));

    sendToken(res, user, 200, `Welcome back, ${user.name}`);
    return user;
})

const forgetPassword = tryCatch(async(req, res, next) => {
    const { username } = req.body;
    if(!username) return next(new ErrorHandler("Please fill all the fields", 404));
  
    const user = await User.findOne({ username }).select("+password");
    if(!user) return next(new ErrorHandler("User do not exists", 404));
    
    const email = user.email;
    sendOTP(email, "Forget Password", next);
    return res.status(200).json({ success: true });
})

const saveToken = tryCatch(async(req, res, next) => {
    const { token, user } = req.body;
    if(!token) return next(new ErrorHandler("No token recieved", 404));
    const userOrigin = await User.findById(user._id);
    if(userOrigin.fcmTokens.length !== 0) return res.status(200).json({ message: "Token is already present" });
    userOrigin.fcmTokens.push(token);
    try {
        await userOrigin.save();
        return res.status(200).json({ success: true, message: "Token saved in database "});
    }
    catch(err) {return res.status(404).json({ success: false, message: err.message })}
})


const getMyProfile = tryCatch(async(req, res) => {
    const user = await User.findById(req.user);  
    res.status(200).json({
        success: true,
        user
    })
});

const updateUserProfile = tryCatch(async(req, res) => {
    const { userId, about } = req.body;
    const user = await User.findById(userId);
    if(!user) return next(new ErrorHandler("Incorrect user id"));

    user.bio = about;
    await user.save();
    return res.status(200).json({ success : true, message : "Bio updated successfully" });
})

const logOut = tryCatch(async(req, res) => {
    return res
        .status(200)
        .cookie('app-token', "", { ...cookieOption, maxAge: 0})
        .json ({
            success: true,
            message: "Logged out successfully",
        });
});

const searchUser = tryCatch(async(req, res) => {
    const {name = ""} = req.query;

    const myChats = await Chat.find({ groupChat: false, members: req.user });
    const allUserFromChats = myChats.flatMap((chat) => chat.members); 
    const allUsersToExclude = [ ...allUserFromChats, req.user ]
    
    const otherUsers = await User.find({ 
        _id: { $nin: allUsersToExclude },
        name: { $regex: name, $options: "i" },
    }); 
    const users = otherUsers.map(({ _id, name, avatar }) => ({
        _id,
        name, 
        avatar: avatar.url,
    }))

    res.status(200).json({ success: true, users: users });
})

const sendRequest = tryCatch(async(req, res, next) => {
    const { userId } = req.body;
    const request = await Request.findOne({
        $or: [
            { sender: req.user, reciever: userId },
            { sender: userId, reciever: req.user },
        ],
    });
    if(request) return next(new ErrorHandler("Request already sent", 400));

    const sender = await User.findById(req.user);
    const reciever = await User.findById(userId);
    if(!sender || !reciever) return next(new ErrorHandler("User not found", 400));

    await Request.create({
        sender: req.user,
        reciever: userId,
        avatar: {
            [sender._id] : sender.avatar.url,
            [userId] : reciever.avatar.url, 
        }
    })

    emitEvent(req, NEW_REQUEST, [userId]);
    emitEvent(req, NEW_NOTIFICATION, [userId]);

    res.status(200).json({ success: true, message: "Request sent successfully" })
})

const acceptRequest = tryCatch(async(req, res, next) => {
    const { requestId, accept } = req.body;
    const request = await Request.findById(requestId)
        .populate('sender', "name")
        .populate('reciever', 'name')

    if(request.reciever._id.toString() !== req.user.toString()) 
        return next(new ErrorHandler("You are unauthorized to do it.", 404));

    if(!accept) {
        await request.deleteOne();
        return res.status(200).json({ success: true, message: "Friend request rejected" })
    }

    const members = [request.sender._id, request.reciever._id];
    await Promise.all([
        Chat.create({
            members, 
            name: `${request.sender.name}-${request.reciever.name}`,
            avatar: request.avatar
        }),
        request.deleteOne(),
    ]);

    emitEvent(req, REFETCH_CHATS, members);

    return res.status(200).json({ success: true, message: "Friend Request Accepted", senderId: request.sender._id })
})

const getNotifications = tryCatch(async(req, res) => {
    const requests = await Request.find({ reciever: req.user }).populate("sender", "name avatar");
    const allRequests = requests.map(({ _id, sender }) => ({
        _id: _id,
        sender: sender
    }))
    return res.status(200).json({ success: true, requests: allRequests })
})

const getMyFriends = tryCatch(async(req, res) => {
    const chatId = req.query.chatId;

    const chats = await Chat.find({
        members: req.user,
        groupChat: false,
    }).populate("members", "name avatar");

    const friends = chats.map(({members}) => {
        const otherUser = getOtherMember(members, req.user);
        return {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar.url
        }
    });

    if(chatId) {
        const chat = await Chat.findById(chatId);
        const availaibleFriends = friends.filter((friend) => !chat.members.includes(friend._id));
        return res.status(200).json({ success: true, friends: availaibleFriends })
    }
    else {
        return res.status(200).json({ success: true, friends })
    }
})

export { 
    acceptRequest, 
    getMyProfile, 
    getNotifications, 
    getMyFriends, 
    login, 
    logOut, 
    newUser, 
    searchUser, 
    sendRequest, 
    saveToken, 
    forgetPassword,
    confirmOTP,
    updateUserProfile,
    setNewPassword
};