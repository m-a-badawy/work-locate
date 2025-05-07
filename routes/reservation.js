
import updateReservationValidation from '../utils/Validations/models/reservation/updateReservationValidation.js';
import confirmArrivalValidation from '../utils/Validations/models/reservation/confirmArrivalValidation.js';
import reservationValidation from '../utils/Validations/models/reservation/reservationValidation.js';
import checkOwnerAdminOrCustomer from '../middlewares/checkOwnerAdminOrCustomer.js';
import validationSchema from '../middlewares/validationSchema.js';
import validateObjectID from '../middlewares/validateObjectID.js';
import isAdminOrIsOwner from '../middlewares/isAdminOrIsOwner.js';
import isCustomer from '../middlewares/isCustomer.js';
import isOwner from '../middlewares/isOwner.js';
import isAdmin from'../middlewares/isAdmin.js';
import isAuth from '../middlewares/isAuth.js';
import express from 'express';
import { 
    getReservationsForCustomer,
    getReservationsForAdmin,
    getReservationsForOwner,
    viewReservationDetails,
    completeReservation,
    approveReservation,
    createReservation,
    updateReservation, 
    cancelReservation,
    confirmArrival
} from '../controllers/reservation.js';

const router = express.Router();

router.post(
    '/:roomId/reserve', 
    [ isAuth, validateObjectID('roomId'),validationSchema(reservationValidation) ],
    createReservation
);

router.post(
    '/:reservationId/complete',
    [isAuth, isAdminOrIsOwner , validateObjectID('reservationId')],
    completeReservation
);

router.post(
    '/:reservationId/arrive',
    [isAuth, isOwner , validateObjectID('reservationId') , validationSchema(confirmArrivalValidation)],
    confirmArrival
)

router.get(
    '/:reservationId/view-reservation',
    [isAuth , validateObjectID('reservationId')],
    viewReservationDetails
)

router.patch(
    '/:reservationId/approve', 
    [isAuth , isOwner , validateObjectID('reservationId')],  
    approveReservation
);

router.get(
    '/customer/my-reservations', 
    [isAuth , isCustomer ],  
    getReservationsForCustomer
);

router.get(
    '/admin/all-reservations', 
    [isAuth , isAdmin ],  
    getReservationsForAdmin
);

router.get(
    '/owner-reservations', 
    [isAuth , isOwner],  
    getReservationsForOwner
);

router.put(
    '/:reservationId/update', 
    [isAuth , checkOwnerAdminOrCustomer , validateObjectID('reservationId') , validationSchema(updateReservationValidation)], 
    updateReservation
);

router.patch(
    '/:reservationId/cancel',
    [isAuth, isCustomer, validateObjectID('reservationId')],
    cancelReservation
);

export default router;
