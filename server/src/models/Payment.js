import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
  amountPaid: { type: Number, required: true, min: 0.01 },
  paymentDate: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
