import updatePricingPolicyValidation from '../utils/Validations/models/pricingPolicy/updatePricingPolicyValidation.js';
import pricingPolicyValidation from '../utils/Validations/models/pricingPolicy/pricingPolicyValidation.js';
import validationSchema from '../middlewares/validationSchema.js';
import validateObjectID from '../middlewares/validateObjectID.js';
import isAdminOrIsOwner from '../middlewares/isAdminOrIsOwner.js';
import isAuth from '../middlewares/isAuth.js';
import express from 'express';
import {
  createPolicy,
  updatePolicy,
  deletePolicy,
  applyPolicy,
  getOwnerPolicies,
  FinancialReports,
  getAllSystemPoliciesForAdmin
} from '../controllers/pricingPolicies.js';

const router = express.Router();

router.post(
    '/:workspaceId/create',
    [isAuth , isAdminOrIsOwner , validationSchema(pricingPolicyValidation) , validateObjectID('workspaceId')],
    createPolicy
);

router.put(
    '/:pricingPoliciesId/update',
    [isAuth , isAdminOrIsOwner , validationSchema(updatePricingPolicyValidation) , validateObjectID('pricingPoliciesId')],
    updatePolicy
);

router.delete(
    '/:pricingPoliciesId/delete',
    [isAuth , isAdminOrIsOwner , validateObjectID('pricingPoliciesId')],
    deletePolicy
);

router.patch(
    '/:workspaceId/apply',
    [isAuth , isAdminOrIsOwner , validateObjectID('workspaceId')],
    applyPolicy
);

router.get(
    '/:workspaceId/reports/financial-view',
    [isAuth , isAdminOrIsOwner , validateObjectID('workspaceId')], 
    FinancialReports
);

router.get(
    'all/owner',
    [isAuth, isOwner], 
    getOwnerPolicies
);

router.get(
    'all/admin', 
    [isAuth, isAdmin], 
    getAllSystemPoliciesForAdmin
);

export default router;
