import { Router } from 'express';
import Loan from '../models/Loan.js';
import Delinquency from '../models/Delinquency.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status && ['OPEN', 'RESOLVED'].includes(req.query.status)) filter.resolutionStatus = req.query.status;
  const records = await Delinquency.find(filter).populate({ path: 'loan', select: 'customer remainingBalance loanStatus', populate: { path: 'customer', select: 'fullName email' } }).sort({ daysOverdue: -1 }).lean();
  res.json({ records });
}));

router.post('/audit', asyncHandler(async (_req, res) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const overdueLoans = await Loan.find({ loanStatus: 'APPROVED', remainingBalance: { $gt: 0 }, startDate: { $lt: cutoff } });
  let flagged = 0;
  for (const loan of overdueLoans) {
    const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(loan.startDate).getTime()) / 86400000) - 30);
    if (daysOverdue <= 0) continue;
    const riskLevel = daysOverdue > 90 ? 'HIGH' : daysOverdue > 60 ? 'MEDIUM' : 'LOW';
    await Delinquency.findOneAndUpdate(
      { loan: loan._id, resolutionStatus: 'OPEN' },
      { $set: { daysOverdue, outstandingAmount: loan.remainingBalance, delinquencyDate: new Date(), riskLevel } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    flagged++;
  }
  res.json({ message: `Audit complete. ${flagged} overdue account(s) checked.`, flagged });
}));

router.patch('/:id/resolve', asyncHandler(async (req, res) => {
  const record = await Delinquency.findByIdAndUpdate(req.params.id, { resolutionStatus: 'RESOLVED' }, { new: true, runValidators: true }).populate({ path: 'loan', populate: { path: 'customer', select: 'fullName' } });
  if (!record) return res.status(404).json({ message: 'Risk record not found.' });
  res.json({ record, message: 'Risk record marked as resolved.' });
}));

export default router;
