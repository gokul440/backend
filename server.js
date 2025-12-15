import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { auth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import groupRoutes from './routes/groups.js';
import expenseRoutes from './routes/expenses.js';
import './models/User.js';
import './models/Group.js';
import './models/Expense.js';
import './models/UserBalance.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(auth);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    console.log('Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Server running without MongoDB.');
    // Don't exit, continue running
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/api/test', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ 
      connected: mongoose.connection.readyState === 1,
      database: mongoose.connection.name,
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    const User = mongoose.model('User');
    const Group = mongoose.model('Group');
    const Expense = mongoose.model('Expense');
    
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: '$2a$10$example'
    });
    
    const group = await Group.create({
      name: 'Test Group',
      members: [user._id],
      createdBy: user._id
    });
    
    await Expense.create({
      description: 'Test Expense',
      amount: 100,
      paidBy: user._id,
      group: group._id,
      splitBetween: [user._id]
    });
    
    res.json({ message: 'Sample data created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});