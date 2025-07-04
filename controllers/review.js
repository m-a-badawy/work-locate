import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { reviewModel } from '../DB/model/review.js';
import { userModel } from '../DB/model/user.js';

export async function createWorkSpaceReview(req, res) {
    try {
      const { rating, comment } = req.body;
  
      const user = await userModel.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found.' });
  
      const workSpace = await workingSpaceModel.findById(req.params.workspaceId);
      if (!workSpace) return res.status(404).json({ message: 'Workspace not found or unavailable.' });
  
      const review = new reviewModel({
        rating,
        comment,
        customerId: req.user._id,
        workspaceId: req.params.workspaceId,
      });
  
      await review.save();
  
      workSpace.reviews.push(review._id);
      await workSpace.save();
  
      await workingSpaceModel.recalculateAverageRating(req.params.workspaceId);
  
      const populatedReview = await reviewModel.findById(review._id)
        .populate('customerId', 'firstName lastName -_id')
        .populate('workspaceId', 'name');
    
      req.app.io.emit('newReview', { review: populatedReview });
  
      return res.status(201).json({ message: 'Review created successfully.', review: populatedReview });
  
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export async function updateWorkSpaceReview(req, res) {
    try {
        const reviewData = { ...req.body };

        const review = await reviewModel.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found.' });

        if (!review.customerId.equals(req.user._id)) return res.status(403).json({ message: 'You are not authorized to update this review.' });

        const updatedReview = await reviewModel.findOneAndUpdate(
            { _id: req.params.reviewId, customerId: req.user._id },
            reviewData,
            { new: true, runValidators: true }
        )
        .populate('customerId', 'firstName lastName -_id')
        .populate('workspaceId', 'name');

        await workingSpaceModel.recalculateAverageRating(updatedReview.workspaceId);

        req.app.io.emit('updateReview', { review: updatedReview });

        return res.status(200).json({ message: 'Review updated successfully.', review: updatedReview });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export async function deleteWorkSpaceReview(req, res) {
    try {
      const review = await reviewModel.findById(req.params.reviewId);
      if (!review) return res.status(404).json({ message: 'Review not found.' });
  
      if (!review.customerId.equals(req.user._id)) return res.status(403).json({ message: 'You are not authorized to delete this review.' });
  
      const workspaceId = review.workspaceId;

      await workingSpaceModel.findByIdAndUpdate(
        workspaceId,
        { $pull: { reviews: review._id } },
        { new: true }
      );
  
      await reviewModel.deleteOne({ _id: review._id });
  
      await workingSpaceModel.recalculateAverageRating(workspaceId);

      req.app.io.emit('deleteReview', { reviewId: review._id, workspaceId });
  
      return res.status(200).json({ message: 'Review deleted successfully.' });
  
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function getReviewsByWorkspace(req, res) {
    try {
        const reviews = await reviewModel.find({ workspaceId: req.params.workspaceId })
            .populate('customerId', 'firstName lastName -_id')
            .populate('workspaceId', 'name');

        if (reviews.length === 0) return res.status(404).json({ message: 'No reviews found for this workspace.' });
        
        req.app.io.emit('fetchReviews', { workspaceId: req.params.workspaceId, reviews });

        return res.status(200).json({ message: 'Reviews fetched successfully.', reviews });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
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

        if (reviews.length === 0) return res.status(404).json({ message: 'No reviews found by this customer for this workspace.' });

        return res.status(200).json({ message: 'Customer reviews for workspace fetched successfully.', reviews });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export async function getReviewsByWorkspaceForOwner(req, res) {
    try {
        const workspaces = await workingSpaceModel.find({ ownerId: req.user._id }).select('_id');

        const workspaceIds = workspaces.map(ws => ws._id);

        if (workspaceIds.length === 0) return res.status(404).json({ message: 'No workspaces found for this owner.'});

        const reviews = await reviewModel.find({ workspaceId: { $in: workspaceIds } })
            .populate('customerId', 'firstName lastName -_id')
            .populate('workspaceId', 'name')
            .sort({ createdAt: -1 });

        if (reviews.length === 0) return res.status(404).json({ message: 'No reviews found for your workspaces.' });

        return res.status(200).json({ message: 'Reviews for owner workspaces fetched successfully.', reviews });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export async function getReviewsForAdmin(req, res) {
    try {
        const reviews = await reviewModel.find({})
            .populate('customerId', 'firstName lastName -_id')
            .populate('workspaceId', 'name')
            .sort({ createdAt: -1 });

        if (reviews.length === 0) return res.status(404).json({ message: 'No reviews found in the system.' });

        return res.status(200).json({ message: 'All reviews fetched successfully.', reviews});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}