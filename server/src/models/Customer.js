import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 120 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ isDeleted: 1, fullName: 1 });
export default mongoose.model('Customer', customerSchema);
