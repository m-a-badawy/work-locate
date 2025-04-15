import workingSpace from '../routes/workingSpace.js';
import reservation from '../routes/reservation.js';
import error from '../middlewares/error.js';
import rooms from '../routes/room.js';
import user from '../routes/user.js';
import express from 'express';
/*
/api/admin
/api/payments
/api/notifications
/api/pricing-policies
*/

export default (app) => {
    app.use(express.json());
    //app.use('/api/notification', notification);
    app.use('/api/reservation', reservation);
    app.use('/api/workspace', workingSpace);
    //app.use('/api/payment', payment);
    //app.use('/api/review', review);
    app.use('/api/room', rooms);
    app.use('/api/auth', user);
    app.use(error);
};
