import { reservationModel } from '../DB/model/reservation.js';
import { pricingModel } from '../DB/model/pricingPolicy.js';
import { paymentModel } from '../DB/model/payment.js';

export async function createPolicy(req, res) {
    try {
      const { name, description, discountPercentage } = req.body;
  
      const policy = await pricingModel.create({
        name,
        description,
        discountPercentage,
        workspaceId: req.params.workspaceId,
      });
  
      const populatedPolicy = await policy.populate('workspaceId' , 'name ');
  
      res.status(201).json({ policy: populatedPolicy });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}

export async function updatePolicy(req, res) {
    try {
      const policy = await pricingModel.findByIdAndUpdate(
        req.params.pricingPoliciesId,
        req.body,
        { new: true }
      ).populate('workspaceId' , 'name ');
  
      if (!policy) return res.status(404).json({ message: 'Policy not found' });
  
      res.status(200).json({ policy });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
} 

export async function deletePolicy(req, res) {
    try {
      const policy = await pricingModel.findByIdAndDelete(req.params.pricingPoliciesId)
        .populate('workspaceId' , 'name ');
  
      if (!policy) return res.status(404).json({ message: 'Policy not found' });
  
      res.status(200).json({ message: 'Policy deleted successfully', policy });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
} 

export async function applyPolicy(req, res) {
    try {
      const policy = await pricingModel.findOne({ workspaceId: req.params.workspaceId })
        .populate('workspaceId' , 'name ');
  
      if (!policy) return res.status(404).json({ message: 'Policy not found' });
  
      const reservations = await reservationModel.find({ workspaceId: req.params.workspaceId });
  
      for (const reservation of reservations) {
        reservation.totalPrice = reservation.totalPrice * (1 - policy.discountPercentage / 100);
        await reservation.save();
      }
  
      res.status(200).json({
        message: 'Policy applied to reservations',
        policy,
        affectedReservations: reservations.length
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}

export async function FinancialReports(req, res) {
    try {
      const { workspaceId } = req.params;
  
      const payments = await paymentModel
        .find({ status: 'completed' })
        .populate({
          path: 'reservationId',
          populate: {
            path: 'roomId',
            populate: {
              path: 'workspaceId',
              model: 'WorkingSpace',
              select: 'name',
            },
          },
        });

      const filteredPayments = payments.filter( p => p.reservationId?.roomId?.workspaceId?._id.toString() === workspaceId);
  
      const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalPayments = filteredPayments.length;
  
      res.status(200).json({ totalRevenue, totalPayments });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}
  


  