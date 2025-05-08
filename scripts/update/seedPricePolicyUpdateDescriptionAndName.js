import { pricingModel } from '../../DB/model/pricingPolicy.js'; 
import { faker } from '@faker-js/faker';  
import db from '../../startUp/db.js'; 
import mongoose from 'mongoose';

faker.locale = 'en';  // Ensure Faker generates data in English

// Function to generate pricing policy updates
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
            // Generate more relevant product name and description
            name: generatePricingName(policy),
            description: generatePricingDescription(policy),
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

// Function to generate the price policy name (e.g., Premium, Discounted)
function generatePricingName(policy) {
  const names = [
    'Premium Membership',
    'Exclusive Offer',
    'Standard Plan',
    'Special Discount',
    'Limited Time Offer',
    'Basic Plan',
    'All-Access Package',
    'Seasonal Discount',
    'Advanced Workspace Deal',
    'Early Bird Discount',
  ];

  return faker.helpers.arrayElement(names);  // Use the correct method to pick a random name from the list
}

// Function to generate the description (related to workspace offers)
function generatePricingDescription(policy) {
  const workspaceName = policy.workspaceId.name; // Use the workspace name for personalization
  const discount = policy.discountPercentage;

  const descriptions = [
    `Get a ${discount}% discount on all services at ${workspaceName}, including meeting rooms, hot desks, and more.`,
    `Enjoy exclusive access to all amenities at ${workspaceName}, plus a ${discount}% discount on monthly bookings.`,
    `Sign up today for ${workspaceName} and save ${discount}% on all bookings for the first three months.`,
    `Limited time offer: ${discount}% off your first booking at ${workspaceName}.`,
    `Special offer: Book now at ${workspaceName} and receive ${discount}% off on all meeting rooms.`,
    `Join ${workspaceName} today and save ${discount}% on long-term reservations.`,
    `Unlock premium access to all spaces at ${workspaceName} with a ${discount}% discount on all memberships.`,
    `New customers get ${discount}% off on all bookings at ${workspaceName}. Don't miss out!`,
    `Exclusive seasonal offer: ${discount}% off your first three months at ${workspaceName}.`,
    `Save ${discount}% today by subscribing to the full membership at ${workspaceName}.`
  ];

  return faker.helpers.arrayElement(descriptions);  // Correct method to pick a random description
}

// Run the update
updatePricingPolicyDetails();
