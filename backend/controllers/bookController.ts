import { Request, Response } from 'express';
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
    const { title, pdfUrl, status, startDate, endDate } = req.body;

    if (!title || !pdfUrl) {
      return res.status(400).json({ message: 'عنوان الكتاب ورابط PDF مطلوبان' });
    }

    const book = await Book.create({
      title: title.trim(),
      pdfUrl: pdfUrl.trim(),
      status: status || BookStatus.OPEN,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

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
