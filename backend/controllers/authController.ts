import { Request, Response } from 'express';
import User, { UserRole } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'mihrab_kitab_secret_2026', {
    expiresIn: '30d',
  });
};

// @desc  Auth user & get token
// @route POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم، يرجى المحاولة لاحقاً' });
  }
};

// @desc  Register new user (admin only)
// @route POST /api/auth/register
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'يرجى ملء جميع الحقول المطلوبة' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'هذا البريد الإلكتروني مستخدم مسبقاً' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.STUDENT;

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'بيانات غير صالحة' });
    }
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم، يرجى المحاولة لاحقاً' });
  }
};

// @desc  Get all users
// @route GET /api/auth/users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب بيانات المستخدمين' });
  }
};

// @desc  Delete user
// @route DELETE /api/auth/users/:id
export const deleteUser = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص' });
    }
    if (user.role === UserRole.ADMIN) {
      return res.status(400).json({ message: 'لا يمكن حذف حسابات المديرين' });
    }
    await user.deleteOne();
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف المستخدم' });
  }
};
