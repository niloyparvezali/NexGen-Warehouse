import { useEffect, useState } from "react";
import { useSafePagination } from "../hooks/useSafePagination";

import PaymentForm from "../components/forms/PaymentForm";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { formatMoney } from "../utils/formatters";

import { getCustomers } from "../services/customer.service";
import { getCustomerPayments, createCustomerPayment } from "../services/customerPayment.service";

const CustomerPaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({});
  const { currentPage: safePage, totalPages: safeTotalPages, hasPreviousPage, hasNextPage } = useSafePagination(page, pagination?.totalPages, setPage);

  const [openCreate, setOpenCreate] = useState(false);

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers(1, 100, "");
      setCustomers(response?.customers ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await getCustomerPayments(page, 10, search);
      setPayments(response?.payments ?? []);
      setPagination(response?.pagination ?? {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customer payments.");
    }
  };

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        await fetchCustomers();
        const response = await getCustomerPayments(page, 10, search);
        if (!ignore) {
          setPayments(response?.payments ?? []);
          setPagination(response?.pagination ?? {});
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load customer payments.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [page, search]);

  const handleCreate = async (data) => {
    try {
      setSaving(true);
      await createCustomerPayment(data);
      setOpenCreate(false);
      await fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create customer payment.");
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
      <div className="space-y-5 page-container page-standard">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Customer Payments</h1>
            <p className="text-[var(--text-secondary)]">Receive customer payments and track payment history.</p>
          </div>
          <Button onClick={() => setOpenCreate(true)}>Receive Payment</Button>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-72 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-[var(--text)] outline-none focus:border-primary"
          />
        </div>

        <div className="page-table">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed index-column-table">
          <colgroup className="index-column-group">
            <col className="index-column" />
          </colgroup>
              <thead className="bg-[var(--surface-muted)]">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                  <th className="w-12 px-2 py-3">#</th>
                  <th className="w-32 px-4 py-3">Payment No.</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="w-32 px-4 py-3">Invoice</th>
                  <th className="w-32 px-4 py-3 text-right">Amount</th>
                  <th className="w-28 px-4 py-3">Method</th>
                  <th className="w-32 px-4 py-3">Reference</th>
                  <th className="w-40 px-4 py-3">Received By</th>
                  <th className="w-32 px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-10 px-4 text-center text-[var(--text-secondary)]">
                      No customer payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr key={payment.id} className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface-light)]">
                      <td className="w-8 px-1 py-3 text-sm text-[var(--text)]">{index + 1}</td>
                      <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{payment.paymentNumber}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text)]">{payment.customer?.name || payment.sale?.customer?.name || "—"}</td>
                      <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{payment.sale?.invoiceNumber || payment.saleId}</td>
                      <td className="w-32 px-4 py-3 text-sm text-right font-medium text-[var(--text)]">৳ {formatMoney(payment.amount || 0)}</td>
                      <td className="w-28 px-4 py-3 text-sm text-[var(--text)]">{payment.paymentMethod}</td>
                      <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{payment.reference || "—"}</td>
                      <td className="w-40 px-4 py-3 text-sm text-[var(--text)]">{payment.receivedBy ? `${payment.receivedBy.first_name} ${payment.receivedBy.last_name}` : "—"}</td>
                      <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button size="sm" variant="secondary" disabled={!hasPreviousPage} onClick={() => hasPreviousPage && setPage(safePage - 1)}>Previous</Button>

          <span className="text-[var(--text)]">Page {safePage} of {safeTotalPages}</span>

          <Button size="sm" variant="secondary" disabled={!hasNextPage} onClick={() => hasNextPage && setPage(safePage + 1)}>Next</Button>
        </div>
      </div>

      <Modal isOpen={openCreate} onClose={() => setOpenCreate(false)} title="Receive Customer Payment" size="lg">
        <PaymentForm onSubmit={handleCreate} loading={saving} customers={customers} isCustomer />
      </Modal>
    </>
  );
};

export default CustomerPaymentList;
