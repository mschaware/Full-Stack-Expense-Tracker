import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { expenseService, Expense } from '../services/expenseService';
import ExpensesTable from '../components/ExpensesTable';
import CategoryPieChart from '../components/CategoryPieChart';
import AddExpenseModal from '../components/AddExpenseModal';
import EditExpenseModal from '../components/EditExpenseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { Plus, LogOut, Wallet, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categorySummary, setCategorySummary] = useState<{ category: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'analytics'>('expenses');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expensesData, summaryData] = await Promise.all([
        expenseService.getAll(),
        expenseService.getCategorySummary(),
      ]);
      setExpenses(expensesData);
      setCategorySummary(summaryData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  const handleDelete = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const topCategory = categorySummary.length > 0 ? categorySummary[0].category : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Expense Tracker</h1>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Expenses</p>
                <p className="text-3xl font-bold text-slate-800">${totalExpenses.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Average Expense</p>
                <p className="text-3xl font-bold text-slate-800">${averageExpense.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Top Category</p>
                <p className="text-2xl font-bold text-slate-800 truncate">{topCategory}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'expenses'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Analytics
            </button>
          </div>

          {activeTab === 'expenses' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-600/30 transition"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-600">Loading your expenses...</p>
          </div>
        ) : (
          <>
            {activeTab === 'expenses' ? (
              <ExpensesTable
                expenses={expenses}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <CategoryPieChart data={categorySummary} />
            )}
          </>
        )}
      </main>

      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadData}
      />

      <EditExpenseModal
        isOpen={showEditModal}
        expense={selectedExpense}
        onClose={() => {
          setShowEditModal(false);
          setSelectedExpense(null);
        }}
        onSuccess={loadData}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        expense={selectedExpense}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedExpense(null);
        }}
        onSuccess={loadData}
      />
    </div>
  );
}
