import express from 'express';
import { 
    acceptRequest, 
    getMyFriends, 
    getMyProfile, 
    getNotifications, 
    logOut, 
    login, 
    newUser, 
    searchUser, 
    sendRequest, 
    saveToken,
    forgetPassword ,
    confirmOTP,
    updateUserProfile,
    setNewPassword
} from '../controllers/user.js'
import { singleAvatar } from '../middlewares/multer.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { 
    acceptRequestValidator, 
    loginValidator, 
    registerValidator, 
    sendRequestValidator, 
    validate 
} from '../lib/validator.js';
const router = express.Router();

router.post('/new', singleAvatar, registerValidator(), validate, newUser);
router.post('/login', loginValidator(), validate, login);
router.post('/send', forgetPassword);
router.post('/confirm', confirmOTP);
router.post('/savetoken', saveToken);
router.post('/setNewPassword', setNewPassword);

router.use(isAuthenticated); 
router.get("/me", getMyProfile);
router.put("/updateUserProfile", updateUserProfile);
router.get("/logOut", logOut);
router.get("/searchUser", searchUser);
router.put("/sendRequest", sendRequestValidator(), validate, sendRequest);
router.put("/acceptRequest", acceptRequestValidator(), validate, acceptRequest);
router.get("/notifications", getNotifications);
router.get('/friends', getMyFriends);

export default router;