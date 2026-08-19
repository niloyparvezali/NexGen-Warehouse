import { useEffect, useState } from "react";
import { useSafePagination } from "../../hooks/useSafePagination";
import { toast } from "react-hot-toast";

import BrandTable from "../../components/brand/BrandTable";
import BrandForm from "../../components/brand/BrandForm";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import Skeleton from "../../components/ui/Skeleton";

import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../services/brand.service";
const BrandList = () => {
  const [brands, setBrands] = useState([]);
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

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [deleteBrandData, setDeleteBrandData] = useState(null);
  const fetchBrands = async () => {
    try {
      const response = await getBrands(page, 10, search);
      setBrands(response?.brands ?? []);
      setPagination(response?.pagination ?? {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load brands.");
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadBrands = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getBrands(page, 10, search);

        if (!ignore) {
          setBrands(response?.brands ?? []);
          setPagination(response?.pagination ?? {});
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load brands.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadBrands();

    return () => {
      ignore = true;
    };
  }, [page, search]);
  const handleCreate = async (data) => {
    try {
      setSaving(true);

      await createBrand(data);

      setOpenCreate(false);
      toast.success("Brand created successfully.");
      await fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create brand.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setOpenEdit(true);
  };

  const handleUpdate = async (data) => {
    try {
      setSaving(true);

      await updateBrand(selectedBrand.id, data);

      setOpenEdit(false);
      setSelectedBrand(null);
      toast.success("Brand updated successfully.");
      await fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update brand.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (brand) => {
    setDeleteBrandData(brand);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);

      await deleteBrand(deleteBrandData.id);

      setOpenDelete(false);
      setDeleteBrandData(null);
      toast.success("Brand deleted successfully.");
      await fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete brand.");
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
        title="Brands"
        description="Manage brand records used across products and inventory."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={() => setOpenCreate(true)}>Add Brand</Button>
          </div>
        }
      />

        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search brands..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/80 px-4 py-3 text-[var(--text)] shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)]">{brands.length} brands</span>
              </div>
          </div>
        </Card>

        <Card className="p-0">
          {brands.length === 0 ? (
            <EmptyState
              title="No brands yet"
              description="Create a brand to start organizing your product catalog."
              action={<Button onClick={() => setOpenCreate(true)}>Add Brand</Button>}
            />
          ) : (
            <BrandTable brands={brands} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </Card>

        <Pagination
          page={safePage}
          totalPages={safeTotalPages}
          onPrevious={() => setPage(safePage - 1)}
          onNext={() => setPage(safePage + 1)}
        />
      </div>

      <Modal isOpen={openCreate} onClose={() => setOpenCreate(false)} title="Create Brand">
        <BrandForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal
        isOpen={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedBrand(null);
        }}
        title="Edit Brand"
      >
        <BrandForm
          key={selectedBrand?.id || "edit"}
          initialData={selectedBrand || { id: null, name: "" }}
          onSubmit={handleUpdate}
          loading={saving}
        />
      </Modal>

      <Modal
        isOpen={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setDeleteBrandData(null);
        }}
        title="Delete Brand"
      >
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{deleteBrandData?.name}</span>?
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenDelete(false); setDeleteBrandData(null); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BrandList;
