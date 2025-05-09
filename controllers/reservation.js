import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { reservationModel } from '../DB/model/reservation.js';
import { roomModel } from '../DB/model/room.js';
import { userModel } from '../DB/model/user.js';

export async function createReservation(req, res) {
    try {
        const { seatsBooked, minutesToArrive } = req.body;

        const user = await userModel.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const room = await roomModel.findById(req.params.roomId);
        if (!room) return res.status(404).json({ message: 'Room not found or unavailable.' });

        if (room.availabilityStatus !== 'available') return res.status(400).json({ message: 'Room is not available for booking.' });

        if (room.availableSeats < seatsBooked) return res.status(400).json({ message: 'No enough available seats.' });

        const now = new Date();
        const expectedArrivalTime = new Date(now.getTime() + minutesToArrive * 60000);

        const reservation = new reservationModel({
            roomId: room._id,
            customerId: user._id,
            expectedArrivalTime,
            seatsBooked,
        }); 

        await reservation.save();

        const populatedReservation = await reservationModel.findById(reservation._id)
            .populate('roomId','name pricePerHour type capacity')
            .populate('customerId','-_id firstName lastName');
        
        req.io.to(room.ownerId.toString()).emit('reservationCreated', populatedReservation);
        
        await room.reserveSeats(reservation.seatsBooked);
        if (room.availableSeats === 0) room.availabilityStatus = 'unavailable';
        await room.save();

        return res.status(201).json({ populatedReservation });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export async function approveReservation(req, res) {
    try {
        const reservation = await reservationModel.findById(req.params.reservationId);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });

        if (reservation.status !== 'pending') return res.status(400).json({ message: 'Reservation is already confirmed or cancelled.' });

        const room = await roomModel.findById(reservation.roomId);
        if (!room) return res.status(404).json({ message: 'Room not found.' });

        reservation.status = 'confirmed';
        await reservation.save();

        const populatedReservation = await reservationModel.findById(reservation._id)
            .populate('roomId', 'name pricePerHour type capacity')
            .populate('customerId', '-_id firstName lastName');

        
        req.io.to(reservation.customerId.toString()).emit('reservationApproved', populatedReservation);

        return res.status(200).json({ populatedReservation });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export async function confirmArrival(req, res) {
    try {
        const reservation = await reservationModel.findById(req.params.reservationId);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });

        if (reservation.status !== 'confirmed') return res.status(400).json({ message: 'Reservation is not confirmed yet.' });

        const now = new Date();

        if (now > reservation.expectedArrivalTime) {
            reservation.status = 'expired';
            await reservation.save();
            return res.status(400).json({ message: 'Reservation expired due to late arrival.' });
        }

        if (reservation.startTime) return res.status(400).json({ message: 'Arrival already confirmed.' });

        reservation.startTime = now;
        reservation.status = 'active';
        await reservation.save();

        const populatedReservation = await reservationModel.findById(reservation._id)
            .populate('roomId', 'name pricePerHour type capacity')
            .populate('customerId', '-_id firstName lastName');

        
        req.io.to(reservation.customerId.toString()).emit('arrivalConfirmed', populatedReservation);

        return res.status(200).json({ populatedReservation });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export async function completeReservation(req, res) {
    try {
        const reservation = await reservationModel.findOne({
            _id: req.params.reservationId,
            status: 'active'
        });

        if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });

        if (reservation.status !== 'active') return res.status(400).json({ message: 'Only active reservations can be completed.' });

        reservation.generateDuration();

        const room = await roomModel.findById(reservation.roomId);
        if (!room) return res.status(404).json({ message: 'Room not found.' });

        reservation.generateTotalPrice(room.pricePerHour);
        reservation.status = 'completed';

        await reservation.save();
        await room.releaseSeats(reservation.seatsBooked);

        const populatedReservation = await reservationModel.findById(reservation._id)
            .populate({
                path: 'roomId',
                select: 'name type pricePerHour capacity workspaceId',
                populate: {
                    path: 'workspaceId',
                    select: 'name location'
                }
            })
            .populate('customerId', 'name email phone');

            req.io.to(reservation.customerId.toString()).emit('reservationCompleted', populatedReservation);
            req.io.to(room.ownerId.toString()).emit('reservationCompleted', populatedReservation);

        return res.status(200).json({ populatedReservation });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function cancelReservation(req, res) {
    try {
        const reservation = await reservationModel.findOne({
            _id: req.params.reservationId,
            customerId: req.user._id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });

        if (reservation.status === 'completed') return res.status(400).json({ message: 'Cannot cancel a completed reservation.' });

        const room = await roomModel.findById(reservation.roomId);
        if (!room) return res.status(404).json({ message: 'Room not found.' });

        await room.releaseSeats(reservation.seatsBooked);

        reservation.status = 'cancelled';
        await reservation.save();

        const populatedReservation = await reservationModel.findById(reservation._id)
            .populate('roomId', 'name pricePerHour type capacity')
            .populate('customerId', '-_id firstName lastName');

        req.io.to(reservation.customerId.toString()).emit('reservationCancelled', populatedReservation);
        req.io.to(room.ownerId.toString()).emit('reservationCancelled', populatedReservation);

        return res.status(200).json({ populatedReservation });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function viewReservationDetails(req, res) {
    try {
        const reservation = await reservationModel.findOne({
            _id: req.params.reservationId,
            customerId: req.user._id
        })
        .populate({
            path: "roomId",
            select: "name capacity availabilityStatus type amenities availableSeats",
            populate: {
                path: "workspaceId",
                select: "name location address description"
            }
        })
        .populate('customerId', 'name email phone -_id');

        if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });

        return res.status(200).json({ reservation });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export async function getReservationsForCustomer(req, res) {
    try {
        const reservations = await reservationModel
            .find({ customerId: req.user._id })
            .populate({
                path: 'roomId',
                select: 'name workspaceId',
                populate: {
                    path: 'workspaceId',
                    select: 'name location'
                }
            })
            .sort({ createdAt: -1 });

        if (!reservations.length) return res.status(404).json({ message: 'No reservation history found.' });

        return res.status(200).json({ reservations });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function getReservationsForOwner(req, res) {
    try {
        const workspaces = await workingSpaceModel.find({ ownerId: req.user._id }).select('_id');
        if (!workspaces.length) return res.status(404).json({ message: 'No workspaces found for this owner.' });

        const workspaceIds = workspaces.map(ws => ws._id);

        const rooms = await roomModel.find({ workspaceId: { $in: workspaceIds } }).select('_id');
        if (!rooms.length) return res.status(404).json({ message: 'No rooms found for your workspaces.' });

        const roomIds = rooms.map(room => room._id);

        const reservations = await reservationModel
            .find({ roomId: { $in: roomIds } })
            .populate({
                path: 'roomId',
                select: 'name workspaceId',
                populate: {
                    path: 'workspaceId',
                    select: 'name location'
                }
            })
            .populate('customerId', 'name email -_id')
            .sort({ createdAt: -1 });

        if (!reservations.length) return res.status(404).json({ message: 'No reservations found for your rooms.' });

        return res.status(200).json({ reservations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

export async function getReservationsForAdmin(req, res) {
    try {
        const reservations = await reservationModel
            .find({})
            .sort({ createdAt: -1 });

        if (!reservations.length) return res.status(404).json({ success: false, message: 'No reservations found.' });

        return res.status(200).json({ reservations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

export async function updateReservation(req, res) {
    try {
        const reservation = await reservationModel.findById(req.params.reservationId);

        if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });

        const updateFields = {};

        if (req.body.minutesToArrive !== undefined) updateFields.expectedArrivalTime = new Date(Date.now() + req.body.minutesToArrive * 60000);

        if (req.body.seatsBooked !== undefined) updateFields.seatsBooked = req.body.seatsBooked;

        await reservationModel.findByIdAndUpdate(
            req.params.reservationId,
            { $set: updateFields },
            { runValidators: true }
        );

        const populatedReservation = await reservationModel
            .findById(req.params.reservationId)
            .populate({
                path: 'roomId',
                select: 'name capacity type pricePerHour workspaceId',
                populate: {
                    path: 'workspaceId',
                    select: 'name location address'
                }
            })
            .populate('customerId', 'firstName lastName email');

        return res.status(200).json({ populatedReservation });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}