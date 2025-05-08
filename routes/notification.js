import notificationValidation from '../utils/Validations/models/notification/notificationValidation.js';
import validationSchema from '../middlewares/validationSchema.js';
import validateObjectID from '../middlewares/validateObjectID.js';
import isAdminOrIsOwner from '../middlewares/isAdminOrIsOwner.js';
import isCustomer from '../middlewares/isCustomer.js';
import isOwner from '../middlewares/isOwner.js';
import isAdmin from'../middlewares/isAdmin.js';
import isAuth from '../middlewares/isAuth.js';
import express from 'express';
import {
    markAsRead,
    sendNotification,
    getOwnerNotifications,
    getUnreadNotifications,
    getUnreadNotificationsForAdmin,
} from '../controllers/notification.js';

const router = express.Router();

router.post(
    ':customerId/send', 
    [isAuth , isAdminOrIsOwner , validateObjectID('customerId') , validationSchema(notificationValidation)],
    sendNotification
);

router.patch(
    '/:notificationId/read',
    isAuth,
    markAsRead
);

router.get(
    '/unread', 
    [isAuth, isCustomer],
    getUnreadNotifications
);

router.get(
    '/all/admin',
    [isAuth, isAdmin],
    getUnreadNotificationsForAdmin
);

router.get(
    '/all/owner', 
    {isAuth , isOwner},
    getOwnerNotifications
);

export default router;