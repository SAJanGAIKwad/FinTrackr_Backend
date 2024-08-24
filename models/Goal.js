import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    targetAmount: {
        type: Number,
        required: true,
    },
    currentAmount: {
        type: Number,
        default: 0,
    },
    deadline: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isAchieved: {
        type: Boolean,
        default: false
    },
});

export default mongoose.model('Goal', GoalSchema);
