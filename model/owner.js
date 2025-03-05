import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    trim: true
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  }
}, { timestamps: true });

export default ownerSchema;
