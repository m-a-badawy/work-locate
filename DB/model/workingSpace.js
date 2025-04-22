import { reviewModel } from '../../DB/model/review.js';
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

workingSpaceSchema.statics.recalculateAverageRating = async function (workspaceId) {
  try {
    const result = await reviewModel.aggregate([
      { $match: { workspaceId: mongoose.Types.ObjectId(workspaceId) } },
      { $group: { _id: null, average: { $avg: "$rating" } } },
    ]);

    const average = result.length > 0 ? result[0].average : null;

    await this.findByIdAndUpdate(workspaceId, { averageRating: average });

  } catch (error) {
    console.error('Error in recalculateAverageRating:', error.message || error);
  }
};


workingSpaceSchema.post('save', function() {
  this.constructor.recalculateAverageRating(this._id); 
});

workingSpaceSchema.post('findOneAndUpdate', function() {
  if (this._id) this.constructor.recalculateAverageRating(this._id);
});

workingSpaceSchema.post('findOneAndDelete', function() {
  if (this._id) this.constructor.recalculateAverageRating(this._id);
});

const workingSpaceModel = mongoose.model('WorkingSpace', workingSpaceSchema);

export { workingSpaceModel, workingSpaceSchema };
