import updateReviewValidation from '../utils/Validations/models/review/updateReviewValidation.js';
import reviewValidation from '../utils/Validations/models/review/reviewValidation.js';
import validationSchema from '../middlewares/validationSchema.js';
import validateObjectID from '../middlewares/validateObjectID.js';
import isCustomer from '../middlewares/isCustomer.js';
import isOwner from '../middlewares/isOwner.js';
import isAdmin from'../middlewares/isAdmin.js';
import isAuth from '../middlewares/isAuth.js';
import express from 'express';


import {
    createWorkSpaceReview,
    updateWorkSpaceReview,
    deleteWorkSpaceReview,
    getReviewsByWorkspace,
    getReviewsByWorkspaceForCustomer,
    getReviewsByWorkspaceForOwner,
    getReviewsForAdmin
} from '../controllers/review.js'

const router = express.Router();

router.post(
    '/:workspaceId/create',
    [isAuth , validateObjectID('workspaceId') , validationSchema(reviewValidation)],
    createWorkSpaceReview
)

router.put(
    '/:reviewId/update',
    [isAuth , validateObjectID('reviewId') , validationSchema(updateReviewValidation)],
    updateWorkSpaceReview
)

router.delete(
    '/:reviewId/delete',
    [isAuth , validateObjectID('reviewId')],
    deleteWorkSpaceReview
)

router.get(
    '/:workspaceId/all',
    [isAuth , validateObjectID('workspaceId')],
    getReviewsByWorkspace
)

router.get(
    '/:workspaceId/all-customer',
    [isAuth , isCustomer , validateObjectID('workspaceId')],
    getReviewsByWorkspaceForCustomer
)

router.get(
    '/:workspaceId/all-owner',
    [isAuth , isOwner , validateObjectID('workspaceId')],
    getReviewsByWorkspaceForOwner
)

router.get(
    '/all-admin',
    [isAuth , isAdmin],
    getReviewsForAdmin
)

export default router;