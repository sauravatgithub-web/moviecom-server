import jwt from "jsonwebtoken";
import mongoose from "mongoose"
import { v4 as uuid } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { getBase64, getSockets } from "../lib/helper.js";

const cookieOption = {
    maxAge: 15 * 24 * 60 * 60 * 1000, 
    sameSite: "none", 
    httpOnly: true, 
    secure: true, 
}

const connectDB = (uri) => {
    mongoose
        .connect(uri, {dbName : "moviecom"})
        .then((data) => console.log(`Connected to DB: ${data.connection.host}`))
        .catch((err) => {
            throw err;
        });
};

const sendToken = (res, user, code, message) => {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    return res.status(code).cookie("app-token", token, cookieOption).json({
        success: true, user,
        message,
    })
}

const emitEvent = (req, event, users, data) => {
    try {
        const io = req.app?.get("io");
        if(!io) console.log("Socket.io instance not availaible")
        const usersSockets = getSockets(users);
        io.to(usersSockets).emit(event, data);
        console.log("Event emitted successfully", event);
    }
    catch (error) {console.log(error)}
};

const uploadFilesFromCloudinary = async(files = []) => {
    const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                getBase64(file),
                {
                    resource_type: "auto",
                    public_id: uuid(),
                },
                (error, result) => {
                    if(error) return reject(error);
                    resolve(result);
                }
            )
        })
    });

    try {
        const results = await Promise.all(uploadPromises);

        const formattedResults = results.map((result) => ({
            public_id: result.public_id,
            url: result.secure_url,
        }));
        return formattedResults;
    }
    catch(error) {
        throw new Error(`Error uploading files to Cloudinary: ${error.message}`);
    }
}

const deleteFilesFromCloudinary = async (public_ids) => {

}

export { cookieOption, connectDB, deleteFilesFromCloudinary, emitEvent, sendToken, uploadFilesFromCloudinary };