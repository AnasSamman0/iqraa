import mongoose from 'mongoose';
import User, { UserRole } from './models/User';
import Book, { BookStatus } from './models/Book';
import Submission from './models/Submission';
import FinishedBook from './models/FinishedBook';
import bcrypt from 'bcryptjs';

export const importData = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@mihrabkitab.com' });
    if (adminExists) return; // Already seeded

    await User.deleteMany();
    await Book.deleteMany();
    await Submission.deleteMany();
    await FinishedBook.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      {
        name: 'مدير محراب و كتاب',
        email: 'admin@mihrabkitab.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
      }
    ]);

    console.log('Admin account created successfully!');
  } catch (error) {
    console.error(`Error with Seeder: ${error}`);
  }
};
