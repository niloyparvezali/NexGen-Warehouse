import { useEffect, useState } from "react";
import { useSafePagination } from "../../hooks/useSafePagination";

import CustomerTable from "../../components/customer/CustomerTable";
import CustomerForm from "../../components/customer/CustomerForm";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";

import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
} from "../../services/customer.service";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
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

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteCustomerData, setDeleteCustomerData] = useState(null);
  const [restoreCustomerData, setRestoreCustomerData] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers(page, 10, search);
      setCustomers(response?.customers ?? []);
      setPagination(response?.pagination ?? {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customers.");
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCustomers(page, 10, search);

        if (!ignore) {
          setCustomers(response?.customers ?? []);
          setPagination(response?.pagination ?? {});
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load customers.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      ignore = true;
    };
  }, [page, search]);

  const handleCreate = async (data) => {
    try {
      setSaving(true);
      await createCustomer(data);
      setOpenCreate(false);
      await fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create customer.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setOpenEdit(true);
  };

  const handleUpdate = async (data) => {
    try {
      setSaving(true);
      await updateCustomer(selectedCustomer.id, data);
      setOpenEdit(false);
      setSelectedCustomer(null);
      await fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update customer.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (customer) => {
    setDeleteCustomerData(customer);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      await deleteCustomer(deleteCustomerData.id);
      setOpenDelete(false);
      setDeleteCustomerData(null);
      await fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete customer.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = (customer) => {
    setRestoreCustomerData(customer);
    setOpenRestore(true);
  };

  const confirmRestore = async () => {
    try {
      setSaving(true);
      await restoreCustomer(restoreCustomerData.id);
      setOpenRestore(false);
      setRestoreCustomerData(null);
      await fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to restore customer.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="wc-page world-module world-customers wc-loading-screen">
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
      <div className="wc-page world-module world-customers space-y-6 page-container">
        <PageHeader
          badge="Master data"
          title="Customers"
          description="Manage customer profiles, contact details, and account statuses."
          actions={
            <Button size="sm" onClick={() => setOpenCreate(true)}>Add Customer</Button>
          }
        />

        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/80 px-4 py-3 text-[var(--text)] shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)]">{customers.length} customers</span>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          {customers.length === 0 ? (
            <EmptyState
              title="No customers yet"
              description="Create customer accounts and track contact details."
              action={<Button onClick={() => setOpenCreate(true)}>Add Customer</Button>}
            />
          ) : (
            <CustomerTable customers={customers} onEdit={handleEdit} onDelete={handleDelete} onRestore={handleRestore} />
          )}
        </Card>

        <Pagination
          page={safePage}
          totalPages={safeTotalPages}
          onPrevious={() => setPage(safePage - 1)}
          onNext={() => setPage(safePage + 1)}
        />
      </div>

      <Modal isOpen={openCreate} onClose={() => setOpenCreate(false)} title="Create Customer">
        <CustomerForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal isOpen={openEdit} onClose={() => { setOpenEdit(false); setSelectedCustomer(null); }} title="Edit Customer">
        <CustomerForm key={selectedCustomer?.id || "edit"} initialData={selectedCustomer || { id: null, name: "" }} onSubmit={handleUpdate} loading={saving} />
      </Modal>

      <Modal isOpen={openDelete} onClose={() => { setOpenDelete(false); setDeleteCustomerData(null); }} title="Delete Customer">
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{deleteCustomerData?.name}</span>?
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenDelete(false); setDeleteCustomerData(null); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={openRestore} onClose={() => { setOpenRestore(false); setRestoreCustomerData(null); }} title="Restore Customer">
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Restore <span className="font-semibold text-[var(--text)]">{restoreCustomerData?.name}</span>?
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenRestore(false); setRestoreCustomerData(null); }}>
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

export default CustomerList;
