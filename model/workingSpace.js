import mongoose from 'mongoose';
import ownerSchema from '../model/owner.js';

const workingSpaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    trim: true,
    unique: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 200,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  amenities: {
    type: [String],
    default: [],
  },
  roomCounter: {
    type: Number,
    required: [true, 'Room counter is required'],
    default: 0
  },
  owner: ownerSchema
},{timestamps: true,});

const workingSpaceModel = mongoose.model('WorkingSpace', workingSpaceSchema);


export { workingSpaceModel, workingSpaceSchema };
