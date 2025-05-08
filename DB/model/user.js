import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from 'config';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,
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
        default: 'customer'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetCode: { 
        type: String 
    },
    resetCodeExpires: { 
        type: Date 
    },
    verificationToken: {
         type: String
    },
    verificationTokenExpires: { 
        type: Date
    },
}, { timestamps: true });

userSchema.methods.generateResetPasswordToken = function () {
    return jwt.sign(
        { _id: this._id, purpose: 'resetPassword' },
        config.get('jwtPrivateKey'),
        { expiresIn: '10m' }
    );
};

userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { _id: this._id, role: this.role }, 
        config.get('jwtPrivateKey'), 
        { expiresIn: '7d' }
    );
};

userSchema.methods.generateVerificationCode = async function () {
    this.resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.resetCodeExpires = Date.now() + 10 * 60 * 1000;
    return this.resetCode;
};

userSchema.methods.generateVerificationToken = async function () {
    this.verificationToken = crypto.randomBytes(32).toString('hex');
    this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await this.save();
    return this.verificationToken;
};

userSchema.methods.generateResetToken = async function () {
    return jwt.sign(
        { email: this.email }, 
        config.get('jwtPrivateKey'), 
        { expiresIn: '15m' }
    );
};

const userModel = mongoose.model('User', userSchema);

export { userModel, userSchema };