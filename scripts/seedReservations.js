import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { reservationModel } from '../DB/model/reservation.js';
import { roomModel } from '../DB/model/room.js';
import { userModel } from '../DB/model/user.js';
import { faker } from '@faker-js/faker';
import db from '../startUp/db.js';
import mongoose from 'mongoose';

export const seedReservations = async () => {
  try {
    await db();

    const rooms = await roomModel.find();
    const customers = await userModel.find({ role: 'customer' });
    const workspaces = await workingSpaceModel.find();

    if (!rooms.length || !customers.length || !workspaces.length) {
      console.log('⚠️ No rooms, customers, or workspaces found. Seed aborted.');
      return;
    }

    const reservations = [];

    for (let i = 0; i < workspaces.length; i++) {
      const workspace = workspaces[i];

      for (let j = 0; j < customers.length; j++) {
        const customer = customers[j];

        const room = faker.helpers.arrayElement(rooms.filter(room => room.workspaceId.toString() === workspace._id.toString()));

        const expectedArrivalTime = faker.date.future(1);

        const seatsBooked = faker.number.int({ min: 1, max: room.capacity });

        const reservation = {
          roomId: room._id,
          customerId: customer._id,
          seatsBooked: seatsBooked,
          expectedArrivalTime: expectedArrivalTime,
          status: 'pending',
          workspaceId: workspace._id,
        };

        const startTime = faker.date.recent();
        const endTime = new Date(startTime.getTime() + faker.number.int({ min: 1, max: 5 }) * 60 * 60 * 1000);
        reservation.startTime = startTime;
        reservation.endTime = endTime;

        reservation.duration = (endTime - startTime) / (1000 * 60 * 60);
        reservation.totalPrice = reservation.duration * room.pricePerHour * seatsBooked;

        reservations.push(reservation);
      }
    }

    await reservationModel.insertMany(reservations);
    console.log(`✅ Seeded ${reservations.length} reservations`);

    console.log('🌱 All reservations seeded successfully.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
  }
};

seedReservations();
