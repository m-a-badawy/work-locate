import roomValidation from '../utils/Validations/models/room/roomValidation.js';
import setImageEntityType from '../middlewares/ImagesEntityType.js';
import validationSchema from '../middlewares/validationSchema.js';
import validateObjectID from '../middlewares/validateObjectID.js';
import isAdminOrIsOwner from '../middlewares/isAdminOrIsOwner.js';
import isAdmin from '../middlewares/isAdmin.js';
import isOwner from '../middlewares/isOwner.js';
import isAuth from '../middlewares/isAuth.js';
import upload from '../utils/multer.js';
import express from 'express';

import {
    viewAllRoomsForSpecificWorkspace,
    viewAllRoomsForAdmin,
    viewUnavailableRooms,
    viewAvailableRooms,
    updateRoomDetails,
    checkAvailability,
    deleteRoom,
    createRoom,
} from '../controllers/room.js';

const router = express.Router();

router.get(
    '/:workspaceId/all',
    validateObjectID('workspaceId'),
    viewAllRoomsForSpecificWorkspace
)

router.get(
    '/:workspaceId/available',
    validateObjectID('workspaceId'),
    viewAvailableRooms
)

router.get(
    '/:workspaceId/unavailable',
    validateObjectID('workspaceId'),
    viewUnavailableRooms
)

router.get(
    '/:workspaceId/:roomId/availability',
    validateObjectID('workspaceId', 'roomId'),
    checkAvailability
)

router.post(
    '/:workspaceId/create',
    [isAuth, isOwner, validateObjectID('workspaceId'),validationSchema(roomValidation), setImageEntityType('room') , upload.array('roomImages' , 10)],
    createRoom
)

router.put(
    '/:workspaceId/:roomId',
    [isAuth, isAdminOrIsOwner , validateObjectID('workspaceId', 'roomId'),validationSchema(roomValidation) , setImageEntityType('room') , upload.array('roomImages' , 10)],
    updateRoomDetails
)

router.delete(
    '/:workspaceId/:roomId',
    [isAuth, isOwner,validateObjectID('workspaceId','roomId'),],
    deleteRoom
)

router.get(
    '/all-admin',
    [isAuth, isAdmin],
    viewAllRoomsForAdmin
)

export default router;