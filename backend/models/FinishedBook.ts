import mongoose, { Document, Schema } from 'mongoose';

export interface IFinishedBook extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FinishedBookSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  },
  { timestamps: true }
);

// Prevent duplicate finish records
FinishedBookSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default mongoose.model<IFinishedBook>('FinishedBook', FinishedBookSchema);
