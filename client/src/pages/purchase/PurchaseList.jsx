import { useEffect, useState } from "react";
import { useSafePagination } from "../../hooks/useSafePagination";

import { formatMoney } from "../../utils/formatters";
import PurchaseTable from "../../components/purchase/PurchaseTable";
import PurchaseForm from "../../components/purchase/PurchaseForm";

import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

import {
  getPurchases,  getPurchase,  createPurchase,
  updatePurchase,
  deletePurchase,
  restorePurchase,
} from "../../services/purchase.service";

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
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
  const [openView, setOpenView] = useState(false);

  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [deletePurchaseData, setDeletePurchaseData] = useState(null);
  const [restorePurchaseData, setRestorePurchaseData] = useState(null);

  useEffect(() => {
    console.log("PurchaseList: openCreate =", openCreate);
  }, [openCreate]);

  const fetchPurchases = async () => {
    try {
      const response = await getPurchases(page, 10, search);
      setPurchases(response?.purchases ?? []);
      setPagination(response?.pagination ?? {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load purchases.");
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadPurchases = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getPurchases(page, 10, search);

        if (!ignore) {
          setPurchases(response?.purchases ?? []);
          setPagination(response?.pagination ?? {});
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load purchases.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadPurchases();

    return () => {
      ignore = true;
    };
  }, [page, search]);

  const handleCreate = async (data) => {
    try {
      setSaving(true);
      await createPurchase(data);
      setOpenCreate(false);
      await fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create purchase.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (purchase) => {
    try {
      setLoading(true);
      const fullPurchase = await getPurchase(purchase.id);
      setSelectedPurchase(fullPurchase);
      setOpenEdit(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load purchase details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      setSaving(true);
      await updatePurchase(selectedPurchase.id, data);
      setOpenEdit(false);
      setSelectedPurchase(null);
      await fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update purchase.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (purchase) => {
    setDeletePurchaseData(purchase);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      await deletePurchase(deletePurchaseData.id);
      setOpenDelete(false);
      setDeletePurchaseData(null);
      await fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete purchase.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = (purchase) => {
    setRestorePurchaseData(purchase);
    setOpenRestore(true);
  };

  const confirmRestore = async () => {
    try {
      setSaving(true);
      await restorePurchase(restorePurchaseData.id);
      setOpenRestore(false);
      setRestorePurchaseData(null);
      await fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to restore purchase.");
    } finally {
      setSaving(false);
    }
  };

  const handleView = async (purchase) => {
    try {
      setLoading(true);
      const fullPurchase = await getPurchase(purchase.id);
      setSelectedPurchase(fullPurchase);
      setOpenView(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load purchase details.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (purchase) => {
    window.print();
    return purchase;
  };

  if (loading) {
    return (
      <div className="wc-page world-module world-purchase wc-loading-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-[var(--danger-soft)] p-4 text-[var(--danger)]">{error}</div>;
  }

  return (
    <>
      <div className="wc-page world-module world-purchase space-y-6 page-container">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Purchases</h1>
          <Button onClick={() => { console.log("PurchaseList: Add Purchase clicked"); setOpenCreate(true); }}>Add Purchase</Button>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search purchase..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-72 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-[var(--text)] outline-none focus:border-primary"
          />
        </div>

        <PurchaseTable purchases={purchases} onEdit={handleEdit} onDelete={handleDelete} onRestore={handleRestore} onView={handleView} onPrint={handlePrint} />

        <div className="mt-6 flex items-center justify-between">
          <Button size="sm" variant="secondary" disabled={!hasPreviousPage} onClick={() => hasPreviousPage && setPage(safePage - 1)}>Previous</Button>

          <span className="text-[var(--text)]">Page {safePage} of {safeTotalPages}</span>

          <Button size="sm" variant="secondary" disabled={!hasNextPage} onClick={() => hasNextPage && setPage(safePage + 1)}>Next</Button>
        </div>
      </div>

      <Modal isOpen={openCreate} onClose={() => setOpenCreate(false)} title="Create Purchase" size="xl">
        <PurchaseForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal isOpen={openEdit} onClose={() => { setOpenEdit(false); setSelectedPurchase(null); }} title="Edit Purchase" size="xl">
        <PurchaseForm key={selectedPurchase?.id || "edit"} initialData={selectedPurchase} onSubmit={handleUpdate} loading={saving} />
      </Modal>

      <Modal isOpen={openDelete} onClose={() => { setOpenDelete(false); setDeletePurchaseData(null); }} title="Delete Purchase">
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{deletePurchaseData?.purchaseNumber}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenDelete(false); setDeletePurchaseData(null); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={openRestore} onClose={() => { setOpenRestore(false); setRestorePurchaseData(null); }} title="Restore Purchase">
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Restore <span className="font-semibold text-[var(--text)]">{restorePurchaseData?.purchaseNumber}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenRestore(false); setRestorePurchaseData(null); }}>
              Cancel
            </Button>
            <Button onClick={confirmRestore} disabled={saving}>
              {saving ? "Restoring..." : "Restore"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={openView} onClose={() => { setOpenView(false); setSelectedPurchase(null); }} title="Purchase Details" size="lg">
        {selectedPurchase ? (
          <div className="space-y-4 text-[var(--text-secondary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Purchase Number</p>
                <p className="text-lg font-semibold text-[var(--text)]">{selectedPurchase.purchaseNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--text-secondary)]">Supplier</p>
                <p className="text-lg font-semibold text-[var(--text)]">{selectedPurchase.supplier?.supplierName || "—"}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Invoice Number</p>
                <p className="text-[var(--text)]">{selectedPurchase.invoiceNumber || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Reference Number</p>
                <p className="text-[var(--text)]">{selectedPurchase.referenceNumber || "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Notes</p>
              <p className="text-[var(--text)]">{selectedPurchase.notes || "—"}</p>
            </div>
            {selectedPurchase.attachment ? (
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Attachment</p>
                <a href={selectedPurchase.attachment} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary underline">
                  View document
                </a>
              </div>
            ) : null}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/80 p-4">
              <p className="text-sm text-[var(--text-secondary)]">Grand Total</p>
              <p className="text-2xl font-semibold text-[var(--text)]">৳ {formatMoney(selectedPurchase.total || 0)}</p>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default PurchaseList;
