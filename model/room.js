import mongoose from 'mongoose';

const AVAILABILITY_STATUS = ['available', 'unavailable'];
const ROOM_TYPES = ['meeting room', 'private office', 'coworking space'];

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
        trim: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
    },
    pricePerHour: {
        type: Number,
        required: true,
        min: 1,
    },
    availabilityStatus: {
        type: String,
        enum: AVAILABILITY_STATUS,
        default: 'available',
        required: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    type: {
        type: String,
        required: true,
        enum: ROOM_TYPES,
        trim: true
    },
    duration: {
        type: Number,
        min: 0,
        default: 0
    },
    workspaceId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkingSpace',
        required: true,
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review', 
    }],
    isBooked: {
        type: Boolean,
        default: false
    },
    amenities: [{
        type: String,
        enum: ['high-speed internet', 'projector', 'whiteboard', 'coffee machine', 'parking', 'food available'],
        default: []
    }],
}, { timestamps: true });

const roomModel = mongoose.model('Room', roomSchema);

export { roomModel, roomSchema };