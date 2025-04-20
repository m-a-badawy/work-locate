import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { reviewModel } from '../DB/model/review.js';
import { userModel } from '../DB/model/user.js';

export async function createWorkSpaceReview(req, res) {
    try {
        const { rating, comment } = req.body;

        const user = await userModel.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const workSpace = await workingSpaceModel.findById(req.params.roomId);
        if (!workSpace) return res.status(404).json({ success: false, message: 'Workspace not found or unavailable.' });

        const review = new reviewModel({
            rating,
            comment,
            customerId: req.user._id,
            workspaceId: req.params.roomId
        });

        await review.save();

        const populatedReview = await reviewModel.findById(review._id)
            .populate('customerId', 'firstName lastName -_id')
            .populate('workspaceId', 'name');

        return res.status(201).json({ success: true, message: 'Review created successfully.', review: populatedReview });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function updateWorkSpaceReview(req, res) {
    try {
        const reviewData = { ...req.body };

        const review = await reviewModel.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

        
        if (!review.customerId.equals(req.user._id)) return res.status(403).json({ success: false, message: 'You are not authorized to delete this review.' });

        const updatedReview = await reviewModel.findOneAndUpdate(
            { _id: req.params.reviewId, customerId: req.user._id },
            reviewData,
            { new: true, runValidators: true }
        )
        .populate('customerId', 'firstName lastName -_id')
        .populate('workspaceId', 'name');

        return res.status(200).json({ success: true, message: 'Review updated successfully.', review: updatedReview });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function deleteWorkSpaceReview(req, res) {
    try {
        const review = await reviewModel.findById(req.params.reviewId);
        if (!review)  return res.status(404).json({ success: false, message: 'Review not found.' });

        if (!review.customerId.equals(req.user._id)) return res.status(403).json({ success: false, message: 'You are not authorized to delete this review.' });

        await reviewModel.deleteOne({ _id: review._id });

        return res.status(200).json({ success: true, message: 'Review deleted successfully.' });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function getReviewsByWorkspace(req, res) {
    try {
        const reviews = await reviewModel.find({ workspaceId: req.params.workspaceId })
            .populate('customerId', 'firstName lastName -_id')
            .populate('workspaceId', 'name');

        if (reviews.length === 0) return res.status(404).json({ success: false, message: 'No reviews found for this workspace.' });

        return res.status(200).json({ success: true, message: 'Reviews fetched successfully.', reviews });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function getReviewsByWorkspaceForCustomer(req, res) {
    try {
        const reviews = await reviewModel.find({
            customerId: req.user._id,
            workspaceId: req.params.workspaceId
        })
        .populate('workspaceId', 'name')
        .sort({ createdAt: -1 });

        if (reviews.length === 0) return res.status(404).json({ success: false, message: 'No reviews found by this customer for this workspace.' });

        return res.status(200).json({ success: true,  message: 'Customer reviews for workspace fetched successfully.', reviews });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function getReviewsByWorkspaceForOwner(req, res) {
    try {
        const workspaces = await workingSpaceModel.find({ ownerId: req.user._id }).select('_id');

        const workspaceIds = workspaces.map(ws => ws._id);

        if (workspaceIds.length === 0) return res.status(404).json({ success: false, message: 'No workspaces found for this owner.'});

        const reviews = await reviewModel.find({ workspaceId: { $in: workspaceIds } })
            .populate('customerId', 'firstName lastName -_id')
            .populate('workspaceId', 'name')
            .sort({ createdAt: -1 });

        if (reviews.length === 0) return res.status(404).json({ success: false, message: 'No reviews found for your workspaces.' });

        return res.status(200).json({ success: true, message: 'Reviews for owner workspaces fetched successfully.', reviews });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function getReviewsForAdmin(req, res) {
    try {
        const reviews = await reviewModel.find({})
            .populate('customerId', 'firstName lastName -_id')
            .populate('workspaceId', 'name')
            .sort({ createdAt: -1 });

        if (reviews.length === 0) return res.status(404).json({ success: false, message: 'No reviews found in the system.' });

        return res.status(200).json({ success: true, message: 'All reviews fetched successfully.', reviews});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}