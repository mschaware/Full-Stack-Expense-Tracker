import { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { expenseService, Expense } from '../services/expenseService';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmModal({ isOpen, expense, onClose, onSuccess }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !expense) return null;

  const handleDelete = async () => {
    setError('');
    setLoading(true);

    try {
      await expenseService.delete(expense.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">Delete Expense</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              This action cannot be undone. The expense will be permanently removed.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Category:</span>
              <span className="text-slate-800">{expense.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Amount:</span>
              <span className="text-slate-800 font-semibold">${Number(expense.amount).toFixed(2)}</span>
            </div>
            {expense.comments && (
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Comments:</span>
                <span className="text-slate-800">{expense.comments}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              {loading ? 'Deleting...' : 'Delete Expense'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
