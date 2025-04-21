import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        minlength: 5,
        maxlength: 500,
        required: false,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkingSpace',
        required: true
    }
}, { timestamps: true });

const reviewModel = mongoose.model('Review', reviewSchema);

export { reviewModel, reviewSchema };
