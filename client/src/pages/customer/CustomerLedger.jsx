import { useEffect, useState } from "react";
import { BookOpen, Search, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import { getCustomers } from "../../services/customer.service";
import { getCustomerLedger } from "../../services/customerLedger.service";
import { formatMoney } from "../../utils/formatters";

const CustomerLedger = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [ledger, setLedger] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [error, setError] = useState("");

  const fetchLedger = async () => {
    if (!selectedCustomer) { setError("Select a customer to view the ledger."); return; }
    try { setLoadingLedger(true); setError(""); setLedger(await getCustomerLedger(selectedCustomer)); }
    catch (err) { setLedger(null); setError(err.response?.data?.message || "Failed to load customer ledger."); }
    finally { setLoadingLedger(false); }
  };

  useEffect(() => { getCustomers(1, 100, "").then((r) => setCustomers(r?.customers ?? [])).catch((err) => setError(err.response?.data?.message || "Failed to load customers.")); }, []);

  const currentBalance = Number(ledger?.currentBalance || 0);
  const entries = Array.isArray(ledger?.ledger) ? ledger.ledger : [];

  return (
    <div className="wc-page world-module world-ledger ledger-page page-container">
      <section className="ledger-hero">
        <div className="ledger-hero-copy"><span>Accounts receivable</span><h1>Customer Ledger</h1><p>See every invoice and payment in one clean running balance.</p></div>
        <div className="ledger-toolbar">
          <div><label>Customer</label><select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></div>
          <Button onClick={fetchLedger}><Search size={16} /> Load ledger</Button>
        </div>
      </section>

      {error ? <div className="ledger-alert">{error}</div> : null}
      {loadingLedger ? <div className="ledger-loading"><Spinner /></div> : ledger ? (
        <>
          <div className="ledger-summary-grid">
            <div className="ledger-summary-card"><span><BookOpen size={15} /> Customer</span><strong>{ledger.customer?.name || "—"}</strong><small>{ledger.customer?.phone || "No phone"}</small></div>
            <div className="ledger-summary-card"><span><Wallet size={15} /> Current balance</span><strong className={currentBalance > 0 ? "is-warning" : "is-good"}>৳ {formatMoney(currentBalance)}</strong><small>{currentBalance > 0 ? "Outstanding" : "Settled"}</small></div>
            <div className="ledger-summary-card"><span><TrendingUp size={15} /> Debit entries</span><strong>{entries.filter((e) => Number(e.debit || 0) > 0).length}</strong><small>Invoices / charges</small></div>
            <div className="ledger-summary-card"><span><TrendingDown size={15} /> Credit entries</span><strong>{entries.filter((e) => Number(e.credit || 0) > 0).length}</strong><small>Payments / credits</small></div>
          </div>

          <section className="ledger-table-card">
            <div className="ledger-table-head"><div><span>Transaction history</span><h2>Statement</h2></div><small>{entries.length} entries</small></div>
            <div className="overflow-x-auto"><table><thead><tr><th>Date</th><th>Invoice</th><th>Payment</th><th className="num">Debit</th><th className="num">Credit</th><th className="num">Balance</th><th>Remarks</th></tr></thead>
            <tbody>{entries.length === 0 ? <tr><td colSpan="7" className="ledger-empty">No transactions yet.</td></tr> : entries.map((entry, idx) => <tr key={`${entry.date}-${idx}`}><td>{new Date(entry.date).toLocaleDateString()}</td><td className="strong-cell">{entry.invoiceNumber || "—"}</td><td>{entry.paymentNumber || "—"}</td><td className="num debit">{entry.debit ? `৳ ${formatMoney(entry.debit)}` : "—"}</td><td className="num credit">{entry.credit ? `৳ ${formatMoney(entry.credit)}` : "—"}</td><td className="num balance">৳ {formatMoney(entry.balance || 0)}</td><td>{entry.remarks || "—"}</td></tr>)}</tbody></table></div>
          </section>
        </>
      ) : <div className="ledger-empty-state"><BookOpen size={24} /><strong>Select a customer</strong><span>Choose a customer above to load their complete ledger.</span></div>}
    </div>
  );
};

export default CustomerLedger;
