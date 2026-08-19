import { useEffect, useState } from "react";
import { useSafePagination } from "../../hooks/useSafePagination";

import ExpenseTable from "./ExpenseTable";
import ExpenseForm from "./ExpenseForm";

import Spinner from "../ui/Spinner";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  restoreExpense,
} from "../../services/expense.service";

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pagination, setPagination] = useState({});
  const { currentPage: safePage, totalPages: safeTotalPages, hasPreviousPage, hasNextPage } = useSafePagination(page, pagination?.totalPages, setPage);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openRestore, setOpenRestore] = useState(false);

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteExpenseData, setDeleteExpenseData] = useState(null);
  const [restoreExpenseData, setRestoreExpenseData] = useState(null);

  const fetchExpenses = async () => {
    try {
      const response = await getExpenses(page, 10, search, category, startDate, endDate);
      setExpenses(response?.expenses ?? []);
      setPagination(response?.pagination ?? {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load expenses.");
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadExpenses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getExpenses(page, 10, search, category, startDate, endDate);

        if (!ignore) {
          setExpenses(response?.expenses ?? []);
          setPagination(response?.pagination ?? {});
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load expenses.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadExpenses();

    return () => {
      ignore = true;
    };
  }, [page, search, category, startDate, endDate]);

  const handleCreate = async (data) => {
    try {
      setSaving(true);
      await createExpense(data);
      setOpenCreate(false);
      await fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setOpenEdit(true);
  };

  const handleUpdate = async (data) => {
    try {
      setSaving(true);
      await updateExpense(selectedExpense.id, data);
      setOpenEdit(false);
      setSelectedExpense(null);
      await fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (expense) => {
    setDeleteExpenseData(expense);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      await deleteExpense(deleteExpenseData.id);
      setOpenDelete(false);
      setDeleteExpenseData(null);
      await fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = (expense) => {
    setRestoreExpenseData(expense);
    setOpenRestore(true);
  };

  const confirmRestore = async () => {
    try {
      setSaving(true);
      await restoreExpense(restoreExpenseData.id);
      setOpenRestore(false);
      setRestoreExpenseData(null);
      await fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to restore expense.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-[var(--danger-soft)] p-4 text-[var(--danger)]">{error}</div>;
  }

  return (
    <>
      <div className="page-container page-standard expense-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Expenses</h1>
            <p className="text-sm text-[var(--text-secondary)]">Track expense history with category and date filters.</p>
          </div>
          <Button onClick={() => setOpenCreate(true)}>Add Expense</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-[var(--text)] outline-none focus:border-primary"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-[var(--text)] outline-none focus:border-primary"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-[var(--text)] outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder="Category ID"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-[var(--text)] outline-none focus:border-primary"
          />
        </div>

        <div className="page-table"><ExpenseTable
          expenses={expenses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
        </div>

        <div className="page-pagination mt-0 flex items-center justify-between">
          <Button size="sm" variant="secondary" disabled={!hasPreviousPage} onClick={() => hasPreviousPage && setPage(safePage - 1)}>Previous</Button>

          <span className="text-[var(--text)]">
            Page {safePage} of {safeTotalPages}
          </span>

          <Button size="sm" variant="secondary" disabled={!hasNextPage} onClick={() => hasNextPage && setPage(safePage + 1)}>Next</Button>
        </div>
      </div>

      <Modal isOpen={openCreate} onClose={() => setOpenCreate(false)} title="Create Expense" size="xl">
        <ExpenseForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal
        isOpen={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedExpense(null);
        }}
        title="Edit Expense"
        size="xl"
      >
        <ExpenseForm
          key={selectedExpense?.id || "edit"}
          initialData={selectedExpense || { id: null }}
          onSubmit={handleUpdate}
          loading={saving}
        />
      </Modal>

      <Modal isOpen={openDelete} onClose={() => { setOpenDelete(false); setDeleteExpenseData(null); }} title="Delete Expense">
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{deleteExpenseData?.expenseNumber}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenDelete(false); setDeleteExpenseData(null); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={openRestore} onClose={() => { setOpenRestore(false); setRestoreExpenseData(null); }} title="Restore Expense">
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Restore <span className="font-semibold text-[var(--text)]">{restoreExpenseData?.expenseNumber}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenRestore(false); setRestoreExpenseData(null); }}>
              Cancel
            </Button>
            <Button onClick={confirmRestore} disabled={saving}>
              {saving ? "Restoring..." : "Restore"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExpenseList;
