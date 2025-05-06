import { workingSpaceModel } from '../../DB/model/workingSpace.js';
import { faker } from '@faker-js/faker';
import db from '../../startUp/db.js';
import mongoose from 'mongoose';

faker.locale = 'en';

export const updateWorkspaceDescriptions = async () => {
  try {
    await db();

    const workspaces = await workingSpaceModel.find();

    if (!workspaces.length) {
      console.log('⚠️ No workspaces found. Update aborted.');
      return;
    }

    for (const workspace of workspaces) {
      const newDescription = `${faker.company.catchPhrase()}. ${faker.company.bsBuzz()} and ${faker.company.bsAdjective()} workspace ideal for professionals.`;

      workspace.description = newDescription;

      await workspace.save();
      console.log(`✅ Updated description for workspace: ${workspace.name}`);
    }

    console.log('🌱 All workspace descriptions updated successfully.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error during updating descriptions:', err.message);
  }
};

updateWorkspaceDescriptions();
