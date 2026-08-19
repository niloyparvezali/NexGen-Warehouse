import { useEffect, useMemo, useState } from "react";

import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { getSales, getSale } from "../../services/sales.service";
import { formatMoney } from "../../utils/formatters";

const formatCurrency = (value) => `৳ ${formatMoney(value)}`;

const ReturnProductList = () => {
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    const loadReturnList = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getSales(1, 200, "");
        const sales = res?.sales ?? [];

        const detailedSales = await Promise.all(
          sales.map(async (sale) => {
            try {
              return await getSale(sale.id);
            } catch (err) {
              console.error(err);
              return sale;
            }
          }),
        );

        const aggregated = [];

        for (const sale of detailedSales) {
          const saleReturns = Array.isArray(sale?.returns) ? sale.returns : [];

          for (const returnRecord of saleReturns) {
            const items = Array.isArray(returnRecord?.items) ? returnRecord.items : [];
            const products = items.map((item) => ({
              productId: item.productId,
              productName: item.productName || item.product?.name || "Unknown Product",
              returnQuantity: Number(item.quantity || 0),
              unitPrice: Number(item.sellingPrice || 0),
              returnLineTotal: Number(item.total || 0),
            }));

            const totalReturnedQuantity = products.reduce((sum, product) => sum + Number(product.returnQuantity || 0), 0);
            const returnAmount = products.reduce((sum, product) => sum + Number(product.returnLineTotal || 0), 0);

            aggregated.push({
              returnId: returnRecord.id,
              returnNumber: returnRecord.returnNumber,
              originalSaleId: sale.id,
              originalInvoiceNumber: sale.invoiceNumber,
              customerId: sale.customerId,
              customerName: sale.customer?.name || "Unknown Customer",
              products,
              totalReturnedQuantity,
              returnAmount,
              returnDate: returnRecord.createdAt || sale.createdAt,
              status: "Completed",
              notes: returnRecord.notes,
            });
          }
        }

        setRows(
          aggregated.sort((a, b) => new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime()),
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load return product list.");
      } finally {
        setLoading(false);
      }
    };

    loadReturnList();
  }, []);

  const filteredRows = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((row) => {
      const productText = row.products.map((product) => product.productName).join(" ");
      return [
        row.returnNumber,
        row.originalInvoiceNumber,
        row.customerName,
        productText,
      ].some((value) => String(value || "").toLowerCase().includes(term));
    });
  }, [rows, searchQuery]);

  return (
    <div className="return-list">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold text-[var(--text)]">Return Product List</h3>

        <div className="w-full max-w-md">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--text)]"
            placeholder="Search returned product / invoice"
          />
        </div>
      </div>

      {error && <p className="mb-3 rounded-lg border border-[var(--danger-soft)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</p>}

      {loading ? (
        <p className="text-[var(--text-secondary)]">Loading return list...</p>
      ) : filteredRows.length === 0 ? (
        <p className="text-[var(--text-secondary)]">No return records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm text-[var(--text-secondary)]">
                <th className="px-3 py-2 font-medium">Return No.</th>
                <th className="px-3 py-2 font-medium">Invoice</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Returned Products</th>
                <th className="px-3 py-2 font-medium">Qty</th>
                <th className="px-3 py-2 font-medium">Return Amount</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">View</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.returnId} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/60">
                  <td className="px-3 py-3 text-sm font-medium text-[var(--text)]">{row.returnNumber}</td>
                  <td className="px-3 py-3 text-sm text-[var(--text)]">{row.originalInvoiceNumber}</td>
                  <td className="px-3 py-3 text-sm text-[var(--text)]">{row.customerName}</td>
                  <td className="px-3 py-3 text-sm text-[var(--text)]">
                    {row.products.map((product) => `${product.productName} × ${product.returnQuantity}`).join(", ") || "-"}
                  </td>
                  <td className="px-3 py-3 text-sm text-[var(--text)]">{row.totalReturnedQuantity}</td>
                  <td className="px-3 py-3 text-sm text-[var(--text)]">{formatCurrency(row.returnAmount)}</td>
                  <td className="px-3 py-3 text-sm text-[var(--text)]">
                    {row.returnDate ? new Date(row.returnDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    <span className="inline-flex rounded-full bg-[var(--color-success-soft)] px-2 py-1 text-xs font-medium text-[var(--color-success)]">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm">
                    <Button size="sm" variant="secondary" onClick={() => setSelectedReturn(row)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={Boolean(selectedReturn)} onClose={() => setSelectedReturn(null)} title={`Return - ${selectedReturn?.returnNumber || ""}`} size="lg">
        {selectedReturn && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Return Number</p>
                <p className="font-medium text-[var(--text)]">{selectedReturn.returnNumber}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Original Invoice</p>
                <p className="font-medium text-[var(--text)]">{selectedReturn.originalInvoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Customer</p>
                <p className="font-medium text-[var(--text)]">{selectedReturn.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Return Date</p>
                <p className="font-medium text-[var(--text)]">
                  {selectedReturn.returnDate ? new Date(selectedReturn.returnDate).toLocaleString() : "-"}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-[var(--text-secondary)]">Returned Products</p>
              <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/70 p-3">
                {selectedReturn.products.map((product) => (
                  <div key={`${selectedReturn.returnId}-${product.productId}`} className="flex items-center justify-between gap-4 text-sm text-[var(--text)]">
                    <span>{product.productName}</span>
                    <span>× {product.returnQuantity}</span>
                    <span>{formatCurrency(product.returnLineTotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Return Amount</p>
                <p className="font-medium text-[var(--text)]">{formatCurrency(selectedReturn.returnAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Status</p>
                <p className="font-medium text-[var(--text)]">{selectedReturn.status}</p>
              </div>
            </div>

            {selectedReturn.notes && (
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Notes</p>
                <p className="text-[var(--text)]">{selectedReturn.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReturnProductList;
