import { Router } from 'express';
import Customer from '../models/Customer.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

function validateCustomer(body) {
  const fullName = String(body.fullName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  if (fullName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length < 7 || phone.length > 20) {
    return { error: 'Enter a name, valid email address, and phone number (7–20 characters).' };
  }
  return { fullName, email, phone };
}

router.get('/', asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim();
  const filter = { isDeleted: false };
  if (search) filter.$or = [
    { fullName: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
    { email: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
    { phone: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
  ];
  const customers = await Customer.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ customers });
}));

router.post('/', asyncHandler(async (req, res) => {
  const valid = validateCustomer(req.body);
  if (valid.error) return res.status(400).json({ message: valid.error });
  if (await Customer.exists({ email: valid.email })) return res.status(409).json({ message: 'A customer with this email already exists.' });
  const customer = await Customer.create(valid);
  res.status(201).json({ customer });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const valid = validateCustomer(req.body);
  if (valid.error) return res.status(400).json({ message: valid.error });
  const customer = await Customer.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, valid, { new: true, runValidators: true });
  if (!customer) return res.status(404).json({ message: 'Customer not found.' });
  res.json({ customer });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
  if (!customer) return res.status(404).json({ message: 'Customer not found.' });
  res.json({ message: 'Customer archived successfully.' });
}));

export default router;
