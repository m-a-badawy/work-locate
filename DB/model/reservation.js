import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seatsBooked: {
        type: Number,
        required: true
    },
    startTime: {
        type: Date,
        default: null
    },
    endTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number,
        default: 0
    },
    expectedArrivalTime: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 86400 }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'expired', 'completed', 'cancelled'],
        default: 'pending'
    },
    totalPrice: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

reservationSchema.methods.generateDuration = function () {
    if (!this.startTime) throw new Error("Cannot calculate duration: startTime is missing.");
    if (!this.endTime) this.endTime = new Date();

    let hours = (this.endTime - this.startTime) / (1000 * 60 * 60);
    this.duration = Math.max(1, Math.round(hours));
};

reservationSchema.methods.generateTotalPrice = function (pricePerHour) {
    this.totalPrice = this.duration * pricePerHour * this.seatsBooked;
};

const reservationModel = mongoose.model('Reservation', reservationSchema);
export { reservationModel };
