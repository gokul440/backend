import express from 'express';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import UserBalance from '../models/UserBalance.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { groupId = 'default', description, amount, paidBy, participants } = req.body;
    console.log('ℹ️ Saving expense:', { groupId, description, amount, paidBy, participants });
    
    const expense = new Expense({
      groupId,
      description,
      amount,
      paidBy,
      participants
    });
    
    await expense.save();
    console.log('✅ Expense saved to MongoDB');
    
    await updateUserBalances(participants, amount, paidBy);
    console.log('✅ Balances updated');
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('❌ Error saving expense:', error.message);
    res.status(400).json({ error: error.message });
  }
});

async function updateUserBalances(participants, amount, paidBy) {
  const share = amount / participants.length;
  
  for (const participant of participants) {
    const balanceChange = participant === paidBy ? amount - share : -share;
    
    await UserBalance.findOneAndUpdate(
      { username: participant },
      { $inc: { balance: balanceChange } },
      { upsert: true, new: true }
    );
  }
}

router.get('/group/:groupId', async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/balances/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    const expenses = await Expense.find({ groupId: req.params.groupId });
    
    const balances = {};
    group.participants.forEach(p => balances[p] = 0);
    
    expenses.forEach(exp => {
      const share = exp.amount / group.participants.length;
      balances[exp.paidBy] += exp.amount - share;
      group.participants.forEach(p => {
        if (p !== exp.paidBy) {
          balances[p] -= share;
        }
      });
    });
    
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;