import { workingSpaceModel } from '../../DB/model/workingSpace.js';
import { notificationModel } from '../../DB/model/notification.js';  
import { reservationModel } from '../../DB/model/reservation.js';  
import { pricingModel } from '../../DB/model/pricingPolicy.js';  
import { userModel } from '../../DB/model/user.js';  
import { faker } from '@faker-js/faker';  
import db from '../../startUp/db.js';  
import mongoose from 'mongoose';  

export const seedNotifications = async () => { 
  try { 
    await db(); 
 
    const reservations = await reservationModel.find(); 
    const pricePolicies = await pricingModel.find(); 
    const customers = await userModel.find({ role: 'customer' }); 
    const workspaces = await workingSpaceModel.find();
 
    if (!reservations.length || !customers.length || !workspaces.length) { 
      console.log('⚠️ No reservations, customers, or workspaces found. Seed aborted.'); 
      return; 
    } 
 
    const notifications = []; 
 
    for (const reservation of reservations) { 
      if (!reservation.customerId || reservation.status === 'confirmed') continue; 
 
      const customer = customers.find(customer => customer._id.toString() === reservation.customerId.toString()); 
      const workspace = workspaces.find(workspace => workspace._id.toString() === reservation.workspaceId.toString());
 
      if (!workspace) continue;
 
      notifications.push({ 
        content: `Your reservation at workspace "${workspace.name}" on ${reservation.date?.toDateString() || 'a scheduled date'} is confirmed.`, 
        type: 'reservation', 
        customerId: customer._id, 
        workspaceId: reservation.workspaceId, 
        status: faker.helpers.arrayElement(['read', 'unread']), 
      }); 
 
      reservation.status = 'confirmed'; 
      await reservation.save(); 
    } 
 
    for (const policy of pricePolicies) { 
      if (!policy.workspaceId) continue; 
 
      const workspace = workspaces.find(workspace => workspace._id.toString() === policy.workspaceId.toString());
 
      if (!workspace) continue;
 
      const randomReservations = faker.helpers.shuffle(reservations).slice(0, 5); 
 
      for (const reservation of randomReservations) { 
        if (!reservation.customerId) continue; 
 
        const customer = customers.find(customer => customer._id.toString() === reservation.customerId.toString()); 
 
        notifications.push({ 
          content: `New pricing policy available at workspace "${workspace.name}": ${policy.description || 'Check it out!'}`, 
          type: 'promotion', 
          customerId: customer._id, 
          workspaceId: policy.workspaceId, 
          status: faker.helpers.arrayElement(['read', 'unread']), 
        }); 
      } 
    } 
 
    for (let i = 0; i < 10; i++) { 
      const randomCustomer = faker.helpers.arrayElement(customers); 
 
      notifications.push({ 
        content: faker.lorem.sentence(), 
        type: 'system', 
        customerId: randomCustomer._id, 
        status: faker.helpers.arrayElement(['read', 'unread']), 
      }); 
    } 
 
    await notificationModel.insertMany(notifications); 
    console.log(`✅ Seeded ${notifications.length} notifications`); 
 
    console.log('🌱 All notifications seeded successfully.'); 
    await mongoose.disconnect(); 
  } catch (err) { 
    console.error('❌ Error during seeding notifications:', err.message); 
  } 
}; 
 
seedNotifications(); 
