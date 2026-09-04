import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, CreditCard, FileText } from 'lucide-react';
import type {
  Transaction,
  TransactionType,
  TransactionCategory,
  PaymentAccount
} from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

const CATEGORIES: TransactionCategory[] = [
  'Food & Dining',
  'Groceries',
  'Housing',
  'Transportation',
  'Shopping',
  'Subscriptions',
  'Health & Fitness',
  'Utilities',
  'Travel',
  'Salary',
  'Freelance',
  'Investments',
  'Education',
  'Miscellaneous'
];

const ACCOUNTS: PaymentAccount[] = [
  'Main Checking',
  'Savings Reserve',
  'Platinum Card',
  'Crypto Wallet',
  'Cash'
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('Food & Dining');
  const [account, setAccount] = useState<PaymentAccount>('Platinum Card');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!title.trim()) {
      setError('Please provide a title or merchant name.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    onAddTransaction({
      title: title.trim(),
      amount: Math.round(parsedAmount * 100) / 100,
      type,
      category,
      account,
      date,
      status: 'completed',
      note: note.trim() || undefined,
      merchant: title.trim()
    });

    // Reset and close
    setTitle('');
    setAmount('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Add Transaction
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Log a new expense or income item into your ledger
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                fontSize: '0.8125rem',
                fontWeight: 500
              }}
            >
              {error}
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Transaction Type</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: 'var(--bg-surface)',
                padding: '4px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  if (category === 'Salary' || category === 'Freelance') setCategory('Food & Dining');
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all var(--transition-fast)',
                  background: type === 'expense' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
                  color: type === 'expense' ? '#fb7185' : 'var(--text-secondary)',
                  border: type === 'expense' ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid transparent'
                }}
              >
                Expense (-)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  if (category === 'Food & Dining') setCategory('Salary');
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all var(--transition-fast)',
                  background: type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: type === 'income' ? '#34d399' : 'var(--text-secondary)',
                  border: type === 'income' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent'
                }}
              >
                Income (+)
              </button>
            </div>
          </div>

          {/* Amount & Title */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">Amount ($)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '32px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Merchant / Title</label>
              <input
                type="text"
                placeholder="e.g. Whole Foods, Apple, Stripe"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Category & Account */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">
                <Tag size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="form-select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ background: '#0f1724', color: '#fff' }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">
                <CreditCard size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Account
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value as PaymentAccount)}
                className="form-select"
              >
                {ACCOUNTS.map((acc) => (
                  <option key={acc} value={acc} style={{ background: '#0f1724', color: '#fff' }}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Note */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">
              <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Transaction Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">
              <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Lunch with team or client reimbursement"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
