import { workingSpaceModel } from '../DB/model/workingSpace.js'; 
import { roomModel } from '../DB/model/room.js'; 
 
export async function createRoom(req, res) { 
    try { 
      const workspace = await workingSpaceModel.findById(req.params.workspaceId); 
      if (!workspace) return res.status(404).json({ message: 'This working space is not available.' }); 
   
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
   
      if (!workspaceUpdate) return res.status(500).json({ message: 'Failed to update workspace room counter.' }); 

      req.io.to(`workspace_${req.params.workspaceId}`).emit('roomCreated', populatedRoom);
   
      res.status(201).json({ populatedRoom }); 
   
    } catch (error) { 
      console.error(error);
      res.status(500).json({ message: 'Something went wrong. Please try again later.' }); 
    } 
} 
 
export async function viewAllRoomsForSpecificWorkspace(req, res) { 
    try { 
      const workspace = await workingSpaceModel.findById(req.params.workspaceId); 
      if (!workspace) return res.status(404).json({ message: 'This working space is not available.' }); 
   
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
   
      if (!rooms || rooms.length === 0) return res.status(404).json({ message: 'No rooms found for this workspace.' }); 
   
      res.status(200).json({ rooms }); 
   
    } catch (error) { 
        console.error(error);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' }); 
    } 
} 
 
export async function viewAvailableRooms(req, res) { 
    try { 
      const workspace = await workingSpaceModel.findById(req.params.workspaceId); 
      if (!workspace) return res.status(404).json({ message: 'This working space is not available.'}); 
   
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
   
      if (!rooms || rooms.length === 0) return res.status(404).json({ message: 'No available rooms found.'}); 
   
      res.status(200).json({ count: rooms.length, data: rooms }); 
       
    } catch (error) { 
      console.error(error); 
      res.status(500).json({ message: 'Something went wrong. Please try again later.' }); 
    } 
} 
 
export async function viewUnavailableRooms(req, res) { 
    try { 
      const workspace = await workingSpaceModel.findById(req.params.workspaceId); 
      if (!workspace) return res.status(404).json({ message: 'This working space is not available.'}); 
   
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
   
      if (!rooms || rooms.length === 0) return res.status(404).json({ message: 'No unavailable rooms found.'}); 
   
      res.status(200).json({ count: rooms.length, data: rooms }); 
   
    } catch (error) { 
      console.error(error);
      res.status(500).json({ message: 'Something went wrong. Please try again later.'}); 
    } 
}  
 
export async function checkAvailability(req, res) { 
    try { 
      const workspace = await workingSpaceModel.findById(req.params.workspaceId); 
      if (!workspace) return res.status(404).json({ message: 'This working space is not available.' }); 
 
   
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
   
      if (!room) return res.status(404).json({ message: 'Room not found in this workspace.' }); 
   
      const { name, availabilityStatus, type, capacity, workspaceId } = room; 
      const { name: workspaceName, ownerId } = workspaceId; 
      const { firstName, lastName } = ownerId; 
   
      res.status(200).json({
        room: { name, availabilityStatus, type, capacity, workspaceName, owner: { firstName, lastName } } 
      }); 
   
    } catch (error) { 
      console.error(error);
      res.status(500).json({ message: 'Something went wrong. Please try again later.' }); 
    } 
}   
 
export async function updateRoomDetails(req, res) { 
    try { 
      const workspace = await workingSpaceModel.findById(req.params.workspaceId); 
      if (!workspace) return res.status(400).json({ message: 'This working space is not available.' }); 
   
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
   
      if (!room) return res.status(404).json({ message: 'Room not found in this workspace.' }); 

      req.io.to(`workspace_${req.params.workspaceId}`).emit('roomUpdated', room);
   
      res.status(200).json({ room }); 
    } catch (error) { 
      console.error(error);
      res.status(500).json({ message: 'Something went wrong. Please try again later.' }); 
    } 
} 
 
export async function deleteRoom(req, res) {  
  try {  
      const workspace = await workingSpaceModel.findById(req.params.workspaceId);  
      if (!workspace) return res.status(400).json({ message: 'This working space is not available.' });  

      const room = await roomModel.findOneAndDelete({   
          _id: req.params.roomId,   
          workspaceId: req.params.workspaceId   
      });  
      if (!room) return res.status(404).json({ message: 'Room not found in this workspace.' });  

      await workingSpaceModel.findByIdAndUpdate(req.params.workspaceId, {  
          $inc: { roomCounter: -1 }  
      }, { new: true });  

      req.io.emit('roomDeleted', { roomId: req.params.roomId, workspaceId: req.params.workspaceId });  
      return res.status(200).json({ message: 'The room has been deleted.' });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Something went wrong. Please try again later.', error: err.message || err });
  }  
}
 
export async function viewAllRoomsForAdmin(req, res) { 
  try { 
    const rooms = await roomModel 
      .find() 
      .sort('name') 
      .populate({ 
        path: 'workspaceId', 
        select: 'name address location ownerId', 
        populate: { 
          path: 'ownerId', 
          select: 'firstName lastName email -_id' 
        } 
      }); 
 
    if (!rooms || rooms.length === 0) return res.status(404).json({ message: 'No rooms found in the system.' }); 
 
    res.status(200).json({ success: true, data: rooms }); 
  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' }); 
  } 
} 