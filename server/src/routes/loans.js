import { Router } from 'express';
import Loan from '../models/Loan.js';
import Customer from '../models/Customer.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status && ['APPROVED', 'CLOSED', 'DEFAULTED'].includes(req.query.status)) filter.loanStatus = req.query.status;
  const loans = await Loan.find(filter).populate('customer', 'fullName email phone').sort({ createdAt: -1 }).lean();
  res.json({ loans });
}));

router.post('/', asyncHandler(async (req, res) => {
  const customerId = String(req.body.customerId || '');
  const principalAmount = Number(req.body.principalAmount);
  const interestRate = Number(req.body.interestRate);
  const tenureMonths = Number(req.body.tenureMonths);
  const startDate = new Date(req.body.startDate);
  if (!customerId || !Number.isFinite(principalAmount) || principalAmount <= 0 || !Number.isFinite(interestRate) || interestRate < 0 || interestRate > 100 || !Number.isInteger(tenureMonths) || tenureMonths < 1 || !Number.isFinite(startDate.getTime())) {
    return res.status(400).json({ message: 'Enter a valid customer, principal, interest rate, tenure, and start date.' });
  }
  const customer = await Customer.findOne({ _id: customerId, isDeleted: false });
  if (!customer) return res.status(400).json({ message: 'Choose an active customer before creating a loan.' });
  const loan = await Loan.create({ customer: customer._id, principalAmount, remainingBalance: principalAmount, interestRate, tenureMonths, startDate, loanStatus: 'APPROVED' });
  await loan.populate('customer', 'fullName email phone');
  res.status(201).json({ loan });
}));

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const allowed = ['APPROVED', 'CLOSED', 'DEFAULTED'];
  if (!allowed.includes(req.body.loanStatus)) return res.status(400).json({ message: 'Unsupported loan status.' });
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ message: 'Loan not found.' });
  if (req.body.loanStatus === 'CLOSED' && loan.remainingBalance > 0) return res.status(400).json({ message: 'A loan with an outstanding balance cannot be closed.' });
  if (req.body.loanStatus === 'APPROVED' && loan.remainingBalance <= 0) return res.status(400).json({ message: 'A fully paid loan cannot be reactivated.' });
  loan.loanStatus = req.body.loanStatus;
  await loan.save();
  await loan.populate('customer', 'fullName email phone');
  res.json({ loan });
}));

export default router;
