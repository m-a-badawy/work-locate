import { notificationModel } from '../DB/model/notification.js';
import { getIO } from '../startUp/socket.js';

export async function sendNotification(req, res) {
    const { content, type, customerId } = req.body;

    const notification = new notificationModel({ content, type, customerId });
    await notification.save();

    const io = getIO();
    io.to(customerId.toString()).emit('notification', notification);

    return res.status(201).json({ notification });
}

export async function markAsRead(req, res) {
    const { notificationId } = req.params;

    const notification = await notificationModel.findOneAndUpdate(
        { _id: notificationId, customerId: req.user._id, status: 'unread' },
        { status: 'read' },
        { new: true }
    );

    if (!notification) return res.status(404).json({ message: 'Notification not found or already read' });

    return res.status(200).json({ message: 'Notification marked as read', notification });
}

export async function getUnreadNotifications(req, res) {

    const unreadNotifications = await notificationModel.find({ customerId: req.user._id, status: 'unread' });

    return res.status(200).json({ unreadNotifications });
}
