import { notificationModel } from '../DB/model/notification.js';

export async function sendNotification(req, res) {
    try {
        const { content, type } = req.body;
        const customerId = req.params.customerId;
        const workspaceId = req.params.workspaceId;

        const notificationData = { content, type, customerId };
        if (workspaceId) notificationData.workspaceId = workspaceId;

        const notification = await notificationModel.create(notificationData);

        req.io?.to(customerId).emit('newNotification', notification);

        res.status(201).json({ notification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export async function markAsRead(req, res) {
    const { notificationId } = req.params;
  
    try {
      const notification = await notificationModel.findOneAndUpdate(
        { _id: notificationId, customerId: req.user._id },
        { status: 'read' },
        { new: true }
      );
  
      if (!notification)
        return res.status(404).json({ message: 'Notification not found or access denied' });
  
      res.status(200).json({ notification });
    } catch (error) {
      res.status(500).json({  error: error.message });
    }
};
  
export async function getUnreadNotifications(req, res) {
    try {
        const { workspaceId } = req.params;

        let filter = { customerId: req.user._id, status: 'unread' };
        if (workspaceId) filter.workspaceId = workspaceId;

        const notifications = await notificationModel.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export async function getOwnerNotifications(req, res) {
  try {
    const { workspaceId } = req.params;

    if (!workspaceId) return res.status(400).json({ message: 'workspaceId is required.' });

    const workspace = await workingSpaceModel.findById(workspaceId);

    if (!workspace) return res.status(404).json({  message: 'Workspace not found.' });

    if (workspace.ownerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied. Not the owner of this workspace.' });

    const notifications = await notificationModel
      .find({ workspaceId })
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({  error: error.message });
  }
}


export async function getNotificationsForAdmin(req, res) {
    try {
      const notifications = await notificationModel
        .find({})
        .sort({ createdAt: -1 });
  
      res.status(200).json({ notifications });
    } catch (error) {
      res.status(500).json({  error: error.message });
    }
};