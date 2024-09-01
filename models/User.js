import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true }, // Added mobile number field
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
