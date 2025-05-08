import { pricingModel } from '../../DB/model/pricingPolicy.js'; 
import { faker } from '@faker-js/faker';  // Import faker
import db from '../../startUp/db.js'; 
import mongoose from 'mongoose';

// Set locale to English
faker.locale = 'en';  // Ensure English locale is used

export const updatePricingPolicyDetails = async () => {
  try {
    // Connect to DB
    await db(); 

    // Fetch all pricing policies
    const pricingPolicies = await pricingModel.find(); 

    console.log('Number of pricing policies:', pricingPolicies.length); 

    if (!pricingPolicies.length) { 
      console.log('⚠️ No pricing policies found. Update aborted.');
      return; 
    }

    // Update each pricing policy with new data
    const pricingPolicyUpdates = pricingPolicies.map((policy) => {
      return pricingModel.findByIdAndUpdate(
        policy._id, 
        { 
          $set: {
            // Generate English product name and description
            name: faker.commerce.productName(),  // Generates English product name
            description: faker.lorem.sentence(),  // Generates English sentence
          }, 
        }
      );
    });

    // Wait for all updates to complete
    await Promise.all(pricingPolicyUpdates);

    console.log(`✅ Updated ${pricingPolicies.length} pricing policies.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error while updating pricing policies:', err.message); 
  }
};

// Run the update
updatePricingPolicyDetails();
