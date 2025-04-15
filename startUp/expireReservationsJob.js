import cron from 'node-cron';
import { reservationModel } from '../DB/model/reservation.js';

export default () => {
    cron.schedule('*/5 * * * *', async () => {
        const now = new Date();

        try {
            const expiredReservations = await reservationModel.find({
                status: 'confirmed',
                expectedArrivalTime: { $lt: now },
                startTime: null
            });

            if (expiredReservations.length > 0) {
                for (const reservation of expiredReservations) {
                    reservation.status = 'expired';
                    await reservation.save();
                    console.log(`Reservation ${reservation._id} marked as expired.`);
                }
            } else {
                console.log(`No expired reservations at ${now}`);
            }
        } catch (err) {
            console.error(`Error checking expired reservations at ${now}:`, err.message || err);
        }
    });
};
