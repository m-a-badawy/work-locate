import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { userModel } from '../DB/model/user.js';
import { faker } from '@faker-js/faker';
import db from '../startUp/db.js';
import mongoose from 'mongoose';
faker.locale = 'en';

const egyptCities = ['Cairo', 'Alexandria', 'Giza', 'Mansoura', 'Tanta', 'Aswan', 'Luxor'];
const egyptianCompanyNames = [
  'Nile Office', 'Creative Space', 'Cairo Business Hub', 'Sama Works', 'View Workspace',
  'Haram Office', 'Tahrir Coworking', 'Business Start', 'Time Work', 'Cowork Egypt'
];
const egyptianStreets = [
  'Tahrir Street', 'Abbas El Akkad St', '26th July St', 'El Nasr Street', 'Gameat El Dowal St',
  'El Bahr Street', 'Nile Corniche', 'Republic Street', 'Abd El Salam Aref St'
];
const amenitiesList = ['Wi-Fi', 'Coffee', 'AC', 'Meeting Room', 'Printer'];

export const seedWorkspaces = async () => {
  try {
    await db();

    const owners = await userModel.find({ role: 'owner' });

    if (!owners.length) {
      console.log('⚠️ No owners found. Seeding aborted.');
      return;
    }

    for (const owner of owners) {
      const workspaces = [];
      const workspaceCount = faker.number.int({ min: 5, max: 15 });

      for (let i = 0; i < workspaceCount; i++) {
        const city = faker.helpers.arrayElement(egyptCities);
        const workspace = {
          name: faker.helpers.arrayElement(egyptianCompanyNames),
          location: {
            type: 'Point',
            coordinates: [
              parseFloat((29 + Math.random()).toFixed(6)), // Approximate latitude for Egypt
              parseFloat((31 + Math.random()).toFixed(6))  // Approximate longitude for Egypt
            ]
          },
          address: `${faker.helpers.arrayElement(egyptianStreets)}, ${city}, Egypt`,
          description: `A modern coworking space located in ${city} offering all the comfort and productivity essentials.`,
          amenities: faker.helpers.arrayElements(
            amenitiesList,
            faker.number.int({ min: 1, max: amenitiesList.length })
          ),
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