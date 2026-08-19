import { useEffect, useState } from "react";
import { useSafePagination } from "../../hooks/useSafePagination";
import { toast } from "react-hot-toast";

import CategoryTable from "../../components/category/CategoryTable";
import CategoryForm from "../../components/category/CategoryForm";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import Skeleton from "../../components/ui/Skeleton";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/category.service";

const CategoryList = () => {
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteCategoryData, setDeleteCategoryData] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await getCategories(page, 10, search);
      setCategories(response.categories ?? []);
      setPagination(response.pagination ?? {});
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

        const response = await getCategories(page, 10, search);

        if (!ignore) {
          setCategories(response.categories ?? []);
          setPagination(response.pagination ?? {});
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
      await createCategory(data);
      setOpenCreate(false);
      toast.success("Category created successfully.");
      await fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category.");
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
      await updateCategory(selectedCategory.id, data);
      setOpenEdit(false);
      setSelectedCategory(null);
      toast.success("Category updated successfully.");
      await fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category.");
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
      await deleteCategory(deleteCategoryData.id);
      setOpenDelete(false);
      setDeleteCategoryData(null);
      toast.success("Category deleted successfully.");
      await fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="wc-page world-module world-masterdata space-y-5 px-2 py-10 sm:px-0">
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3 rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-3xl" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-3xl" />
              <Skeleton className="h-12 w-full rounded-3xl" />
              <Skeleton className="h-12 w-full rounded-3xl" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] p-6 text-[var(--danger)] shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="wc-page world-module world-masterdata space-y-6 page-container">
        <PageHeader
          badge="Master data"
          title="Categories"
          description="Manage category entries used across your product catalog."
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" onClick={() => setOpenCreate(true)}>Add Category</Button>
            </div>
          }
        />

        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/80 px-4 py-3 text-[var(--text)] shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)]">{categories.length} categories</span>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          {categories.length === 0 ? (
            <EmptyState
              title="No categories yet"
              description="Create categories to keep your product catalog organized."
              action={<Button onClick={() => setOpenCreate(true)}>Add Category</Button>}
            />
          ) : (
            <CategoryTable categories={categories} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </Card>

        <Pagination
          page={safePage}
          totalPages={safeTotalPages}
          onPrevious={() => setPage(safePage - 1)}
          onNext={() => setPage(safePage + 1)}
        />
      </div>

      <Modal isOpen={openCreate} onClose={() => setOpenCreate(false)} title="Create Category">
        <CategoryForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal
        isOpen={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedCategory(null);
        }}
        title="Edit Category"
      >
        <CategoryForm
          key={selectedCategory?.id || "edit"}
          initialData={selectedCategory || { id: null, name: "" }}
          onSubmit={handleUpdate}
          loading={saving}
        />
      </Modal>

      <Modal
        isOpen={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setDeleteCategoryData(null);
        }}
        title="Delete Category"
      >
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{deleteCategoryData?.name}</span>?
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenDelete(false); setDeleteCategoryData(null); }}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CategoryList;
