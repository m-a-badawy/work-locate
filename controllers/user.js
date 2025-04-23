import { userModel } from '../DB/model/user.js';
import config  from 'config';
import bcrypt from 'bcrypt';


export async function register(req, res, next) {
    try {
        const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.status(400).json({success: false , message: 'This user is already registered.'});

        if (password !== confirmPassword) return res.status(400).send({success: false , message: 'Confirm password field must match the password field.'});

        const user = new userModel({ firstName, lastName, email, phone, password });

        const verificationToken = await user.generateVerificationToken();

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        req.emailOptions = {
            from: config.get('email.user'),
            to: user.email,
            subject: 'Verify Your Email',
            html: `<p>Click <a href="${verificationToken}">here</a> to verify your email.</p>`,
        };

        res.status(200).json({success: true , message: 'Verification link sent to your email.'});

        return next();
    } catch (err) {
        console.error('Error in register:', err.message || err);
        res.status(500).json({success: false , message: err.message });
    }    
}

export async function verifyUser(req, res) {
    try {
        const { verificationToken } = req.query;

        if (!verificationToken) return res.status(400).json({ success: false, message: 'Invalid verification link.' });

        const user = await userModel.findOne({ 
            verificationToken: verificationToken, 
            verificationTokenExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });
        if (user.isVerified)return res.status(400).json({ success: false, message: 'This email is already verified.' });

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await user.save();

        res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.' });

    } catch (err) {
        console.error('Error in verifyUser:', err.message || err);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
}

export async function login(req , res) {
    try{
        const { email, password } = req.body;
    
        const user = await userModel.findOne({ email });

        if (!user || !await bcrypt.compare(password, user.password)) return res.status(400).json({success: false , message: 'Invalid email or password.'});
        if (!user.isVerified) return res.status(403).json({success: false , message: 'Please verify your email first.'});
        if (!user.isActive) user.isActive = true;

        await user.save();

        const token = user.generateAuthToken();
        res.status(200).send(token);
    } catch(err){
        console.error('Error in login:', err.message || err);
        res.status(500).json({success: false , message: err.message });
    }
}

export async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: 'User not found.' });

        const verificationCode = await user.generateVerificationCode();

        await user.save();

        req.emailOptions = {
            to: user.email,
            subject: 'Password Reset Verification Code',
            text: `Your verification code is: ${verificationCode}`,
            html: `<p>Your password reset verification code is:</p> <h3>${verificationCode}</h3> <p>This code is valid for 10 minutes.</p>`,
        };
        
        res.status(200).json({ success: true , message: "'Password reset instructions sent to your email.'" });
        return next();

    } catch (err) {
        console.error('Error in forgotPassword:', err.message || err);
        res.status(500).json({ success: false, message: 'Something went wrong, please try again.' });
    }
}

export async function verifyResetCode(req, res) { 
    try {
        const { verificationCode } = req.body;

        const user = await userModel.findOne({ 
            resetCode: verificationCode, 
            resetCodeExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });


        const token = user.generateResetPasswordToken();

        await user.save();

        res.status(200).json({ success: true, message: 'Verification successful. Proceed to reset password.' , token });

    } catch (err) {
        console.error('Error in verifyResetCode:', err.message || err);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
}

export async function resetPassword(req, res) {
    try {
        const { newPassword, confirmPassword } = req.body;
        
        const user = await userModel.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        if (newPassword !== confirmPassword) return res.status(400).json({ success: false, message: 'Confirm password must match new password.' });

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) return res.status(400).json({ success: false, message: 'New password cannot be the same as the old password.' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        user.resetCode = null;
        user.resetCodeExpires = null;
        await user.save();
        res.status(200).json({ success: true, message: 'Password reset successfully.' });

    } catch (err) {
        console.error('Error in resetPassword:', err.message || err);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
}

export async function changePassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await userModel.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordCorrect) return res.status(400).json({ success: false, message: 'Incorrect old password.' });

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) return res.status(400).json({ success: false, message: 'The new password should not be the same as the old one.' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully.' });

    } catch (err) {
        console.error('Error in changePassword:', err.message || err);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
}

export async function viewAccountDetails(req, res) {
    const user = await userModel.findById(req.user._id)
            .select(' -_id -password -isVerified -verificationToken -verificationTokenExpires -resetCode -resetCodeExpires -deletionScheduledAt -__v');
    if (!user) return res.status(404).send('User not found.');
    return res.status(200).send(user);
}

export async function updateProfile(req, res) {
    const { lastName, firstName, email, phone} = req.body;
    const user = await userModel.findByIdAndUpdate(
        req.user._id,
        { firstName, lastName, email, phone },
        { new: true }
    ).select(' -_id -password -isVerified -verificationToken -verificationTokenExpires -resetCode -resetCodeExpires -deletionScheduledAt -__v -isActive -createdAt -lastLogin');
    if (!user) return res.status(404).send('User not found.');
    res.status(200).send(user);
}

export async function deactivateAccount(req, res) {
    try {
        const user = await userModel.findOne({ _id: req.user._id, isActive: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found or already deactivated.' });
        
        user.isActive = false;
        await user.save();

        res.status(200).json({ success: true, message: 'Account deactivated successfully.' , deletionDate: user.deletionScheduledAt});
    } catch (err) {
        console.error('Error in deactivateAccount:', err.message || err);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
}

export async function viewAllUsersForAdmin(req, res) {
    try {
      const users = await userModel.find({}, '-password -__v');
      if (!users.length) return res.status(404).json({ success: false, message: 'No users found.' });
  
      res.status(200).json({ success: true, data: users });
    } catch (err) {
      console.error('Error in viewAllUsers:', err.message || err);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
}

export async function viewUsersForSpecificOwnerInSpecificWorkspace(req, res) {
  try {

    const workspace = await workingSpaceModel.findOne({ _id: req.params.workspaceId, ownerId:req.user._id });
    if (!workspace)return res.status(404).json({ success: false, message: 'Workspace not found or does not belong to this owner.' });

    const rooms = await roomModel.find({ workspaceId: req.params.workspaceId }, '_id');
    const roomIds = rooms.map(room => room._id);

    const reservations = await reservationModel.find({ roomId: { $in: roomIds } }, 'customerId');

    const customerIds = [...new Set(reservations.map(r => r.customerId.toString()))];

    const customers = await userModel.find(
      { _id: { $in: customerIds } },
      'firstName lastName email phone'
    );

    if (!customers.length) return res.status(404).json({ success: false, message: 'No customers found for this workspace.' });

    res.status(200).json({ success: true, data: customers });
  } catch (err) {
    console.error('Error in viewUsersForSpecificOwnerInSpecificWorkspace:', err.message || err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
}




