import mongoose from 'mongoose';

const userBalanceSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('UserBalance', userBalanceSchema);