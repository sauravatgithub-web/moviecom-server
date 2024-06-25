import mongoose, { Schema, model, Types } from 'mongoose';
const schema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        groupChat: {
            type: Boolean,
            default: false,
        },
        creator: {
            type: Types.ObjectId,
            ref: "User",        
        },
        members: [ 
            {
                type: Types.ObjectId,
                ref: "User",
            }
        ],
        avatar: {
            type: Map,
            of: String,
        },
        movies: [
            {
                url: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                }
            },
        ]
    },
    {
        timestamps: true,
    }
);

export const Chat = mongoose.models.Chat || model("Chat", schema);