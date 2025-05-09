import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { userModel } from '../DB/model/user.js';

export async function createWorkingSpace(req, res) {
  try {
    const imagePath = req.files?.path;

    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(400).json({message: 'This owner is not available.'});

    const workingSpace = new workingSpaceModel({
      ...req.body,
      workspaceImage: imagePath,
      ownerId: req.user._id,
    });

    await workingSpace.save();

    const populatedWorkingSpace = await workingSpaceModel
      .findById(workingSpace._id)
      .populate('ownerId', '-_id firstName lastName');

    req.io.to(req.user._id.toString()).emit('workspaceCreated', populatedWorkingSpace);

  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

export async function viewAllWorkingSpaceDetailsForAdminOwnerCustomer(req, res) {
  try {
    const workingSpaces = await workingSpaceModel
      .find()
      .sort('name')
      .populate('ownerId', ' -_id firstName lastName')
      .populate('reviews' , 'rating comment');

    res.status(200).json({ workingSpaces });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

export async function viewWorkingSpaceDetails(req, res) {
    try {
      const workingSpace = await workingSpaceModel
        .findById(req.params.workspaceId)
        .populate('ownerId', '-_id firstName lastName')
        .populate('reviews', 'rating comment');

      if (!workingSpace) return res.status(404).json({ message: 'Workspace not found' });

  
      res.status(200).json({ workingSpace });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export async function getRatingAverage(req, res) {
  try {
    const workSpace = await workingSpaceModel.findById(req.params.workspaceId);
    
    if (!workSpace) return res.status(404).json({ message: 'Workspace not found.' });

    return res.status(200).json({ averageRating: workSpace.averageRating });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

export async function updateWorkingSpace(req, res) {
  try {
    const imagePath = req.files?.path;
    const updatedData = { ...req.body };

    if (imagePaths) updatedData.workspaceImage = imagePath;

    const workingSpace = await workingSpaceModel.findByIdAndUpdate(
      req.params.workspaceId,   
      updatedData,               
      { new: true, runValidators: true }
    )
    .populate('ownerId', 'firstName lastName -_id')  
    .populate('reviews', 'rating comment');

    if (!workingSpace) return res.status(404).json({ message: 'Workspace not found' });

    res.status(200).json({ workingSpace });

    req.io.to(workingSpace.ownerId._id.toString()).emit('workspaceUpdated', workingSpace);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

export async function deleteWorkingSpace(req, res) {
    try {
      const workingSpace = await workingSpaceModel.findByIdAndDelete(req.params.workspaceId);
  
      if (!workingSpace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
  
      res.status(200).json({ message: 'The workspace has been deleted.' });

      req.io.to(workingSpace.ownerId.toString()).emit('workspaceDeleted', {
        workspaceId: req.params.workspaceId
      });
      
    } catch (err) {
      console.error(err);
      res.status(500).json({  message: 'Something went wrong. Please try again.' });
    }
};