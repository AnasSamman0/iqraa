import { Request, Response } from 'express';
import Submission from '../models/Submission';
import FinishedBook from '../models/FinishedBook';

export const createSubmission = async (req: any, res: Response) => {
  const { bookId, content, customDate } = req.body;
  const userId = req.user._id;

  // Check if finished book
  const isFinished = await FinishedBook.findOne({ userId, bookId });
  if (!isFinished) {
    return res.status(400).json({ message: 'You must finish the book first' });
  }

  // Check for existing
  const existing = await Submission.findOne({ userId, bookId });
  if (existing) {
    return res.status(400).json({ message: 'Submission already exists' });
  }

  const submission = await Submission.create({
    userId,
    bookId,
    content,
    customDate
  });

  res.status(201).json(submission);
};

export const getSubmissionsForBook = async (req: Request, res: Response) => {
  const submissions = await Submission.find({ bookId: req.params.bookId })
    .populate('userId', 'name email');
  res.json(submissions);
};

export const getAllSubmissions = async (req: Request, res: Response) => {
  const submissions = await Submission.find({})
    .populate('userId', 'name email');
  res.json(submissions);
};

export const likeSubmission = async (req: any, res: Response) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  const userId = req.user._id;
  const liked = submission.likedBy.includes(userId);

  if (liked) {
    submission.likedBy = submission.likedBy.filter((id) => id.toString() !== userId.toString());
    submission.likesCount--;
  } else {
    submission.likedBy.push(userId);
    submission.likesCount++;
  }

  await submission.save();
  res.json(submission);
};

export const deleteSubmission = async (req: Request, res: Response) => {
  const submission = await Submission.findById(req.params.id);
  if (submission) {
    await submission.deleteOne();
    res.json({ message: 'Submission removed' });
  } else {
    res.status(404).json({ message: 'Submission not found' });
  }
};

// @desc  Get top readers for leaderboard
// @route GET /api/submissions/leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaderboard = await FinishedBook.aggregate([
      {
        $group: {
          _id: '$userId',
          booksCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          booksCount: 1,
          name: '$user.name',
          email: '$user.email',
        },
      },
      { $sort: { booksCount: -1 } },
      { $limit: 10 },
    ]);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};
