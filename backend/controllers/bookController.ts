import mongoose from 'mongoose';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import User from '../models/User';
import Book, { BookStatus } from '../models/Book';
import FinishedBook from '../models/FinishedBook';

// @desc  Get all books
export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await Book.find({}).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الكتب' });
  }
};

// @desc  Create a book (admin)
export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, pdfUrl, coverUrl, status, startDate, endDate, markAsFinishedForAll } = req.body;

    if (!title || !pdfUrl) {
      return res.status(400).json({ message: 'عنوان الكتاب ورابط PDF مطلوبان' });
    }

    const book = await Book.create({
      title: title.trim(),
      pdfUrl: pdfUrl.trim(),
      coverUrl: coverUrl ? coverUrl.trim() : undefined,
      status: markAsFinishedForAll ? BookStatus.CLOSED : (status || BookStatus.OPEN),
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });


    // If it's a historical/old book, mark it as finished for all existing students
    if (markAsFinishedForAll) {
      const students: any[] = await User.find({ role: 'student' });
      
      const finishedRecords = students.map(student => ({
        userId: student._id,
        bookId: book._id
      }));

      if (finishedRecords.length > 0) {
        await FinishedBook.insertMany(finishedRecords);
      }
    }

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إضافة الكتاب' });
  }
};


// @desc  Delete a book (admin)
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'الكتاب غير موجود' });
    }

    // Delete local file if it exists
    if (book.pdfUrl && book.pdfUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), book.pdfUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete local cover if it exists
    if (book.coverUrl && book.coverUrl.startsWith('/uploads/')) {
      const coverPath = path.join(process.cwd(), book.coverUrl);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    await book.deleteOne();

    res.json({ message: 'تم حذف الكتاب بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف الكتاب' });
  }
};


// @desc  Toggle book open/closed status (admin)
export const toggleBookStatus = async (req: Request, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'الكتاب غير موجود' });
    }
    book.status = book.status === BookStatus.OPEN ? BookStatus.CLOSED : BookStatus.OPEN;
    await book.save();
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث حالة الكتاب' });
  }
};

// @desc  Mark book as finished by student
export const markBookFinished = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'الكتاب غير موجود' });
    }

    const alreadyFinished = await FinishedBook.findOne({ userId, bookId });
    if (alreadyFinished) {
      return res.status(400).json({ message: 'لقد سجّلت هذا الكتاب كمنتهٍ مسبقاً' });
    }

    const finishedBook = await FinishedBook.create({ userId, bookId });
    res.status(201).json(finishedBook);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تسجيل إتمام القراءة' });
  }
};
