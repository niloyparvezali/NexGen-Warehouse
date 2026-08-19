import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import { formatMoney } from "../../utils/formatters";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import SaleInvoice from "./SaleInvoice";

import { normalizeIntegerInputValue } from "../../utils/numberInput";
import { getSales, getSale, createSaleReturn } from "../../services/sales.service";

const SalesReturn = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [searchError, setSearchError] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [quantities, setQuantities] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetSearchState = () => {
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchError("");
    setActiveSuggestionIndex(-1);
  };

  const fetchSuggestions = useCallback(async (query) => {
    const term = String(query || "").trim();
    if (!term) {
      resetSearchState();
      return;
    }

    try {
      const res = await getSales(1, 10, term);
      const found = res?.sales ?? [];
      setSuggestions(found);
      setShowSuggestions(true);
      setActiveSuggestionIndex(found.length > 0 ? 0 : -1);
      setSearchError(found.length === 0 ? "No matching invoices found." : "");
    } catch (err) {
      console.error(err);
      setSuggestions([]);
      setShowSuggestions(true);
      setActiveSuggestionIndex(-1);
      setSearchError("Unable to search invoices. Please try again.");
    }
  }, []);

  useEffect(() => {
    const term = String(searchQuery || "").trim();
    if (!term) {
      return undefined;
    }

    const id = setTimeout(() => {
      void fetchSuggestions(term);
    }, 250);

    return () => clearTimeout(id);
  }, [searchQuery, fetchSuggestions]);

  const openSale = async (saleId) => {
    setLoading(true);
    try {
      const sale = await getSale(saleId);
      if (!sale) return;

      const returnTotals = {};
      for (const returnRecord of sale.returns ?? []) {
        for (const returnItem of returnRecord.items ?? []) {
          returnTotals[returnItem.saleItemId] = (returnTotals[returnItem.saleItemId] || 0) + Number(returnItem.quantity || 0);
        }
      }

      setSelectedSale(sale);
      const init = {};
      for (const it of sale.items ?? []) {
        const alreadyReturned = Number(returnTotals[it.id] || 0);
        const remaining = Number(it.quantity || 0) - alreadyReturned;
        init[it.id] = 0;
        it._remaining = remaining;
      }
      setQuantities(init);
      setShowModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (s) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchQuery(s.invoiceNumber || "");
    openSale(s.id);
  };

  const handleKeyDown = (event) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => Math.min(prev < 0 ? 0 : prev + 1, suggestions.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => Math.max(prev <= 0 ? 0 : prev - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selected = suggestions[activeSuggestionIndex >= 0 ? activeSuggestionIndex : 0];
      if (selected) {
        handleSuggestionClick(selected);
        return;
      }
      handleSearch();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setShowSuggestions(false);
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleSearch = async () => {
    const term = String(searchQuery || "").trim();
    if (!term) {
      setSearchError("Enter an invoice number to search.");
      resetSearchState();
      return;
    }

    setSearchError("");

    setLoading(true);
    try {
      const res = await getSales(1, 10, term);
      const found = res?.sales ?? [];
      if (!found.length) {
        setSearchError("No matching invoices found.");
        setSuggestions([]);
        setShowSuggestions(false);
      } else if (found.length === 1) {
        openSale(found[0].id);
        setSearchQuery(found[0].invoiceNumber || "");
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        const exact = found.find((x) => x.invoiceNumber === term);
        if (exact) {
          openSale(exact.id);
          setSearchQuery(exact.invoiceNumber || "");
          setSuggestions([]);
          setShowSuggestions(false);
        } else {
          setSuggestions(found);
          setShowSuggestions(true);
          setActiveSuggestionIndex(0);
        }
      }
    } catch (err) {
      console.error(err);
      setSearchError("Unable to search invoices. Please try again.");
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSale(null);
    setQuantities({});
    setNotes("");
    setError("");
  };

  const setQty = (saleItemId, value) => {
    setQuantities((cur) => ({ ...cur, [saleItemId]: Number(value || 0) }));
  };

  const returnAll = () => {
    if (!selectedSale) return;
    const all = {};
    for (const it of selectedSale.items ?? []) {
      all[it.id] = Math.max(0, Number(it._remaining || 0));
    }
    setQuantities(all);
  };

  const canSubmit = useMemo(() => {
    if (!selectedSale) return false;
    const items = [];
    for (const it of selectedSale.items ?? []) {
      const q = Number(quantities[it.id] || 0);
      if (q > 0) {
        const remaining = Number(it._remaining || 0);
        if (q > remaining) return false;
        items.push(q);
      }
    }
    return items.length > 0;
  }, [selectedSale, quantities]);

  const handleSubmit = async () => {
    if (!selectedSale) return;
    setError("");
    const payloadItems = [];
    for (const it of selectedSale.items ?? []) {
      const q = Number(quantities[it.id] || 0);
      if (q > 0) {
        payloadItems.push({ saleItemId: it.id, productId: it.productId, quantity: q });
      }
    }

    if (payloadItems.length === 0) {
      setError("Select at least one item to return.");
      return;
    }

    setSubmitting(true);
    try {
      await createSaleReturn(selectedSale.id, { notes: notes.trim() || undefined, items: payloadItems });
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create return.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="return-search">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Returns</h3>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Search Invoice</label>
        <div className="relative">
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => {
                const nextValue = e.target.value;
                setSearchQuery(nextValue);

                if (!String(nextValue || "").trim()) {
                  resetSearchState();
                  return;
                }

                setSearchError("");
              }}
              onFocus={() => {
                if (searchQuery.trim()) setShowSuggestions(Boolean(suggestions.length || searchError === "No matching invoices found."));
              }}
              onBlur={() => {
                setTimeout(() => {
                  setShowSuggestions(false);
                }, 150);
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--text)]"
              placeholder="Search invoice number..."
            />
            <Button variant="secondary" onClick={handleSearch}>Search</Button>
          </div>

          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg">
              {suggestions.length > 0 ? (
                suggestions.map((s, index) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSuggestionClick(s)}
                    className={`flex w-full items-center justify-between border-b border-[var(--border)] px-3 py-2 text-left last:border-b-0 ${index === activeSuggestionIndex ? "bg-[var(--surface-muted)]" : "bg-[var(--surface)] hover:bg-[var(--surface-muted)]"}`}
                  >
                    <div>
                      <p className="font-medium text-[var(--text)]">{s.invoiceNumber}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Customer: {s.customer?.name || "-"} • Total: ৳ {formatMoney(s.total || 0)} • Date: {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <span className="rounded-md bg-[var(--surface-muted)] px-2 py-1 text-xs text-[var(--text-secondary)]">Select</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-[var(--text-secondary)]">No matching invoices found.</div>
              )}
            </div>
          )}
        </div>

        {searchError && !showSuggestions && <p className="mt-2 text-sm text-[var(--danger)]">{searchError}</p>}
      </div>

      {/* No recent sales list shown here. The page shows only the search box and suggestions while typing. */}
      {loading && <p className="text-[var(--text-secondary)]">Loading...</p>}

      <Modal isOpen={showModal} onClose={closeModal} title={selectedSale ? `Return - ${selectedSale.invoiceNumber}` : "Return"} size="xl">
        {selectedSale ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <SaleInvoice sale={selectedSale} />
              </div>
              <div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Select items to return</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setQuantities({})}>Clear</Button>
                      <Button size="sm" variant="secondary" onClick={returnAll}>Return All</Button>
                    </div>
                  </div>

                  {selectedSale.items.map((it) => {
                    const alreadyReturned = (selectedSale.returns || []).flatMap((returnRecord) => returnRecord.items || []).filter((returnItem) => returnItem.saleItemId === it.id).reduce((sum, returnItem) => sum + Number(returnItem.quantity || 0), 0);
                    const remaining = Number(it.quantity || 0) - alreadyReturned;
                    return (
                      <div key={it.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="font-medium">{it.productName || it.product?.name}</p>
                            <p className="text-sm text-[var(--text-secondary)]">SKU: {it.productSku || it.product?.sku}</p>
                            <p className="text-sm text-[var(--text-secondary)]">Sold: {it.quantity} • Returned: {alreadyReturned} • Remaining: {remaining}</p>
                          </div>
                          <div className="w-32">
                            <Input
                              type="number"
                              min="0"
                              max={remaining}
                              step="1"
                              value={quantities[it.id] ?? 0}
                              onChange={(e) => {
                                const nextValue = Number(normalizeIntegerInputValue(e.target.value || "0")) || 0;
                                setQty(it.id, Math.max(0, Math.min(remaining, nextValue)));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div>
                    <label className="text-sm text-[var(--text-secondary)]">Notes (optional)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]" rows={3} />
                  </div>

                  {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>{submitting ? "Processing..." : "Create Return"}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[var(--text-secondary)]">No sale selected.</p>
        )}
      </Modal>
    </div>
  );
};

export default SalesReturn;
