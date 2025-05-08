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
        workspaceId: req.params.workspaceId
      });
  
      res.status(201).json({ policy });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}

export async function updatePolicy(req, res) {
    try {
  
      const policy = await pricingModel.findByIdAndUpdate(req.params.pricingPoliciesId, req.body, { new: true });
  
      if (!policy) return res.status(404).json({ message: 'Policy not found' });
  
      res.status(200).json({  policy });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}

export async function deletePolicy(req, res) {
    try {

        const policy = await pricingModel.findByIdAndDelete(req.params.pricingPoliciesId);
        if (!policy) return res.status(404).json({ message: 'Policy not found' });

        res.status(200).json({ message: 'Policy deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export async function applyPolicy(req, res) {
  try {

    const policy = await pricingModel.findOne({ workspaceId: req.params.workspaceId });
    if (!policy) return res.status(404).json({ message: 'Policy not found' });

    const reservations = await reservationModel.find({ workspaceId: req.params.workspaceId  });

    for (const reservation of reservations) {
      reservation.totalPrice = reservation.totalPrice * (1 - policy.discountPercentage / 100);
      await reservation.save();
    }

    res.status(200).json({ message: 'Policy applied to reservations' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export async function FinancialReports(req, res) {
  try {

    const payments = await paymentModel.find({ status: 'paid' }).populate('reservationId');
    
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPayments = payments.length;

    res.status(200).json({ totalRevenue, totalPayments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


  