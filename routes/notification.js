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
    getNotificationsForAdmin,
} from '../controllers/notification.js';

const router = express.Router();

router.post(
    '/:workspaceId/:customerId/send', 
    [isAuth , isAdminOrIsOwner , validateObjectID('customerId' , 'workspaceId') , validationSchema(notificationValidation)],
    sendNotification
);

router.patch(
    '/:notificationId/read',
    [isAuth , validateObjectID('notificationId')],
    markAsRead
);

router.get(
    '/unread',
    [isAuth ],
    getUnreadNotifications
);

router.get(
    '/:workspaceId/all/owner',
    [isAuth , isOwner , validateObjectID('workspaceId')],
    getOwnerNotifications
);

router.get(
    '/all/admin',
    [isAuth, isAdmin],
    getNotificationsForAdmin
);

export default router;