import { userModel } from '../../DB/model/user.js';
import { faker } from '@faker-js/faker';
import db from '../../startUp/db.js';
import bcrypt from 'bcrypt';

faker.locale = 'en';

const egyptianFirstNames = ['Ahmed', 'Mohamed', 'Sara', 'Hassan', 'Youssef', 'Mona'];
const egyptianLastNames = ['Ali', 'Mahmoud', 'Ibrahim', 'Khaled', 'Tamer', 'Fathy'];
const egyptianPhones = ['010', '011', '012', '015'];

const generateEgyptianPhone = () => {
  const prefix = faker.helpers.arrayElement(egyptianPhones);
  const number = faker.string.numeric(8);
  return prefix + number;
};

const seedUsers = async () => {
  try {
    await db();

    const users = [];

    for (let i = 0; i < 200; i++) {
      const firstName = faker.helpers.arrayElement(egyptianFirstNames);
      const lastName = faker.helpers.arrayElement(egyptianLastNames);
      const email = faker.internet.email(firstName, lastName);
      const phone = generateEgyptianPhone();
      const rawPassword = faker.internet.password(8);
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      users.push({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
      });
    }

    await userModel.insertMany(users);
    console.log('✅ Inserted 200 Egyptian users with hashed passwords');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    process.exit(1);
  }
};

seedUsers();
