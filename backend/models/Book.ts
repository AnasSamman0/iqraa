import mongoose, { Document, Schema } from 'mongoose';

export enum BookStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface IBook extends Document {
  title: string;
  pdfUrl: string;
  coverUrl?: string;
  status: BookStatus;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    coverUrl: { type: String },
    status: { type: String, enum: Object.values(BookStatus), default: BookStatus.OPEN },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);


export default mongoose.model<IBook>('Book', BookSchema);
