import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    content: {
        type: String,
        minlength: 1,
        maxlength: 500,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['reservation', 'promotion', 'system']
    },
    status: {
        type: String,
        enum: ['unread', 'read'],
        default: 'unread'
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const notificationModel = mongoose.model('Notification', notificationSchema);

export { notificationModel, notificationSchema };
