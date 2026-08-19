import { useEffect, useState } from "react";
import { useSafePagination } from "../../hooks/useSafePagination";

import ExpenseCategoryTable from "./ExpenseCategoryTable";
import ExpenseCategoryForm from "./ExpenseCategoryForm";

import Spinner from "../ui/Spinner";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

import {
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  restoreExpenseCategory,
} from "../../services/expenseCategory.service";

const ExpenseCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({});
  const { currentPage: safePage, totalPages: safeTotalPages, hasPreviousPage, hasNextPage } = useSafePagination(page, pagination?.totalPages, setPage);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openRestore, setOpenRestore] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteCategoryData, setDeleteCategoryData] = useState(null);
  const [restoreCategoryData, setRestoreCategoryData] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await getExpenseCategories(page, 10, search);
      setCategories(response?.categories ?? []);
      setPagination(response?.pagination ?? {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories.");
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getExpenseCategories(page, 10, search);

        if (!ignore) {
          setCategories(response?.categories ?? []);
          setPagination(response?.pagination ?? {});
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load categories.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      ignore = true;
    };
  }, [page, search]);

  const handleCreate = async (data) => {
    try {
      setSaving(true);
      await createExpenseCategory(data);
      setOpenCreate(false);
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create category.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setOpenEdit(true);
  };

  const handleUpdate = async (data) => {
    try {
      setSaving(true);
      await updateExpenseCategory(selectedCategory.id, data);
      setOpenEdit(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category) => {
    setDeleteCategoryData(category);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      await deleteExpenseCategory(deleteCategoryData.id);
      setOpenDelete(false);
      setDeleteCategoryData(null);
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete category.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = (category) => {
    setRestoreCategoryData(category);
    setOpenRestore(true);
  };

  const confirmRestore = async () => {
    try {
      setSaving(true);
      await restoreExpenseCategory(restoreCategoryData.id);
      setOpenRestore(false);
      setRestoreCategoryData(null);
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to restore category.");
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--text)]">Expense Categories</h1>
          <Button onClick={() => setOpenCreate(true)}>Add Category</Button>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-72 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-[var(--text)] outline-none focus:border-primary"
          />
        </div>

        <ExpenseCategoryTable
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />

        <div className="mt-6 flex items-center justify-between">
          <Button size="sm" variant="secondary" disabled={!hasPreviousPage} onClick={() => hasPreviousPage && setPage(safePage - 1)}>Previous</Button>

          <span className="text-[var(--text)]">
            Page {safePage} of {safeTotalPages}
          </span>

          <Button size="sm" variant="secondary" disabled={!hasNextPage} onClick={() => hasNextPage && setPage(safePage + 1)}>Next</Button>
        </div>
      </div>

      <Modal isOpen={openCreate} onClose={() => setOpenCreate(false)} title="Create Expense Category">
        <ExpenseCategoryForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal isOpen={openEdit} onClose={() => { setOpenEdit(false); setSelectedCategory(null); }} title="Edit Expense Category">
        <ExpenseCategoryForm
          key={selectedCategory?.id || "edit"}
          initialData={selectedCategory || { id: null, name: "", description: "" }}
          onSubmit={handleUpdate}
          loading={saving}
        />
      </Modal>

      <Modal isOpen={openDelete} onClose={() => { setOpenDelete(false); setDeleteCategoryData(null); }} title="Delete Expense Category">
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{deleteCategoryData?.name}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenDelete(false); setDeleteCategoryData(null); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={openRestore} onClose={() => { setOpenRestore(false); setRestoreCategoryData(null); }} title="Restore Expense Category">
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Restore <span className="font-semibold text-[var(--text)]">{restoreCategoryData?.name}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenRestore(false); setRestoreCategoryData(null); }}>
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

export default ExpenseCategoryList;
