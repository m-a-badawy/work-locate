import { workingSpaceModel } from '../DB/model/workingSpace.js';
import { userModel } from '../DB/model/user.js';
import { faker } from '@faker-js/faker';

faker.locale = 'en';

const egyptCities = ['Cairo', 'Alexandria', 'Giza', 'Mansoura', 'Tanta', 'Aswan', 'Luxor'];
const amenitiesList = ['Wi-Fi', 'Coffee', 'AC', 'Meeting Room', 'Printer'];

export const seedWorkspaces = async () => {
  try {
    const owners = await userModel.find({ role: 'owner' });

    if (!owners.length) {
      console.log('⚠️ No owners found in the database.');
      return;
    }

    for (const owner of owners) {
      const workspaces = [];

      for (let i = 0; i < 10; i++) {
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
          amenities: faker.helpers.arrayElements(amenitiesList, Math.floor(Math.random() * amenitiesList.length) + 1),
          roomCounter: faker.number.int({ min: 1, max: 10 }),
          ownerId: owner._id,
          reviews: []
        };

        workspaces.push(workspace);
      }

      await workingSpaceModel.insertMany(workspaces);
    }

    console.log('✅ Workspaces seeded successfully for all owners.');
  } catch (error) {
    console.error('❌ Error while seeding workspaces:', error.message);
  }
};

seedWorkspaces();
