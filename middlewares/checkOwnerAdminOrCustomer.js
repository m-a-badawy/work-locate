import { reservationModel } from "../DB/model/reservation.js";

export default async (req, res, next) => {
    try {
        const reservation = await reservationModel.findById(req.params.reservationId);

        if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });

        const isAdmin = req.user.role === 'admin';
        const isOwner = req.user.role === 'owner';
        const isCustomer = reservation.customerId.toString() === req.user._id;

        if (!isAdmin && !isOwner && !isCustomer) return res.status(403).json({ success: false, message: 'Access denied. You are not allowed to perform this action.' });
        req.reservation = reservation;

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
