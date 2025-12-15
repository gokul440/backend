import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const expenseSchema = new mongoose.Schema({
  groupId: { type: String, default: 'default' },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  participants: [String]
}, { timestamps: true });

const userBalanceSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
const UserBalance = mongoose.model('UserBalance', userBalanceSchema);

async function testMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    const testExpense = new Expense({
      description: 'Test Expense',
      amount: 100,
      paidBy: 'John',
      participants: ['John', 'Jane']
    });
    
    await testExpense.save();
    console.log('✅ Test expense saved');
    
    await UserBalance.findOneAndUpdate(
      { username: 'John' },
      { $inc: { balance: 50 } },
      { upsert: true, new: true }
    );
    
    console.log('✅ Balance updated');
    
    await Expense.deleteOne({ _id: testExpense._id });
    await UserBalance.deleteOne({ username: 'John' });
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testMongoDB();