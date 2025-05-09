    import mongoose from 'mongoose';

    const AVAILABILITY_STATUS = ['available', 'unavailable'];
    const ROOM_TYPES = ['meeting', 'Personal', 'shared space' , 'cabin'];

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
        availableSeats: { 
            type: Number,
        },
        availabilityStatus: {
            type: String,
            enum: AVAILABILITY_STATUS,
            default: 'available',
            required: true,
        },
        roomImages: {
            type: [String] , required: true
        },
        type: {
            type: String,
            required: true,
            enum: ROOM_TYPES,
            trim: true
        },
        workspaceId: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WorkingSpace',
            required: true,
        },
        amenities: {
            type: [String],
            default: []
        },
}, { timestamps: true });

// This is a Mongoose pre-save middleware that runs before saving a document to the database.
roomSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('capacity')) {
        this.availableSeats = this.capacity;
    }
    next();
});

roomSchema.methods.reserveSeats = async function(seats) {
    this.availableSeats -= seats;
    if (this.availableSeats === 0) this.availabilityStatus = 'unavailable';
    await this.save();
};

roomSchema.methods.releaseSeats = async function(seats) {
    this.availableSeats += seats;
    if (this.availableSeats > this.capacity) this.availableSeats = this.capacity;
    if (this.availableSeats > 0) this.availabilityStatus = 'available';
    await this.save();
};

const roomModel = mongoose.model('Room', roomSchema);
export { roomModel };
