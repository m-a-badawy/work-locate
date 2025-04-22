import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { userModel } from '../DB/model/user.js';

export async function createWorkingSpace(req, res) {
  try {

    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(400).json({success: false , message: 'This owner is not available.'});

    const workingSpace = new workingSpaceModel({
      ...req.body,
      ownerId: req.user._id,
    });

    await workingSpace.save();

    const populatedWorkingSpace = await workingSpaceModel
      .findById(workingSpace._id)
      .populate('ownerId', '-_id firstName lastName');

    res.status(201).json({success: true , populatedWorkingSpace});
  } catch (err) {
    console.error('Error in createWorkingSpace:', err.message || err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

export async function viewAllWorkingSpaceDetails(req, res) {
  try {
    const workingSpaces = await workingSpaceModel
      .find()
      .sort('name')
      .populate('ownerId', ' -_id firstName lastName')
      .populate('reviews' , 'rating comment');

    res.status(200).json({ success: true, data: workingSpaces });
  } catch (err) {
      console.error('Error in viewAllWorkingSpaceDetails:', err.message || err);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

export async function viewWorkingSpaceDetails(req, res) {
    try {
      const workingSpace = await workingSpaceModel
        .findById(req.params.workspaceId)
        .populate('ownerId', '-_id firstName lastName')
        .populate('reviews', 'rating comment');

      if (!workingSpace) return res.status(404).json({ success: false, message: 'Workspace not found' });

  
      res.status(200).json({ success: true, workingSpace });
  
    } catch (err) {
      console.error('Error in viewWorkingSpaceDetails:', err.message || err);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
};

export async function getRatingAverage(req, res) {
  try {
    const workSpace = await workingSpaceModel.findById(req.params.workspaceId);
    
    if (!workSpace) return res.status(404).json({ success: false, message: 'Workspace not found.' });

    return res.status(200).json({ success: true, averageRating: workSpace.averageRating });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateWorkingSpace(req, res) {
    try {
      const updatedData = { ...req.body };
  
      const workingSpace = await workingSpaceModel.findByIdAndUpdate(
        req.params.workspaceId,
        updatedData,
        { new: true, runValidators: true }
      )
      .populate('ownerId', 'firstName lastName -_id')
      .populate('reviews', 'rating comment');
  
      if (!workingSpace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }
  
      res.status(200).json({ success: true, workingSpace });
      
    } catch (err) {
      console.error('Error in updateWorkingSpace:', err.message || err);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
};

export async function deleteWorkingSpace(req, res) {
    try {
      const workingSpace = await workingSpaceModel.findByIdAndDelete(req.params.workspaceId);
  
      if (!workingSpace) {
        return res.status(404).json({ success: false, message: 'Workspace not found' });
      }
  
      res.status(200).json({ success: true, message: 'The workspace has been deleted.' });
      
    } catch (err) {
      console.error('Error in deleteWorkingSpace:', err.message || err);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
};