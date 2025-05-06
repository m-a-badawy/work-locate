import { workingSpaceModel } from '../../DB/model/workingSpace.js';
import { roomModel } from '../../DB/model/room.js';
import { faker } from '@faker-js/faker';
import db from '../../startUp/db.js';
import mongoose from 'mongoose';

faker.locale = 'en';

const roomTypes = ['meeting', 'Personal', 'shared space', 'cabin'];
const amenitiesList = ['Wi-Fi', 'Coffee', 'AC', 'Meeting Room', 'Printer'];

export const seedRooms = async () => {
  try {
    await db();

    const workspaces = await workingSpaceModel.find();

    if (!workspaces.length) {
      console.log('⚠️ No workspaces found. Seed aborted.');
      return;
    }

    for (const workspace of workspaces) {
      const rooms = [];

      for (let i = 0; i < 5; i++) {
        const capacity = faker.number.int({ min: 2, max: 12 });
        const room = {
          name: `${workspace.name} - Room ${i + 1}`,
          type: faker.helpers.arrayElement(roomTypes),
          capacity,
          pricePerHour: faker.number.int({ min: 50, max: 300 }),
          availableSeats: capacity,
          amenities: faker.helpers.arrayElements(amenitiesList, faker.number.int({ min: 1, max: amenitiesList.length })),
          workspaceId: workspace._id,
        };
        rooms.push(room);
      }

      await roomModel.insertMany(rooms);
      console.log(`✅ Seeded 5 rooms for workspace ${workspace.name}`);
    }

    console.log('🌱 All rooms seeded successfully.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
  }
};

seedRooms();
