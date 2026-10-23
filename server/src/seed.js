import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from './models/Customer.js';
import Loan from './models/Loan.js';
import Payment from './models/Payment.js';
import Delinquency from './models/Delinquency.js';

if (!process.env.MONGO_URI) {
  console.error('Set MONGO_URI in server/.env before seeding.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  if (await Customer.estimatedDocumentCount()) {
    console.log('Seed skipped: customers already exist. No records were changed.');
    process.exitCode = 0;
  } else {
    const customers = await Customer.insertMany([
      { fullName: 'Aarav Kulkarni', email: 'aarav@example.com', phone: '+91 98765 01001' },
      { fullName: 'Meera Patil', email: 'meera@example.com', phone: '+91 98765 01002' },
      { fullName: 'Ishaan Mehta', email: 'ishaan@example.com', phone: '+91 98765 01003' },
      { fullName: 'Ananya Sharma', email: 'ananya@example.com', phone: '+91 98765 01004' },
      { fullName: 'Kabir Deshmukh', email: 'kabir@example.com', phone: '+91 98765 01005' },
      { fullName: 'Sana Nair', email: 'sana@example.com', phone: '+91 98765 01006' }
    ]);
    const daysAgo = (n) => new Date(Date.now() - n * 86400000);
    const loans = await Loan.insertMany([
      { customer: customers[0]._id, principalAmount: 350000, remainingBalance: 228000, interestRate: 10.5, tenureMonths: 36, startDate: daysAgo(155), loanStatus: 'APPROVED' },
      { customer: customers[1]._id, principalAmount: 520000, remainingBalance: 396000, interestRate: 9.75, tenureMonths: 48, startDate: daysAgo(120), loanStatus: 'APPROVED' },
      { customer: customers[2]._id, principalAmount: 180000, remainingBalance: 0, interestRate: 11.25, tenureMonths: 12, startDate: daysAgo(420), loanStatus: 'CLOSED' },
      { customer: customers[3]._id, principalAmount: 780000, remainingBalance: 735000, interestRate: 10.25, tenureMonths: 60, startDate: daysAgo(108), loanStatus: 'APPROVED' },
      { customer: customers[4]._id, principalAmount: 245000, remainingBalance: 190000, interestRate: 13.5, tenureMonths: 24, startDate: daysAgo(145), loanStatus: 'DEFAULTED' },
      { customer: customers[5]._id, principalAmount: 460000, remainingBalance: 347000, interestRate: 8.9, tenureMonths: 36, startDate: daysAgo(45), loanStatus: 'APPROVED' },
      { customer: customers[0]._id, principalAmount: 125000, remainingBalance: 0, interestRate: 12, tenureMonths: 12, startDate: daysAgo(600), loanStatus: 'CLOSED' },
      { customer: customers[2]._id, principalAmount: 610000, remainingBalance: 582000, interestRate: 10.6, tenureMonths: 48, startDate: daysAgo(92), loanStatus: 'APPROVED' }
    ]);
    const paymentRows = [
      // Each loan's seeded payment history reconciles to principal minus remaining balance.
      { loan: loans[0]._id, amountPaid: 20000, paymentDate: daysAgo(150) },
      { loan: loans[0]._id, amountPaid: 20000, paymentDate: daysAgo(120) },
      { loan: loans[0]._id, amountPaid: 20000, paymentDate: daysAgo(90) },
      { loan: loans[0]._id, amountPaid: 20000, paymentDate: daysAgo(60) },
      { loan: loans[0]._id, amountPaid: 20000, paymentDate: daysAgo(30) },
      { loan: loans[0]._id, amountPaid: 22000, paymentDate: daysAgo(5) },
      { loan: loans[1]._id, amountPaid: 20000, paymentDate: daysAgo(110) },
      { loan: loans[1]._id, amountPaid: 20000, paymentDate: daysAgo(90) },
      { loan: loans[1]._id, amountPaid: 21000, paymentDate: daysAgo(70) },
      { loan: loans[1]._id, amountPaid: 21000, paymentDate: daysAgo(50) },
      { loan: loans[1]._id, amountPaid: 21000, paymentDate: daysAgo(30) },
      { loan: loans[1]._id, amountPaid: 21000, paymentDate: daysAgo(5) },
      { loan: loans[2]._id, amountPaid: 90000, paymentDate: daysAgo(300) },
      { loan: loans[2]._id, amountPaid: 90000, paymentDate: daysAgo(100) },
      { loan: loans[3]._id, amountPaid: 15000, paymentDate: daysAgo(80) },
      { loan: loans[3]._id, amountPaid: 15000, paymentDate: daysAgo(50) },
      { loan: loans[3]._id, amountPaid: 15000, paymentDate: daysAgo(10) },
      { loan: loans[4]._id, amountPaid: 25000, paymentDate: daysAgo(140) },
      { loan: loans[4]._id, amountPaid: 30000, paymentDate: daysAgo(120) },
      { loan: loans[5]._id, amountPaid: 38000, paymentDate: daysAgo(40) },
      { loan: loans[5]._id, amountPaid: 37000, paymentDate: daysAgo(25) },
      { loan: loans[5]._id, amountPaid: 38000, paymentDate: daysAgo(5) },
      { loan: loans[6]._id, amountPaid: 60000, paymentDate: daysAgo(500) },
      { loan: loans[6]._id, amountPaid: 65000, paymentDate: daysAgo(200) },
      { loan: loans[7]._id, amountPaid: 14000, paymentDate: daysAgo(60) },
      { loan: loans[7]._id, amountPaid: 14000, paymentDate: daysAgo(20) }
    ];
    await Payment.insertMany(paymentRows);
    await Delinquency.insertMany([
      { loan: loans[0]._id, daysOverdue: 24, outstandingAmount: loans[0].remainingBalance, delinquencyDate: daysAgo(8), riskLevel: 'LOW', resolutionStatus: 'OPEN' },
      { loan: loans[1]._id, daysOverdue: 68, outstandingAmount: loans[1].remainingBalance, delinquencyDate: daysAgo(5), riskLevel: 'MEDIUM', resolutionStatus: 'OPEN' },
      { loan: loans[3]._id, daysOverdue: 78, outstandingAmount: loans[3].remainingBalance, delinquencyDate: daysAgo(4), riskLevel: 'MEDIUM', resolutionStatus: 'OPEN' },
      { loan: loans[4]._id, daysOverdue: 116, outstandingAmount: loans[4].remainingBalance, delinquencyDate: daysAgo(12), riskLevel: 'HIGH', resolutionStatus: 'OPEN' },
      { loan: loans[2]._id, daysOverdue: 8, outstandingAmount: 0, delinquencyDate: daysAgo(200), riskLevel: 'LOW', resolutionStatus: 'RESOLVED' }
    ]);
    console.log(`Seed complete: ${customers.length} customers, ${loans.length} loans, ${paymentRows.length} payments, 5 risk records.`);
    console.log('Create your own application account from the Credora registration page.');
  }
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
