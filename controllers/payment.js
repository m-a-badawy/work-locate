
import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { reservationModel } from '../DB/model/reservation.js';
import { paymentModel } from '../DB/model/payment.js';
import { roomModel } from '../DB/model/room.js';

export const processPayment = async (req, res, next) => {
    try {
      const { paymentMethod } = req.body;
      const { reservationId } = req.params;
      const customerId = req.user._id;
  
      const reservation = await reservationModel.findById(reservationId);
      if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
      if (!reservation.customerId.equals(customerId)) return res.status(403).json({ message: 'Unauthorized to pay for this reservation' });
  
      const payment = await paymentModel.create({
        amount: reservation.totalPrice,
        paymentMethod,
        paymentStatus: 'completed',
        transactionDate: new Date(),
        customerId,
        reservationId,
      });
  
      reservation.status = 'confirmed';
      await reservation.save();

      const populatedProcess = await paymentModel
        .findById(payment._id)
        .populate('reservationId', 'seatsBooked duration')
        .populate({
            path: 'reservationId',
            populate: {
            path: 'roomId',
            select: 'name pricePerHour type capacity'
            }
        })
        .populate('customerId', 'firstName lastName -_id'); 
  
      res.status(201).json({ populatedProcess });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export async function refundPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const payment = await paymentModel.findById(paymentId)
  
      if (!payment) return res.status(404).json({ message: 'Payment not found' });
  
      if (payment.paymentStatus === 'failed') return res.status(400).json({ message: 'Payment has already been refunded' });
  
      payment.paymentStatus = 'failed';
      await payment.save();

      const populatedProcess = await paymentModel
      .findById(payment._id)
      .populate('reservationId', 'seatsBooked duration')
      .populate({
          path: 'reservationId',
          populate: {
          path: 'roomId',
          select: 'name pricePerHour type capacity'
          }
      })
      .populate('customerId', 'firstName lastName -_id'); 

  
      res.status(200).json({ populatedProcess });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
};  

export async function getPaymentDetails(req, res) {
    try {
      const { paymentId } = req.params;
      const user = req.user;
      
      const payment = await paymentModel.findById(paymentId)
        .populate('customerId', 'firstName lastName')
        .populate('reservationId', 'totalPrice status roomId');
  
      if (!payment) return res.status(404).json({ message: 'Payment not found' });
  
      const isAuthorized = (payment.customerId.equals(user._id) || ['Admin', 'Owner'].includes(user.role));
      if (!isAuthorized) return res.status(403).json({ message: 'Unauthorized to view this payment' });
  
      res.status(200).json({ payment });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
  
  
  
export async function getPaymentHistory(req, res) {
    try {
      const userId = req.user._id;
  
      const payments = await paymentModel.find({ customerId: userId }).sort({ createdAt: -1 })
        .populate('reservationId', 'seatsBooked duration')
        .populate({
          path: 'reservationId',
          populate: {
            path: 'roomId',
            select: 'name pricePerHour type capacity'
          }
        });
  
      res.status(200).json({ count: payments.length, payments });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
};
  
export async function getAllPaymentsForOwner(req, res) {
    try {
        const ownerId = req.user._id;

        const workspaces = await workingSpaceModel.find({ ownerId }).select('_id');
        const workspaceIds = workspaces.map(ws => ws._id);

        const rooms = await roomModel.find({ workingSpaceId: { $in: workspaceIds } }).select('_id');
        const roomIds = rooms.map(room => room._id);

        const reservations = await reservationModel.find({ roomId: { $in: roomIds } }).select('_id');
        const reservationIds = reservations.map(r => r._id);

        const payments = await paymentModel.find({ reservationId: { $in: reservationIds } })
        .populate('customerId', 'firstName lastName -_id')
        .populate({
            path: 'reservationId',
            populate: {
            path: 'roomId',
            select: 'name pricePerHour type capacity'
            }
        });

        res.status(200).json({ count: payments.length, payments });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
  
export  async function  getAllPaymentsForAdmin(req, res){
  try {
    const payments = await paymentModel.find()
      .populate('customerId', 'firstName lastName email')
      .populate('reservationId')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: payments.length, payments });
  } catch (err) {
    return res.status(500).json({message: err.message });
  }
};