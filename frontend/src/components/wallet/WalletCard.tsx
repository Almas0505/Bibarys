/**
 * Wallet Card Component
 * Displays wallet balance and transaction history
 */

import { useState, useEffect } from 'react';
import { walletService } from '../../services/wallet.service';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import Button from '../common/Button';
import Input from '../common/Input';

interface Transaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  balance_after: number;
  created_at: string;
}

export default function WalletCard() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch balance and transactions in parallel
      const [balanceData, transactionsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(0, 10)
      ]);
      
      setBalance(balanceData.balance);
      setTransactions(transactionsData.transactions || []);
    } catch (err: any) {
      console.error('Error loading wallet data:', err);
      setError(err.response?.data?.detail || 'Ошибка загрузки данных кошелька');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    try {
      setDepositing(true);
      const result = await walletService.deposit(amount);
      setBalance(result.balance);
      setDepositAmount('');
      setShowDeposit(false);
      
      // Reload transactions to show new deposit
      await loadWalletData();
      
      alert(`Успешно пополнено на ${formatPrice(amount)}`);
    } catch (err: any) {
      console.error('Error depositing:', err);
      alert(err.response?.data?.detail || 'Ошибка при пополнении');
    } finally {
      setDepositing(false);
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600';
      case 'purchase':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionSign = (amount: number) => {
    return amount >= 0 ? '+' : '';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8 text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">💳 Виртуальный кошелек</h3>
        <Button
          onClick={() => setShowDeposit(!showDeposit)}
          size="sm"
        >
          {showDeposit ? 'Отмена' : 'Пополнить'}
        </Button>
      </div>

      {/* Balance Display */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white mb-6">
        <p className="text-sm opacity-90 mb-2">Текущий баланс</p>
        <p className="text-4xl font-bold">{formatPrice(balance)}</p>
      </div>

      {/* Deposit Form */}
      {showDeposit && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3">Пополнение кошелька</h4>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Введите сумму"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="1"
            />
            <Button
              onClick={handleDeposit}
              disabled={depositing}
            >
              {depositing ? 'Пополнение...' : 'Пополнить'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Демо-режим: деньги добавляются виртуально для тестирования
          </p>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <h4 className="font-semibold mb-3">Последние операции</h4>
        
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {transaction.description || transaction.type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(transaction.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                    {getTransactionSign(transaction.amount)}{formatPrice(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-xs text-gray-500">
                    Баланс: {formatPrice(transaction.balance_after)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            Нет транзакций
          </div>
        )}
      </div>
    </div>
  );
}
