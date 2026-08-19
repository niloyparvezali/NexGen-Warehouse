import { useEffect, useState } from "react";
import { useSafePagination } from "../../hooks/useSafePagination";

import Spinner from "../ui/Spinner";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import SaleInvoice from "./SaleInvoice";

import { getSales, getSale, deleteSale, restoreSale } from "../../services/sales.service";
import { formatMoney } from "../../utils/formatters";

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({});
  const { currentPage: safePage, totalPages: safeTotalPages, hasPreviousPage, hasNextPage } = useSafePagination(page, pagination?.totalPages, setPage);
  const [selected, setSelected] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [selectedError, setSelectedError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await getSales(page, 10, search);
      setSales(res?.sales ?? []);
      setPagination(res?.pagination ?? {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    setSelectedError("");
  };

  const handleView = async (sale) => {
    setSelectedLoading(true);
    setSelectedError("");
    setSelected(null);
    setIsModalOpen(true);

    try {
      const res = await getSale(sale.id);
      if (res) {
        setSelected(res);
      } else {
        setSelected(sale);
        setSelectedError("Sale details are not available.");
      }
    } catch (err) {
      console.error(err);
      setSelected(sale);
      setSelectedError("Unable to load sale details.");
    } finally {
      setSelectedLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadSales = async () => {
      try {
        setLoading(true);
        const res = await getSales(page, 10, search);
        if (active) {
          setSales(res?.sales ?? []);
          setPagination(res?.pagination ?? {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadSales();

    return () => {
      active = false;
    };
  }, [page, search]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-4 sales-history">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full max-w-md">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search sales..." className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/80 px-4 py-3 text-[var(--text)] shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="rounded-full bg-[var(--surface-muted)]/80 px-3 py-2 text-sm text-[var(--text-secondary)]">{sales.length} sales</div>
      </div>

      <div className="page-table">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="w-32 px-4 py-3 text-right">Total</th>
                <th className="w-32 px-4 py-3">Status</th>
                <th className="w-40 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sales.map((s) => (
                <tr key={s.id} className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface-light)]">
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{s.invoiceNumber}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{s.customer?.name || "—"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-right text-[var(--text)]">৳ {formatMoney(s.total || 0)}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text-secondary)]">{s.status}</td>
                  <td className="w-40 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleView(s)}>View</Button>
                      {s.isActive ? (
                        <Button size="sm" variant="danger" onClick={async () => { await deleteSale(s.id); fetch(); }}>Delete</Button>
                      ) : (
                        <Button size="sm" onClick={async () => { await restoreSale(s.id); fetch(); }}>Restore</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ui-pagination mt-4 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-secondary)] shadow-sm">
          <span className="text-[var(--text)]">Page {safePage} of {safeTotalPages}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={!hasPreviousPage} onClick={() => hasPreviousPage && setPage(safePage - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={!hasNextPage} onClick={() => hasNextPage && setPage(safePage + 1)}>Next</Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Sale Invoice"
        size="xl"
      >
        {selectedLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : selected ? (
            <div className="space-y-4">
            <div className="invoice-modal-controls">
              <SaleInvoice sale={selected} />
              <div className="flex justify-end gap-2 pt-4 invoice-modal-actions">
                <Button onClick={() => window.open(`/print/invoice/${selected.id}`, "_blank")}>Print</Button>
                <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-8 text-center text-[var(--text-secondary)]">
            {selectedError || "Sale details are not available."}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesHistory;
