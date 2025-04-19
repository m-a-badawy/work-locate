import { roomModel } from '../DB/model/room.js';
import { userModel } from '../DB/model/user.js';
import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { reservationModel } from '../DB/model/reservation.js';


export async function createReservation(req, res) {
    try {
        const { seatsBooked, minutesToArrive } = req.body;

        const user = await userModel.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const room = await roomModel.findById(req.params.roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found or unavailable.' });

        if (room.availabilityStatus !== 'available') return res.status(400).json({ success: false, message: 'Room is not available for booking.' });

        if (room.availableSeats < seatsBooked) return res.status(400).json({ success: false, message: 'No enough available seats.' });

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
        
        
        await room.reserveSeats(reservation.seatsBooked);
        if (room.availableSeats === 0) room.availabilityStatus = 'unavailable';
        await room.save();

        return res.status(201).json({ success: true,message: 'Reservation request submitted successfully.', populatedReservation });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function approveReservation(req, res) {
    try {
        const reservation = await reservationModel.findById(req.params.reservationId);
        if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });

        if (reservation.status !== 'pending') return res.status(400).json({ success: false, message: 'Reservation is already confirmed or cancelled.' });

        const room = await roomModel.findById(reservation.roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

        reservation.status = 'confirmed';
        await reservation.save();

        const populatedReservation = await reservationModel.findById(reservation._id)
            .populate('roomId', 'name pricePerHour type capacity')
            .populate('customerId', '-_id firstName lastName');

        return res.status(200).json({ success: true, message: 'Reservation approved.', reservation: populatedReservation });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function confirmArrival(req, res) {
    try {
        const reservation = await reservationModel.findById(req.params.reservationId);
        if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });

        if (reservation.status !== 'confirmed') return res.status(400).json({ success: false, message: 'Reservation is not confirmed yet.' });

        const now = new Date();

        if (now > reservation.expectedArrivalTime) {
            reservation.status = 'expired';
            await reservation.save();
            return res.status(400).json({ success: false, message: 'Reservation expired due to late arrival.' });
        }

        if (reservation.startTime) return res.status(400).json({ success: false, message: 'Arrival already confirmed.' });

        reservation.startTime = now;
        reservation.status = 'active';
        await reservation.save();

        const populatedReservation = await reservationModel.findById(reservation._id)
            .populate('roomId', 'name pricePerHour type capacity')
            .populate('customerId', '-_id firstName lastName');

        return res.status(200).json({ success: true, message: 'Customer arrival confirmed. Timer started.', reservation: populatedReservation });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function completeReservation(req, res) {
    try {

        const reservation = await reservationModel.findOne({
            _id: req.params.reservationId,
            status: 'active' 
        });
        
        if (!reservation) return res.status(404).send('Reservation not found.');

        if (reservation.status !== 'active') return res.status(400).send('Only active reservations can be completed.');
        
        reservation.generateDuration();

        const room = await roomModel.findById(reservation.roomId);
        if (!room) return res.status(404).send('Room not found.');

         reservation.generateTotalPrice(room.pricePerHour);
        await reservation.save();
        await room.releaseSeats(reservation.seatsBooked);

        res.status(200).send(reservation);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function cancelReservation(req, res) {
    try {
        const reservation = await reservationModel.findOne({
            _id: req.params.reservationId,
            customerId: req.user._id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });

        if (reservation.status === 'completed') return res.status(400).json({ success: false, message: 'Cannot cancel a completed reservation.' });

        const room = await roomModel.findById(reservation.roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

        await room.releaseSeats(reservation.seatsBooked);

        reservation.status = 'cancelled';
        await reservation.save();

        const populatedReservation = await reservationModel.findById(reservation._id)
            .populate('roomId', 'name pricePerHour type capacity')
            .populate('customerId', '-_id firstName lastName');

        return res.status(200).json({ success: true, message: 'Reservation cancelled successfully.', reservation: populatedReservation });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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

        if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });

        return res.status(200).json({ success: true, message: 'Reservation details fetched successfully.', reservation });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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

        if (!reservations.length) return res.status(404).json({ success: false, message: 'No reservation history found.' });

        return res.status(200).json({ success: true, message: 'Reservation history retrieved successfully.', reservations });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function getReservationsForOwner(req, res) {
    try {
        const workspaces = await workingSpaceModel.find({ ownerId: req.user._id }).select('_id');
        if (!workspaces.length) return res.status(404).json({ success: false, message: 'No workspaces found for this owner.' });

        const workspaceIds = workspaces.map(ws => ws._id);

        const rooms = await roomModel.find({ workspaceId: { $in: workspaceIds } }).select('_id');
        if (!rooms.length) return res.status(404).json({ success: false, message: 'No rooms found for your workspaces.' });

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

        if (!reservations.length) return res.status(404).json({ success: false, message: 'No reservations found for your rooms.' });

        return res.status(200).json({ success: true, message: 'Reservations retrieved successfully.', data: reservations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function getReservationsForAdmin(req, res) {
    try {
        const reservations = await reservationModel
            .find({})
            .sort({ createdAt: -1 });

        if (!reservations.length) return res.status(404).json({ success: false, message: 'No reservations found.' });

        return res.status(200).json({ success: true, message: 'Reservations retrieved successfully.', data: reservations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function updateReservation(req, res) {
    try {
        const reservation = await reservationModel.findById(req.params.reservationId);

        if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });

        const updatedReservation = await reservationModel.findByIdAndUpdate(
            req.params.reservationId,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        return res.status(200).json({ success: true, message: 'Reservation updated successfully.', reservation: updatedReservation });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}