import { hash } from 'bcrypt';
import mongoose, { Schema, model } from 'mongoose';
const schema = new Schema(
    {   
        bio: {
            type: String,
        },
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            select: false, 
        },
        avatar: {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            }
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/.+\@.+\..+/, 'Please fill a valid email address']
        },
        fcmTokens: {
            type: [String],
            default: [],
        }
    },
    {
        timestamps: true,
    }
);

schema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await hash(this.password, 10);
})

export const User = mongoose.models.User || model("User", schema);