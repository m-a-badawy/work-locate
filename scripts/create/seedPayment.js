import { reservationModel } from '../../DB/model/reservation.js';
import { paymentModel } from '../../DB/model/payment.js';
import { userModel } from '../../DB/model/user.js';
import { faker } from '@faker-js/faker';
import db from '../../startUp/db.js';
import mongoose from 'mongoose';

export const seedPayments = async () => {
  try {
    await db();

    const reservations = await reservationModel.find();
    const customers = await userModel.find({ role: 'customer' });

    if (!reservations.length || !customers.length) {
      console.log('⚠️ No reservations or customers found. Seed aborted.');
      return;
    }

    const payments = [];

    for (const reservation of reservations) {
      if (!reservation.customerId || reservation.status === 'confirmed') continue;  // Skip if customer doesn't exist or if the reservation is already confirmed


      const customer = customers.find(customer => customer._id.toString() === reservation.customerId.toString());

      const payment = {
        amount: reservation.totalPrice,
        paymentMethod: faker.helpers.arrayElement(['credit_card', 'debit_card', 'paypal', 'cash', 'phone wallet']),
        paymentStatus: 'completed',
        transactionDate: faker.date.past(),
        customerId: customer._id,
        reservationId: reservation._id,
      };

      payments.push(payment);

      reservation.status = 'confirmed';
      await reservation.save();
    }

    await paymentModel.insertMany(payments);
    console.log(`✅ Seeded ${payments.length} payments`);

    console.log('🌱 All payments seeded successfully.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error during seeding payments:', err.message);
  }
};

seedPayments();
