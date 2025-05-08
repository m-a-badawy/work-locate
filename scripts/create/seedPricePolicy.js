import { workingSpaceModel } from '../../DB/model/workingSpace.js';
import { pricingModel } from '../../DB/model/pricingPolicy.js';
import { faker } from '@faker-js/faker';
import db from '../../startUp/db.js';
import mongoose from 'mongoose';

export const seedPricingPolicies = async () => {
  try {
    await db();

    const workspaces = await workingSpaceModel.find();

    if (!workspaces.length) {
      console.log('⚠️ No workspaces found. Seed aborted.');
      return;
    }

    const pricingPolicies = [];

    for (let i = 0; i < workspaces.length; i++) {
      const workspace = workspaces[i];

      for (let j = 0; j < 10; j++) {
        const policy = {
          name: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          discountPercentage: faker.number.int({ min: 5, max: 50 }),
          workspaceId: workspace._id,
        };

        pricingPolicies.push(policy);
      }
    }

    await pricingModel.insertMany(pricingPolicies);
    console.log(`✅ Seeded ${pricingPolicies.length} pricing policies`);

    await mongoose.disconnect();
    console.log('🌱 All pricing policies seeded successfully.');
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
  }
};

seedPricingPolicies();
