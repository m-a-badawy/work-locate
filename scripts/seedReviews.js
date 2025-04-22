export const seedReviews = async () => {
  try {
    await db();

    const reservations = await reservationModel.find();
    const customers = await userModel.find({ role: 'customer' });

    console.log('Reservations count:', reservations.length);
    console.log('Customers count:', customers.length);

    if (!reservations.length || !customers.length) {
      console.log('⚠️ No reservations or customers found. Seeding aborted.');
      return;
    }

    const reviewDocs = [];

    for (const reservation of reservations) {
      const room = await roomModel.findById(reservation.roomId);
      if (!room || !room.workspaceId) {
        console.log(`⚠️ Skipping reservation ${reservation._id}`);
        continue;
      }

      const review = {
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
        customerId: reservation.customerId,
        workspaceId: room.workspaceId
      };

      reviewDocs.push(review);
    }

    if (reviewDocs.length === 0) {
      console.log('⚠️ No reviews to insert.');
      return;
    }

    const inserted = await reviewModel.insertMany(reviewDocs);

    const workspaceUpdates = inserted.map((review) => {
      return workingSpaceModel.findByIdAndUpdate(
        review.workspaceId,
        { $push: { reviews: review._id } }
      );
    });

    await Promise.all(workspaceUpdates);

    console.log(`✅ Inserted ${inserted.length} reviews and updated workspaces.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error while seeding reviews:', err.message);
  }
};

seedReviews();
