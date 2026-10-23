import { Router } from 'express';
import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import Delinquency from '../models/Delinquency.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', asyncHandler(async (_req, res) => {
  const [customerCount, activeLoans, outstandingAgg, openRiskCount, monthlyPayments, recentPayments, loanCounts] = await Promise.all([
    Customer.countDocuments({ isDeleted: false }),
    Loan.countDocuments({ loanStatus: 'APPROVED' }),
    Loan.aggregate([{ $match: { loanStatus: 'APPROVED' } }, { $group: { _id: null, total: { $sum: '$remainingBalance' } } }]),
    Delinquency.countDocuments({ resolutionStatus: 'OPEN' }),
    Payment.aggregate([
      { $match: { paymentDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1) } } },
      { $group: { _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } }, total: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    Payment.find().sort({ paymentDate: -1 }).limit(5).populate({ path: 'loan', populate: { path: 'customer', select: 'fullName' } }).lean(),
    Loan.aggregate([{ $group: { _id: '$loanStatus', count: { $sum: 1 } } }])
  ]);

  const months = [];
  const now = new Date();
  for (let offset = 5; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const item = monthlyPayments.find((entry) => entry._id.year === date.getFullYear() && entry._id.month === date.getMonth() + 1);
    months.push({ month: date.toLocaleString('en-IN', { month: 'short' }), total: item?.total || 0, count: item?.count || 0 });
  }

  res.json({
    metrics: {
      customers: customerCount,
      activeLoans,
      outstanding: outstandingAgg[0]?.total || 0,
      openRisks: openRiskCount
    },
    monthlyPayments: months,
    loanPortfolio: loanCounts.map((entry) => ({ status: entry._id, count: entry.count })),
    recentPayments: recentPayments.map((payment) => ({
      id: payment._id,
      customer: payment.loan?.customer?.fullName || 'Customer unavailable',
      loanId: payment.loan?._id || null,
      amount: payment.amountPaid,
      date: payment.paymentDate
    }))
  });
}));

export default router;
