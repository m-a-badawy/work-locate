
import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { userModel } from '../DB/model/user.js';
import { faker } from '@faker-js/faker';
import db from '../startUp/db.js';
import mongoose from 'mongoose';
faker.locale = 'en';

const egyptCities = ['Cairo', 'Alexandria', 'Giza', 'Mansoura', 'Tanta', 'Aswan', 'Luxor'];
const amenitiesList = ['Wi-Fi', 'Coffee', 'AC', 'Meeting Room', 'Printer'];


export const seedWorkspaces = async () => {
  try {
    await db();

    const owners = await userModel.find({ role: 'owner' });

    if (!owners.length) {
      console.log('⚠️ No owners found. Seed aborted.');
      return;
    }

    for (const owner of owners) {
      const workspaces = [];

      const randomCount = faker.number.int({ min: 5, max: 15 });

      for (let i = 0; i < randomCount; i++) {
        const city = faker.helpers.arrayElement(egyptCities);
        const workspace = {
          name: faker.company.name() + ' Workspace',
          location: {
            type: 'Point',
            coordinates: [
              parseFloat((29 + Math.random()).toFixed(6)),
              parseFloat((31 + Math.random()).toFixed(6))
            ]
          },
          address: `${faker.location.streetAddress()}, ${city}, Egypt`,
          description: faker.lorem.sentences(2),
          amenities: faker.helpers.arrayElements(amenitiesList, faker.number.int({ min: 1, max: amenitiesList.length })),
          roomCounter: faker.number.int({ min: 1, max: 10 }),
          averageRating: faker.number.int({ min: 1, max: 5 }),
          ownerId: owner._id,
          reviews: []
        };

        workspaces.push(workspace);
      }

      await workingSpaceModel.insertMany(workspaces);
      console.log(`✅ Seeded ${workspaces.length} workspaces for owner ${owner.email}`);
    }

    console.log('🌱 All workspaces seeded successfully.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
  }
};

seedWorkspaces();
