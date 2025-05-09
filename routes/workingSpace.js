import updateWorkingSpaceValidation from '../utils/Validations/models/workingSpace/updateWorkingSpaceValidation.js'
import workingSpaceValidation from '../utils/Validations/models/workingSpace/workingSpaceValidation.js';
import validationSchema from '../middlewares/validationSchema.js';
import validateObjectID from '../middlewares/validateObjectID.js';
import ImagesEntityType from '../middlewares/ImagesEntityType.js';
import isOwner from '../middlewares/isOwner.js';
import isAuth from '../middlewares/isAuth.js';
import upload from '../utils/multer.js';
import express from 'express';

import {
    viewAllWorkingSpaceDetailsForAdminOwnerCustomer, 
    viewWorkingSpaceDetails, 
    createWorkingSpace, 
    updateWorkingSpace, 
    deleteWorkingSpace,
    getRatingAverage
} from '../controllers/workingSpace.js';


const router = express.Router();

router.get(
    '/all',
    viewAllWorkingSpaceDetailsForAdminOwnerCustomer
);

router.get(
    '/:workspaceId',
    [ validateObjectID('workspaceId') ],
    viewWorkingSpaceDetails
);

router.get(
    '/:workspaceId',
    [validateObjectID('workspaceId')],
    getRatingAverage
)

router.post(
    '/create',
    [isAuth, isOwner, validationSchema(workingSpaceValidation) , ImagesEntityType('workspace') , upload.single('workspaceImage')],
    createWorkingSpace
);

router.put(
    '/:workspaceId',
    [isAuth, isOwner, validateObjectID('workspaceId'),validationSchema(updateWorkingSpaceValidation) , ImagesEntityType('workspace') , upload.single('workspaceImage')],
    updateWorkingSpace
);

router.delete(
    '/:workspaceId',
    [isAuth, isOwner, validateObjectID('workspaceId')],
    deleteWorkingSpace
);

export default router;