import { reviewModel } from './review';
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

workspaceSchema.statics.recalculateAverageRating = async function (workspaceId) {

  const reviews = await reviewModel.findById({ workspaceId   });

  const average = reviews.length === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await this.findByIdAndUpdate(workspaceId, {averageRating: average.toFixed(1) });
};

reviewSchema.post('save', function() {
  this.constructor.recalculateAverageRating(this.workspaceId);
});

reviewSchema.post('findOneAndUpdate', function() {
  this.constructor.recalculateAverageRating(this.workspaceId);
});

reviewSchema.post('findOneAndDelete', function() {
  this.constructor.recalculateAverageRating(this.workspaceId);
});


const workingSpaceModel = mongoose.model('WorkingSpace', workingSpaceSchema);

export { workingSpaceModel, workingSpaceSchema };
