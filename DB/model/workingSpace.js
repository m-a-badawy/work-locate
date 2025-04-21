import mongoose from 'mongoose';

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
  averageRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 0,
  },
  amenities: {
    type: [String],
    default: [],
  },
  roomCounter: {
    type: Number,
    required: true,
    default: 0
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review', 
    required: true,
  }]
},{timestamps: true});

const workingSpaceModel = mongoose.model('WorkingSpace', workingSpaceSchema);

export { workingSpaceModel, workingSpaceSchema };
