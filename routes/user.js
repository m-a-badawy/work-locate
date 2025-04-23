import updateUserProfileValidation from '../utils/Validations/models/user/updateUserProfileValidation.js';
import verificationCodeValidation from '../utils/Validations/models/user/verificationCodeValidation.js';
import forgetPasswordValidation from '../utils/Validations/models/user/forgetPasswordValidation.js';
import changePasswordValidation from '../utils/Validations/models/user/changePasswordValidation.js';
import resetPasswordValidation from '../utils/Validations/models/user/resetPasswordValidation.js';
import registerValidation from '../utils/Validations/models/user/registrationValidation.js';
import loggingValidation from '../utils/Validations/models/user/loggingValidation.js';
import emailVerificationPasswordReset from '../middlewares/email.js';
import validationSchema from '../middlewares/validationSchema.js';
import resetAuth from "../middlewares/resetAuth.js";
import isAdmin from '../middlewares/isAdmin.js';
import isOwner from '../middlewares/isOwner.js';
import isAuth from '../middlewares/isAuth.js';
import express from 'express';


/*
    observation: in this module we don't need to verify the user id because
    we will depends on the token which contain the decoded value of the user
*/

import {
    viewUsersForSpecificOwnerInSpecificWorkspace,
    viewAllUsersForAdmin,
    viewAccountDetails,
    deactivateAccount,
    verifyResetCode,
    forgotPassword, 
    changePassword,
    resetPassword,
    updateProfile,
    verifyUser,
    register, 
    login
} from '../controllers/user.js';

const router = express.Router();

/*
observation: We don’t need a logout API because we use stateless JWT authentication. 
             The client is responsible for clearing the token from storage. 
*/

router.post(
    '/login',
    validationSchema(loggingValidation),
    login
);

router.post(
    '/register',
    validationSchema(registerValidation), 
    register,
    emailVerificationPasswordReset
);

router.get(
    '/verify-email',
     verifyUser
);

router.post(
    '/forget-Password',
    validationSchema(forgetPasswordValidation),
    forgotPassword,
    emailVerificationPasswordReset
);

router.post(
    '/verify-code',
    validationSchema(verificationCodeValidation),
    verifyResetCode
);

router.post(
    '/reset-password',
     [resetAuth, validationSchema(resetPasswordValidation)],
    resetPassword
);

router.get(
    '/profile',
    isAuth,
    viewAccountDetails
);

router.put(
    '/update-profile',
    [isAuth, validationSchema(updateUserProfileValidation)],
    updateProfile
);

router.delete(
    '/deactivate-profile',
    isAuth,
    deactivateAccount
);

router.post(
    '/change-password',
    [isAuth, validationSchema(changePasswordValidation)],
    changePassword
);

router.get(
    '/:workspaceId/customers',
    [isAuth, isOwner],
    viewUsersForSpecificOwnerInSpecificWorkspace
);

router.get(
    '/admin/users',
    [isAuth, isAdmin],
    viewAllUsersForAdmin
);

export default router;