import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, },
    password: { type: String, required: true, },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isUser: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
    imageUrl: { type: String, default: "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small_2x/user-profile-icon-free-vector.jpg" },
}, { timestamps: true })

const User = mongoose.model("Users", UserSchema, 'users');
export default User;