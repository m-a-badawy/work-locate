import paymentValidation from '../utils/Validations/models/payment/paymentValidation.js';
import validationSchema from '../middlewares/validationSchema.js';
import validateObjectID from '../middlewares/validateObjectID.js';
import isAdminOrIsOwner from '../middlewares/isAdminOrIsOwner.js';
import isOwner from '../middlewares/isOwner.js';
import isAdmin from'../middlewares/isAdmin.js';
import isAuth from '../middlewares/isAuth.js';
import express from 'express';
import {
  processPayment,
  refundPayment,
  getPaymentDetails,
  getPaymentHistory,
  getAllPaymentsForOwner,
  getAllPaymentsForAdmin
} from '../controllers/payment.js';


const router = express.Router();

router.post(
    '/:reservationId/process', 
    [isAuth,validateObjectID('reservationId'),validationSchema(paymentValidation)], 
    processPayment
);

router.patch(
    '/refund/:paymentId',
    [isAuth , isOwner , validateObjectID('paymentId')],
    refundPayment
);

router.get(
    '/history',
    [isAuth],
    getPaymentHistory
);

router.get(
    '/:paymentId',
    [isAuth , validateObjectID('paymentId')],
    getPaymentDetails
);

router.get(
    '/all/admin',
    [isAuth , isAdmin],
    getAllPaymentsForAdmin
);

router.get(
    '/all/owner',
    [isAuth,isOwner],
    getAllPaymentsForOwner
);

export default router;
