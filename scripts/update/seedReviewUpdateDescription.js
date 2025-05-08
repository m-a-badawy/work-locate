import { reviewModel } from '../../DB/model/review.js'; 
import { faker } from '@faker-js/faker'; 
import db from '../../startUp/db.js'; 
import mongoose from 'mongoose';
faker.locale = 'en';  

export const updateReviewComments = async () => { 
  try { 
    await db(); 

    const reviews = await reviewModel.find(); 

    console.log('Reviews count:', reviews.length); 

    if (!reviews.length) { 
      console.log('⚠️ No reviews found. Update aborted.'); 
      return; 
    } 

    const reviewUpdates = reviews.map((review) => { 
      return reviewModel.findByIdAndUpdate( 
        review._id, 
        { 
          $set: {
            comment: `${faker.company.catchPhrase()} It's ideal for professionals and teams looking to collaborate and be productive.` 
          }
        } 
      ); 
    }); 

    await Promise.all(reviewUpdates); 

    console.log(`✅ Updated comments for ${reviews.length} reviews.`); 
    await mongoose.disconnect(); 
  } catch (err) { 
    console.error('❌ Error while updating review comments:', err.message); 
  } 
}; 

updateReviewComments();
