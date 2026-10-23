import mongoose from 'mongoose';

const delinquencySchema = new mongoose.Schema({
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
  daysOverdue: { type: Number, required: true, min: 0 },
  outstandingAmount: { type: Number, required: true, min: 0 },
  delinquencyDate: { type: Date, default: Date.now },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
  resolutionStatus: { type: String, enum: ['OPEN', 'RESOLVED'], default: 'OPEN', index: true }
}, { timestamps: true });

delinquencySchema.index({ loan: 1, resolutionStatus: 1 });
export default mongoose.model('Delinquency', delinquencySchema);
