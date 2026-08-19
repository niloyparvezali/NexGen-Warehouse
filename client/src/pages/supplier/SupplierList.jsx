import { useEffect, useState } from "react";
import { useSafePagination } from "../../hooks/useSafePagination";

import SupplierTable from "../../components/supplier/SupplierTable";
import SupplierForm from "../../components/supplier/SupplierForm";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";

import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../../services/supplier.service";

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
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

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [deleteSupplierData, setDeleteSupplierData] = useState(null);

  const fetchSuppliers = async () => {
    try {
      const response = await getSuppliers(page, 10, search);
      setSuppliers(response?.suppliers ?? []);
      setPagination(response?.pagination ?? {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load suppliers.");
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadSuppliers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getSuppliers(page, 10, search);

        if (!ignore) {
          setSuppliers(response?.suppliers ?? []);
          setPagination(response?.pagination ?? {});
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load suppliers.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadSuppliers();

    return () => {
      ignore = true;
    };
  }, [page, search]);

  const handleCreate = async (data) => {
    try {
      setSaving(true);
      await createSupplier(data);
      setOpenCreate(false);
      await fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create supplier.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setOpenEdit(true);
  };

  const handleUpdate = async (data) => {
    try {
      setSaving(true);
      await updateSupplier(selectedSupplier.id, data);
      setOpenEdit(false);
      setSelectedSupplier(null);
      await fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update supplier.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (supplier) => {
    setDeleteSupplierData(supplier);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      await deleteSupplier(deleteSupplierData.id);
      setOpenDelete(false);
      setDeleteSupplierData(null);
      await fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete supplier.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="wc-page world-module world-suppliers wc-loading-screen">
        <Spinner />
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
      <div className="wc-page world-module world-suppliers space-y-6 page-container">
        <PageHeader
          badge="Master data"
          title="Suppliers"
          description="Manage supplier contacts and vendor sources for procurement."
          actions={
            <Button size="sm" onClick={() => setOpenCreate(true)}>Add Supplier</Button>
          }
        />

        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/80 px-4 py-3 text-[var(--text)] shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)]">{suppliers.length} suppliers</span>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          {suppliers.length === 0 ? (
            <EmptyState
              title="No suppliers yet"
              description="Add supplier profiles to manage purchasing and vendor details."
              action={<Button onClick={() => setOpenCreate(true)}>Add Supplier</Button>}
            />
          ) : (
            <SupplierTable suppliers={suppliers} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </Card>

        <Pagination
          page={safePage}
          totalPages={safeTotalPages}
          onPrevious={() => setPage(safePage - 1)}
          onNext={() => setPage(safePage + 1)}
        />
      </div>

      <Modal isOpen={openCreate} onClose={() => setOpenCreate(false)} title="Create Supplier">
        <SupplierForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal isOpen={openEdit} onClose={() => { setOpenEdit(false); setSelectedSupplier(null); }} title="Edit Supplier">
        <SupplierForm key={selectedSupplier?.id || "edit"} initialData={selectedSupplier || { id: null, supplierName: "" }} onSubmit={handleUpdate} loading={saving} />
      </Modal>

      <Modal isOpen={openDelete} onClose={() => { setOpenDelete(false); setDeleteSupplierData(null); }} title="Delete Supplier">
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{deleteSupplierData?.supplierName}</span>?
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenDelete(false); setDeleteSupplierData(null); }}>
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

export default SupplierList;
