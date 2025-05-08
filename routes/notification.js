import paymentValidation from '../utils/Validations/models/payment/paymentValidation.js';
import validationSchema from '../middlewares/validationSchema.js';
import validateObjectID from '../middlewares/validateObjectID.js';
import isAdminOrIsOwner from '../middlewares/isAdminOrIsOwner.js';
import isOwner from '../middlewares/isOwner.js';
import isAdmin from'../middlewares/isAdmin.js';
import isAuth from '../middlewares/isAuth.js';
import express from 'express';
import {
    sendNotification,
    markAsRead,
    getUnreadNotifications,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.post(
    '/send', 
    [isAuth , isAdminOrIsOwner],
    sendNotification
);

router.patch(
    '/:id/read', 
    isAuth, 
    markAsRead
);

router.get(
    '/unread', 
    isAuth, 
    getUnreadNotifications
);

export default router;
