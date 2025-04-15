import updateWorkingSpaceValidation from '../utils/Validations/models/workingSpace/updateWorkingSpaceValidation.js'
import workingSpaceValidation from '../utils/Validations/models/workingSpace/workingSpaceValidation.js';
import validationSchema from '../middlewares/validationSchema.js';
import validateObjectID from '../middlewares/validateObjectID.js';
import isOwner from '../middlewares/isOwner.js';
import isAuth from '../middlewares/isAuth.js';
import express from 'express';

import {
    viewAllWorkingSpaceDetails, 
    viewWorkingSpaceDetails, 
    createWorkingSpace, 
    updateWorkingSpace, 
    deleteWorkingSpace,
    getRatingAverage
} from '../controllers/workingSpace.js';


const router = express.Router();

router.get(
    '/all',
    isAuth,
    viewAllWorkingSpaceDetails
);

router.get(
    '/:workspaceId',
    [ isAuth , validateObjectID('workspaceId') ],
    viewWorkingSpaceDetails
);

// not completed -> will be implemented when we finish the review route
router.get(
    '/:workspaceId',
    [isAuth , validateObjectID('workspaceId')],
    getRatingAverage
)

router.post(
    '/create',
    [isAuth, isOwner, validationSchema(workingSpaceValidation)],
    createWorkingSpace
);

router.put(
    '/:workspaceId',
    [isAuth, isOwner, validateObjectID('workspaceId'),validationSchema(updateWorkingSpaceValidation)],
    updateWorkingSpace
);

router.delete(
    '/:workspaceId',
    [isAuth, isOwner, validateObjectID('workspaceId')],
    deleteWorkingSpace
);

export default router;