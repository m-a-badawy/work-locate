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
    getUnreadNotifications,
    sendNotification,
    markAsRead
} from '../controllers/notification.js';

const router = express.Router();

router.post(
    '/send', 
    [isAuth , isAdminOrIsOwner , validationSchema(notificationValidation)],
    sendNotification
);

router.put(
    '/:notificationId/markAsRead',
    [isAuth , validateObjectID('notificationId') , validationSchema(notificationValidation)],
    markAsRead
);

router.get(
    '/unread',
    isAuth,
    getUnreadNotifications
);

export default router;
