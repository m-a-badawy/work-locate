import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { roomModel } from '../DB/model/room.js';

export async function createRoom(req, res) {
    try {
      const workspace = await workingSpaceModel.findById(req.params.workspaceId);
      if (!workspace) return res.status(404).json({ success: false, message: 'This working space is not available.' });
  
      const roomData = {
        ...req.body,
        workspaceId: req.params.workspaceId,
      };
  
      const room = new roomModel(roomData);
      await room.save();
  
      const populatedRoom = await roomModel.findById(room._id)
        .populate({
          path: 'workspaceId',
          select: 'name',
          populate: {
            path: 'ownerId',
            select: ' -_id firstName lastName'
          }
        });
  
      const workspaceUpdate = await workingSpaceModel.findByIdAndUpdate(
        req.params.workspaceId,
        { $inc: { roomCounter: 1 } },
        { new: true }
      );
  
      if (!workspaceUpdate) return res.status(500).json({ success: false, message: 'Failed to update workspace room counter.' });
  
      res.status(201).json({ success: true, data: populatedRoom });
  
    } catch (err) {
      console.error('Error in createRoom:', err.message || err);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
}

export async function viewAllRooms(req, res) {
    try {
      const workspace = await workingSpaceModel.findById(req.params.workspaceId);
      if (!workspace) return res.status(404).json({ success: false, message: 'This working space is not available.' });
  
      const rooms = await roomModel
        .find({ workspaceId: req.params.workspaceId })
        .sort('name')
        .populate({
          path: 'workspaceId',
          select: 'name',
          populate: {
            path: 'ownerId',
            select: '-_id firstName lastName'
          }
        });
  
      if (!rooms || rooms.length === 0) return res.status(404).json({ success: false, message: 'No rooms found for this workspace.' });
  
      res.status(200).json({ success: true, data: rooms });
  
    } catch (err) {
        console.error('Error in viewAllRooms:', err.message || err);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
}

export async function viewAvailableRooms(req, res) {
    try {
      const workspace = await workingSpaceModel.findById(req.params.workspaceId);
      if (!workspace) return res.status(404).json({ success: false, message: 'This working space is not available.'});
  
      const rooms = await roomModel.find({
        workspaceId: req.params.workspaceId,
        availabilityStatus: 'available'
      })
      .sort('name')
      .populate({
        path: 'workspaceId',
        select: 'name',
        populate: {
          path: 'ownerId',
          select: 'firstName lastName -_id'
        }
      });
  
      if (!rooms || rooms.length === 0) return res.status(404).json({ success: false, message: 'No available rooms found.'});
  
      res.status(200).json({ success: true, count: rooms.length, data: rooms });
      
    } catch (err) {
      console.error('Error in viewAvailableRooms:', err.message || err);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
}

export async function viewUnavailableRooms(req, res) {
    try {
      const workspace = await workingSpaceModel.findById(req.params.workspaceId);
      if (!workspace) return res.status(404).json({ success: false, message: 'This working space is not available.'});
  
      const rooms = await roomModel.find({
        workspaceId: req.params.workspaceId,
        availabilityStatus: 'unavailable'
      })
      .sort('name')
      .populate({
        path: 'workspaceId',
        select: 'name',
        populate: {
          path: 'ownerId',
          select: 'firstName lastName -_id'
        }
      });
  
      if (!rooms || rooms.length === 0) return res.status(404).json({ success: false, message: 'No unavailable rooms found.'});
  
      res.status(200).json({success: true, count: rooms.length, data: rooms });
  
    } catch (err) {
      console.error('Error in viewUnavailableRooms:', err.message || err);
      res.status(500).json({success: false, message: 'Something went wrong. Please try again later.'});
    }
} 

export async function checkAvailability(req, res) {
    try {
      const workspace = await workingSpaceModel.findById(req.params.workspaceId);
      if (!workspace) return res.status(404).json({ success: false, message: 'This working space is not available.' });

  
      const room = await roomModel.findOne({
        _id: req.params.roomId,
        workspaceId: req.params.workspaceId
      }).populate({
        path: 'workspaceId',
        select: 'name',
        populate: {
          path: 'ownerId',
          select: 'firstName lastName -_id'
        }
      });
  
      if (!room) return res.status(404).json({ success: false, message: 'Room not found in this workspace.' });
  
      const { name, availabilityStatus, type, capacity, workspaceId } = room;
      const { name: workspaceName, ownerId } = workspaceId;
      const { firstName, lastName } = ownerId;
  
      res.status(200).json({
        success: true,
        room: { name, availabilityStatus, type, capacity, workspaceName, owner: { firstName, lastName } }
      });
  
    } catch (err) {
      console.error('Error in checkAvailability:', err.message || err);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
}  

export async function updateRoomDetails(req, res) {
    try {
      const workspace = await workingSpaceModel.findById(req.params.workspaceId);
      if (!workspace) return res.status(400).json({ success: false, message: 'This working space is not available.' });
  
      const roomData = { ...req.body, workspaceId: req.params.workspaceId };
  
      const room = await roomModel.findOneAndUpdate(
        { _id: req.params.roomId, workspaceId: req.params.workspaceId },
        roomData,
        { new: true, runValidators: true }
      ).populate({
        path: 'workspaceId',
        select: 'name',
        populate: { path: 'ownerId', select: 'firstName lastName -_id' }
      });
  
      if (!room) return res.status(404).json({ success: false, message: 'Room not found in this workspace.' });
  
      res.status(200).json({ success: true, data: room });
    } catch (err) {
      console.error('Error in updateRoomDetails:', err.message || err);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
}

export async function deleteRoom(req, res) {
    try {
        const workspace = await workingSpaceModel.findById(req.params.workspaceId);
        if (!workspace) return res.status(400).send('This working space is not available...');

        const room = await roomModel.findOneAndDelete({ 
            _id: req.params.roomId, 
            workspaceId: req.params.workspaceId 
        });
        if (!room) return res.status(404).send('Room not found in this workspace.');

        await workingSpaceModel.findByIdAndUpdate(req.params.workspaceId, {
            $inc: { roomCounter: -1 }
        }, { new: true });

        res.status(200).json({ success: true, message: 'The room has been deleted.' });
    } catch (err) {
        console.error('Error in deleteRoom:', err.message || err);
        res.status(500).send('Something went wrong. Please try again later.');
    }
}

