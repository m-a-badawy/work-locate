import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { reservationModel } from '../DB/model/reservation.js';
import { reviewModel } from '../DB/model/review.js';
import { roomModel } from '../DB/model/room.js';
import { userModel } from '../DB/model/user.js';
import { faker } from '@faker-js/faker';
import db from '../startUp/db.js';
import mongoose from 'mongoose';

export const seedReviews = async () => {
  try {
    await db();

    const reservations = await reservationModel.find();
    const customers = await userModel.find({ role: 'customer' });

    if (!reservations.length || !customers.length) {
      console.log('⚠️ No reservations or customers found. Seeding aborted.');
      return;
    }

    const reviews = [];

    for (const reservation of reservations) {
      const customer = reservation.customerId;
      const roomId = reservation.roomId;

      if (!roomId) {
        console.log('⚠️ No room associated with this reservation. Skipping review.');
        continue;
      }

      const roomDetails = await roomModel.findOne({ _id: roomId });

      if (!roomDetails || !roomDetails.workspaceId) {
        console.log('⚠️ No workspace associated with this room. Skipping review.');
        continue;
      }

      const review = {
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
        customerId: customer._id,
        workspaceId: roomDetails.workspaceId
      };

      reviews.push(review);
    }

    if (reviews.length > 0) {
      const insertedReviews = await reviewModel.insertMany(reviews);
      console.log(`✅ Successfully added ${insertedReviews.length} reviews.`);

      for (const review of insertedReviews) {
        const workspaceId = review.workspaceId;

        await workingSpaceModel.findByIdAndUpdate(workspaceId, {
          $push: { reviews: review._id }
        });
      }

      console.log('🌱 All reviews seeded successfully.');
    } else {
      console.log('⚠️ No reviews to add.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error while seeding reviews:', err.message);
  }
};

seedReviews();
