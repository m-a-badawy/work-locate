import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from 'config';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    phone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 20,
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    role: { 
        type: String,
        enum: ['customer', 'admin', 'owner'],
        required: true,
        default: 'customer'
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id, role: this.role }, config.get('jwtPrivateKey'), {
        expiresIn: '7d',
    });
};

const userModel = mongoose.model('users', userSchema);

export { userModel, userSchema };
