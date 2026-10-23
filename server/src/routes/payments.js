import { Router } from 'express';
import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, money } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (_req, res) => {
  const payments = await Payment.find().populate({ path: 'loan', select: 'customer principalAmount remainingBalance loanStatus', populate: { path: 'customer', select: 'fullName email' } }).sort({ paymentDate: -1 }).limit(100).lean();
  res.json({ payments });
}));

router.post('/', asyncHandler(async (req, res) => {
  const loanId = String(req.body.loanId || '');
  const amount = money(req.body.amountPaid);
  if (!loanId || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: 'Enter a valid loan and a payment amount greater than zero.' });

  // Atomic conditional update prevents two requests from charging beyond the current balance.
  const updatedLoan = await Loan.findOneAndUpdate(
    { _id: loanId, loanStatus: 'APPROVED', remainingBalance: { $gte: amount } },
    { $inc: { remainingBalance: -amount } },
    { new: true }
  );
  if (!updatedLoan) {
    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found.' });
    if (loan.loanStatus !== 'APPROVED') return res.status(400).json({ message: 'Payments can only be recorded against approved loans.' });
    return res.status(400).json({ message: `Payment exceeds the outstanding balance of ₹${loan.remainingBalance.toLocaleString('en-IN')}.` });
  }

  let payment;
  try {
    [payment] = await Payment.create([{ loan: updatedLoan._id, amountPaid: amount }]);
  } catch (error) {
    // Restore the balance only when the payment ledger entry itself could not be saved.
    await Loan.updateOne({ _id: updatedLoan._id }, { $inc: { remainingBalance: amount }, $set: { loanStatus: 'APPROVED' } });
    throw error;
  }
  if (updatedLoan.remainingBalance <= 0) {
    await Loan.updateOne({ _id: updatedLoan._id, remainingBalance: 0 }, { $set: { loanStatus: 'CLOSED' } });
  }
  await payment.populate({ path: 'loan', populate: { path: 'customer', select: 'fullName' } });
  return res.status(201).json({ payment, message: 'Payment recorded and balance updated.' });
}));

export default router;
