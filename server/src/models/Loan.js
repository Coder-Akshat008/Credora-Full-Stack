import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  principalAmount: { type: Number, required: true, min: 0.01 },
  remainingBalance: { type: Number, required: true, min: 0 },
  interestRate: { type: Number, required: true, min: 0, max: 100 },
  tenureMonths: { type: Number, required: true, min: 1, max: 600 },
  startDate: { type: Date, required: true },
  loanStatus: { type: String, enum: ['APPROVED', 'CLOSED', 'DEFAULTED'], default: 'APPROVED', index: true }
}, { timestamps: true });

loanSchema.index({ loanStatus: 1, remainingBalance: 1 });
export default mongoose.model('Loan', loanSchema);
