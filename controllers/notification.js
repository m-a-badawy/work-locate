import { notificationModel } from '../DB/model/notification.js';
import { getIO } from '../startUp/socket.js';

export async function sendNotification(req, res) {
    const { content, type, customerId } = req.body;

    const notification = new notificationModel.create({ content, type, customerId });
    await notification.save();

    const io = getIO();
    io.to(customerId.toString()).emit('notification', notification);

    return res.status(201).json({ notification });
}

// Mark a notification as read
export async function markAsRead(req, res) {
    const { notificationId } = req.params;
    const { userId } = req.body;  // Assuming the userId is passed in the request body

    const notification = await notificationModel.findOneAndUpdate(
        { _id: notificationId, customerId: userId, status: 'unread' },
        { status: 'read' },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({ message: 'Notification not found or already read' });
    }

    return res.status(200).json({ message: 'Notification marked as read', notification });
}

// Get unread notifications for a user
export async function getUnreadNotifications(req, res) {
    const { userId } = req.params;

    const unreadNotifications = await notificationModel.find({ customerId: userId, status: 'unread' });

    return res.status(200).json({ unreadNotifications });
}
