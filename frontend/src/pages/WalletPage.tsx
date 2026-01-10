/**
 * Wallet Page - Virtual wallet management
 */

import { useEffect, useState } from 'react';
import { walletService } from '../services/wallet.service';
import { formatPrice } from '../utils/helpers';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAppDispatch } from '../hooks/redux';
import { updateBalance } from '../store/authSlice';

interface Transaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export default function WalletPage() {
  const dispatch = useAppDispatch();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [balanceData, transactionsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(0, 20)
      ]);
      const newBalance = balanceData.balance || 0;
      setBalance(newBalance);
      dispatch(updateBalance(newBalance));
      
      // Backend returns { transactions: [...], total: number }
      if (transactionsData.transactions) {
        setTransactions(transactionsData.transactions);
      } else if (Array.isArray(transactionsData)) {
        setTransactions(transactionsData);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      setBalance(0);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (amount: number) => {
    if (amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    setIsDepositing(true);
    try {
      await walletService.deposit(amount);
      alert(`Успешно пополнено на ${formatPrice(amount)}!`);
      setDepositAmount('');
      await loadWalletData();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Ошибка при пополнении');
    } finally {
      setIsDepositing(false);
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Виртуальный кошелек</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white">
            <div className="text-sm opacity-90 mb-2">Баланс кошелька</div>
            <div className="text-4xl font-bold mb-6">{formatPrice(balance)}</div>
            <div className="text-xs opacity-75">
              💡 Учебный кошелек с виртуальными деньгами
            </div>
          </div>

          {/* Quick deposit */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-bold mb-4">Быстрое пополнение</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleDeposit(amount)}
                  disabled={isDepositing}
                  className="px-4 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition font-semibold disabled:opacity-50"
                >
                  +{amount}₸
                </button>
              ))}
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Своя сумма
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Введите сумму"
                  min="1"
                />
                <Button
                  onClick={() => handleDeposit(Number(depositAmount))}
                  disabled={isDepositing || !depositAmount}
                >
                  Пополнить
                </Button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <strong>ℹ️ Обратите внимание:</strong>
              <br />
              Это учебный проект. Деньги виртуальные и не имеют реальной ценности.
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">История операций</h3>

            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">💳</div>
                <p>История операций пуста</p>
                <p className="text-sm mt-2">Пополните кошелек, чтобы начать</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === 'deposit' || transaction.type === 'refund'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'deposit' && '📥'}
                        {transaction.type === 'payment' && '🛒'}
                        {transaction.type === 'refund' && '↩️'}
                        {transaction.type === 'withdrawal' && '📤'}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {transaction.type === 'deposit' && 'Пополнение'}
                          {transaction.type === 'payment' && 'Оплата заказа'}
                          {transaction.type === 'refund' && 'Возврат средств'}
                          {transaction.type === 'withdrawal' && 'Вывод средств'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleString('ru-RU')}
                        </div>
                        {transaction.description && (
                          <div className="text-xs text-gray-400 mt-1">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {formatPrice(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
