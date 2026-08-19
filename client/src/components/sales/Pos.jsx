import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  ChevronDown,
  CreditCard,
  FileText,
  Minus,
  Package,
  Plus,
  ReceiptText,
  ScanBarcode,
  Search,
  Smartphone,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import SaleInvoice from "./SaleInvoice";
import "./pos-world-class.css";

import { getProducts } from "../../services/product.service";
import { getCustomers, createCustomer } from "../../services/customer.service";
import { createSale } from "../../services/sales.service";
import { normalizeIntegerInputValue } from "../../utils/numberInput";
import { formatMoney } from "../../utils/formatters";
import { normalizePhoneInput, isValidPhoneNumber } from "../../utils/phone";

const parseSerialNumbers = (value) => {
  if (value == null) return [];
  if (Array.isArray(value))
    return value.map((item) => String(item).trim()).filter(Boolean);
  const text = String(value).trim();
  if (!text) return [];
  return text
    .split(/[,;\r\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const clearZeroStateOnFocus = (event, clearValue) => {
  if (event.currentTarget.value === "0") {
    clearValue();
  }
};

const restoreZeroStateOnBlur = (event, restoreValue) => {
  if (event.currentTarget.value === "") {
    restoreValue();
  }
};

const convertWarrantyToDays = (value) => {
  if (value == null || value === "") return null;
  const normalized = String(value).trim().toLowerCase();
  const quantity = Number(normalized.match(/(\d+(?:\.\d+)?)/)?.[1]);
  if (!Number.isFinite(quantity) || quantity < 0) return null;
  if (/year|yr/.test(normalized)) return Math.round(quantity * 365);
  if (/month|mo/.test(normalized)) return Math.round(quantity * 30);
  if (/day|d/.test(normalized)) return Math.round(quantity);
  return Math.round(quantity);
};

const emptyItem = (product) => ({
  productId: product?.id,
  product,
  quantity: 1,
  sellingPrice: Number(product?.sellingPrice || 0),
  warrantyDays: convertWarrantyToDays(product?.warranty),
  serialNumbers: "",
});

const paymentOptions = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "CARD", label: "Card", icon: CreditCard },
  { value: "BANK_TRANSFER", label: "Bank", icon: FileText },
  { value: "BKASH", label: "bKash", icon: Smartphone },
  { value: "NAGAD", label: "Nagad", icon: Smartphone },
  { value: "ROCKET", label: "Rocket", icon: Smartphone },
  { value: "UPAY", label: "Upay", icon: Smartphone },
];

const Pos = () => {
  const [searchText, setSearchText] = useState("");
  const searchRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("walkin");
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [showWalkinDetails, setShowWalkinDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [createdSale, setCreatedSale] = useState(null);
  const [openDetails, setOpenDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await getCustomers(1, 100, "");
        setCustomers(res?.customers ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    loadCustomers();
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0) *
            Number(item.product?.sellingPrice ?? item.sellingPrice ?? 0),
        0,
      ),
    [items],
  );
  const grandTotal = Math.max(0, subtotal - Number(discount || 0));
  const paid = Number(paidAmount || 0);
  const due = Math.max(0, grandTotal - paid);
  const change = Math.max(0, paid - grandTotal);
  const hasInvalidItem = items.some(
    (item) =>
      Number(item.quantity || 0) <= 0 ||
      Number(item.product?.sellingPrice ?? item.sellingPrice ?? 0) <= 0,
  );
  const selectedCustomerObj = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomer),
    [customers, selectedCustomer],
  );
  const isWalkInCustomer = selectedCustomer === "walkin";
  const hasRequiredCustomer = isWalkInCustomer
    ? Boolean(newCustomerName.trim())
    : Boolean(selectedCustomerObj);
  const canSubmit =
    items.length > 0 &&
    !hasInvalidItem &&
    hasRequiredCustomer &&
    paid >= 0 &&
    Boolean(paymentMethod);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const handleProductLookup = async () => {
    const term = searchText.trim();
    if (!term) {
      setProducts([]);
      return;
    }
    try {
      setError("");
      const res = await getProducts(1, 20, term);
      const matches = res?.products ?? [];
      const exactBarcode = matches.find(
        (product) => String(product.barcode || "").trim() === term,
      );
      if (exactBarcode) {
        addProduct(exactBarcode);
        setSearchText("");
        setProducts([]);
        requestAnimationFrame(() => searchRef.current?.focus());
        return;
      }
      setProducts(matches);
    } catch (err) {
      console.error(err);
      setError("Unable to search products.");
    }
  };

  const addProduct = (product) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, emptyItem(product)];
    });
    setOpenDetails((current) => ({ ...current, [product.id]: true }));
  };

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const changeQuantity = (index, delta) => {
    setItems((current) =>
      current.map((item, idx) => {
        if (idx !== index) return item;
        return {
          ...item,
          quantity: Math.max(1, Number(item.quantity || 1) + delta),
        };
      }),
    );
  };

  const removeItem = (index) => {
    const id = items[index]?.productId;
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
    if (id) setOpenDetails((current) => ({ ...current, [id]: false }));
  };

  const generateWalkinPhone = () => {
    const timestamp = String(Date.now()).slice(-8);
    const randomDigits = String(Math.floor(Math.random() * 900) + 100);
    return `WALKIN${timestamp}${randomDigits}`;
  };

  const handleCreateSale = async ({ print = false } = {}) => {
    if (!canSubmit) {
      if (items.length === 0) setError("Add at least one product.");
      else if (hasInvalidItem)
        setError("Each item must have a valid quantity and selling price.");
      else if (!hasRequiredCustomer)
        setError(
          isWalkInCustomer
            ? "Customer Name is required for Walk-in Customer."
            : "Select a valid customer.",
        );
      else if (
        isWalkInCustomer &&
        newCustomerPhone.trim() &&
        !isValidPhoneNumber(normalizePhoneInput(newCustomerPhone))
      )
        setError("Walk-in customer phone number must be exactly 11 digits.");
      else if (paid < 0) setError("Paid amount cannot be negative.");
      else setError("Please complete the sale details before submitting.");
      return;
    }
    if (
      isWalkInCustomer &&
      newCustomerPhone.trim() &&
      !isValidPhoneNumber(normalizePhoneInput(newCustomerPhone))
    ) {
      setError("Walk-in customer phone number must be exactly 11 digits.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      let customerId = selectedCustomerObj?.id;
      if (isWalkInCustomer) {
        const existingCustomer = newCustomerPhone.trim()
          ? customers.find(
              (customer) => customer.phone === newCustomerPhone.trim(),
            )
          : null;
        if (existingCustomer) customerId = existingCustomer.id;
        else {
          const placeholderPhone =
            newCustomerPhone.trim() || generateWalkinPhone();
          const createdCustomer = await createCustomer({
            name: newCustomerName.trim(),
            phone: placeholderPhone,
            address: newCustomerAddress.trim() || undefined,
          });
          customerId = createdCustomer?.id;
          if (createdCustomer)
            setCustomers((current) => [createdCustomer, ...current]);
        }
      }

      const payload = {
        customerId,
        discount: Number(discount || 0),
        paidAmount: Number(paidAmount || 0),
        paymentMethod,
        items: items.map((item) => {
          const details = {
            productId: item.productId,
            quantity: Number(item.quantity || 1),
            sellingPrice: Number(
              item.product?.sellingPrice ?? item.sellingPrice ?? 0,
            ),
          };
          if (item.warrantyDays != null)
            details.warrantyDays = item.warrantyDays;
          const serials = parseSerialNumbers(item.serialNumbers);
          if (serials.length > 0) details.serialNumbers = serials;
          return details;
        }),
      };

      const sale = await createSale(payload);
      setCreatedSale(sale);
      setShowInvoice(true);
      toast.success("Sale completed successfully.");
      setItems([]);
      setDiscount(0);
      setPaidAmount(0);
      setSelectedCustomer("walkin");
      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerAddress("");
      setOpenDetails({});
      if (print) navigate(`/print/invoice/${sale.id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create sale.",
      );
    } finally {
      setLoading(false);
    }
  };

  const customerName = selectedCustomerObj?.name || "Walk-in Customer";

  return (
    <div className="pos-workspace">
      <section
        className="pos-context-bar pos-context-bar--compact"
        aria-label="Sale details"
      >
        <div className="pos-context-field pos-context-field--customer">
          <span className="pos-field-label">
            <UserRound size={14} /> Customer
          </span>
          <div className="pos-customer-inline">
            <select
              value={selectedCustomer}
              onChange={(event) => setSelectedCustomer(event.target.value)}
              aria-label="Customer"
            >
              <option value="walkin">Walk-in Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.phone ? ` • ${customer.phone}` : ""}
                </option>
              ))}
            </select>
            {isWalkInCustomer ? (
              <input
                aria-label="Walk-in customer name"
                value={newCustomerName}
                onChange={(event) => setNewCustomerName(event.target.value)}
                placeholder="Customer name *"
              />
            ) : null}
          </div>
        </div>
        <div className="pos-context-field">
          <span className="pos-field-label">
            <CalendarDays size={14} /> Date
          </span>
          <div className="pos-readonly-value">Today</div>
        </div>
        <div className="pos-context-field pos-context-field--compact-actions">
          {isWalkInCustomer ? (
            <button
              type="button"
              className="pos-inline-details-button"
              onClick={() => setShowWalkinDetails((value) => !value)}
            >
              {showWalkinDetails ? "Hide details" : "Optional customer details"}
            </button>
          ) : (
            <div className="pos-context-status">
              <span className="pos-status-dot" /> {customerName}
            </div>
          )}
        </div>
      </section>

      {isWalkInCustomer && showWalkinDetails && (
        <section className="pos-customer-strip pos-customer-strip--compact">
          <div className="pos-customer-grid pos-customer-grid--compact">
            <Input
              label="Phone"
              value={newCustomerPhone}
              maxLength={11}
              onChange={(event) =>
                setNewCustomerPhone(normalizePhoneInput(event.target.value))
              }
              placeholder="Optional"
            />
            <Input
              label="Address"
              value={newCustomerAddress}
              onChange={(event) => setNewCustomerAddress(event.target.value)}
              placeholder="Optional"
            />
          </div>
        </section>
      )}

      {!isWalkInCustomer && selectedCustomerObj && (
        <section className="pos-customer-strip pos-customer-strip--selected pos-customer-strip--compact">
          <div className="pos-selected-customer">
            <div className="pos-avatar">
              <UserRound size={17} />
            </div>
            <div>
              <strong>{selectedCustomerObj.name}</strong>
              <span>
                {selectedCustomerObj.phone || "No phone"}
                {selectedCustomerObj.address
                  ? ` • ${selectedCustomerObj.address}`
                  : ""}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="pos-clear-customer"
            onClick={() => setSelectedCustomer("walkin")}
          >
            <X size={15} /> Change
          </button>
        </section>
      )}

      <div className="pos-main-grid">
        <section className="pos-items-panel">
          <div className="pos-search-box">
            <Search size={19} />
            <input
              ref={searchRef}
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                handleProductLookup();
              }}
              onKeyDown={(event) =>
                event.key === "Enter" &&
                (event.preventDefault(), handleProductLookup())
              }
              placeholder="Search by product, SKU or barcode..."
              aria-label="Search product or scan barcode"
            />
            <button
              type="button"
              title="Barcode scanner"
              aria-label="Barcode scanner"
              onClick={() => searchRef.current?.focus()}
            >
              <ScanBarcode size={19} />
            </button>
          </div>

          {products.length > 0 && (
            <div className="pos-search-results">
              {products.map((product) => (
                <button
                  type="button"
                  className="pos-search-result"
                  key={product.id}
                  onClick={() => {
                    addProduct(product);
                    setSearchText("");
                    setProducts([]);
                    searchRef.current?.focus();
                  }}
                >
                  <div className="pos-result-icon">
                    <Package size={18} />
                  </div>
                  <div className="pos-result-copy">
                    <strong>{product.name}</strong>
                    <span>
                      SKU {product.sku || "—"} • Stock{" "}
                      {product.stockQuantity ?? 0}
                    </span>
                  </div>
                  <strong className="pos-result-price">
                    ৳ {formatMoney(product.sellingPrice || 0)}
                  </strong>
                  <Plus size={18} />
                </button>
              ))}
            </div>
          )}

          <div className="pos-section-heading pos-section-heading--items">
            <div>
              <span className="pos-kicker">Current invoice</span>
              <h2>
                Items <span>{items.length}</span>
              </h2>
            </div>
            {items.length > 0 && (
              <span className="pos-items-total">৳ {formatMoney(subtotal)}</span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="pos-empty-state">
              <div className="pos-empty-icon">
                <Package size={25} />
              </div>
              <strong>Your sale is empty</strong>
              <span>
                Search for a product or scan a barcode to add your first item.
              </span>
            </div>
          ) : (
            <div className="pos-item-list">
              {items.map((item, index) => {
                const unitPrice = Number(
                  item.product?.sellingPrice ?? item.sellingPrice ?? 0,
                );
                const total = Number(item.quantity || 0) * unitPrice;
                const serialList = parseSerialNumbers(item.serialNumbers);
                const serialCountMismatch =
                  serialList.length > 0 &&
                  Number(item.quantity || 0) !== serialList.length;
                const isOpen = Boolean(openDetails[item.productId]);
                return (
                  <article
                    className={`pos-line-item ${isOpen ? "is-expanded" : ""}`}
                    key={item.productId}
                  >
                    <div className="pos-item-main">
                      <div className="pos-product-mark">
                        <Package size={20} />
                      </div>
                      <div className="pos-product-info">
                        <strong>{item.product?.name}</strong>
                        <span>SKU: {item.product?.sku || "—"}</span>
                        <div className="pos-item-meta">
                          <span className="pos-stock-badge">
                            Stock {item.product?.stockQuantity ?? 0}
                          </span>
                          {item.product?.warranty && (
                            <span>{item.product.warranty} warranty</span>
                          )}
                        </div>
                      </div>
                      <div
                        className="pos-qty-control"
                        aria-label={`Quantity for ${item.product?.name}`}
                      >
                        <button
                          type="button"
                          onClick={() => changeQuantity(index, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onFocus={(event) =>
                            clearZeroStateOnFocus(event, () =>
                              updateItem(index, "quantity", ""),
                            )
                          }
                          onBlur={(event) =>
                            restoreZeroStateOnBlur(event, () =>
                              updateItem(index, "quantity", 1),
                            )
                          }
                          onChange={(event) =>
                            updateItem(
                              index,
                              "quantity",
                              Number(
                                normalizeIntegerInputValue(
                                  event.target.value || "1",
                                ),
                              ) || 1,
                            )
                          }
                          aria-label="Quantity"
                        />
                        <button
                          type="button"
                          onClick={() => changeQuantity(index, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                      <div className="pos-price-block">
                        <span>Unit</span>
                        <strong>৳ {formatMoney(unitPrice)}</strong>
                      </div>
                      <div className="pos-total-block">
                        <span>Total</span>
                        <strong>৳ {formatMoney(total)}</strong>
                      </div>
                      <button
                        type="button"
                        className="pos-icon-button pos-icon-button--danger"
                        onClick={() => removeItem(index)}
                        aria-label={`Remove ${item.product?.name}`}
                        title="Remove item"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <div className="pos-item-details-toggle">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDetails((current) => ({
                            ...current,
                            [item.productId]: !isOpen,
                          }))
                        }
                      >
                        <span>
                          {isOpen ? "Hide item details" : "Add item details"}
                        </span>
                        <ChevronDown
                          size={16}
                          className={isOpen ? "rotated" : ""}
                        />
                      </button>
                      {serialList.length > 0 && (
                        <span className="pos-detail-count">
                          <Check size={13} /> {serialList.length} serial
                          {serialList.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {isOpen && (
                      <div className="pos-item-details">
                        <div className="pos-detail-field">
                          <span className="pos-field-label">Warranty</span>
                          <div className="pos-warranty-value">
                            {item.product?.warranty || "No warranty"}
                          </div>
                        </div>
                        <div className="pos-detail-field pos-detail-field--serial">
                          <span className="pos-field-label">
                            Serial numbers <em>Optional</em>
                          </span>
                          <textarea
                            rows={2}
                            value={item.serialNumbers}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "serialNumbers",
                                event.target.value,
                              )
                            }
                            placeholder="Enter serial numbers separated by comma or new line"
                            aria-label="Serial numbers"
                          />
                          {serialCountMismatch && (
                            <small className="pos-inline-warning">
                              {serialList.length} serials entered for quantity{" "}
                              {item.quantity}.
                            </small>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="pos-summary-panel">
          <div className="pos-summary-header">
            <div>
              <span className="pos-kicker">Checkout</span>
              <h2>Sale summary</h2>
            </div>
            <ReceiptText size={20} />
          </div>
          <div className="pos-summary-body">
            <div className="pos-summary-row">
              <span>
                Subtotal{" "}
                <small>
                  {items.length} item{items.length === 1 ? "" : "s"}
                </small>
              </span>
              <strong>৳ {formatMoney(subtotal)}</strong>
            </div>
            <div className="pos-discount-row">
              <label htmlFor="pos-discount">Discount</label>
              <div className="pos-money-field">
                <span>৳</span>
                <input
                  id="pos-discount"
                  type="number"
                  min="0"
                  value={discount}
                  onFocus={(event) =>
                    clearZeroStateOnFocus(event, () => setDiscount(""))
                  }
                  onBlur={(event) =>
                    restoreZeroStateOnBlur(event, () => setDiscount("0"))
                  }
                  onChange={(event) =>
                    setDiscount(
                      normalizeIntegerInputValue(event.target.value, ""),
                    )
                  }
                />
              </div>
            </div>
            <div className="pos-summary-total">
              <span>Total payable</span>
              <strong>৳ {formatMoney(grandTotal)}</strong>
            </div>

            <div className="pos-payment-section">
              <div className="pos-payment-heading">
                <span>Payment method</span>
                <small>Default: Cash</small>
              </div>
              <select
                className="pos-payment-select"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                aria-label="Payment method"
              >
                {paymentOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pos-paid-field">
              <label htmlFor="pos-paid">Amount received</label>
              <div className="pos-money-field">
                <span>৳</span>
                <input
                  id="pos-paid"
                  type="number"
                  min="0"
                  value={paidAmount}
                  onFocus={(event) =>
                    clearZeroStateOnFocus(event, () => setPaidAmount(""))
                  }
                  onBlur={(event) =>
                    restoreZeroStateOnBlur(event, () => setPaidAmount("0"))
                  }
                  onChange={(event) =>
                    setPaidAmount(
                      normalizeIntegerInputValue(event.target.value, ""),
                    )
                  }
                />
              </div>
            </div>
            <div className="pos-balance-grid">
              <div>
                <span>Change</span>
                <strong>৳ {formatMoney(change)}</strong>
              </div>
              <div className={due > 0 ? "is-due" : "is-paid"}>
                <span>Due</span>
                <strong>৳ {formatMoney(due)}</strong>
              </div>
            </div>

            {error && (
              <div className="pos-error" role="alert">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <div className="pos-checkout-actions">
              <button
                type="button"
                className="pos-print-button pos-print-priority"
                onClick={() => handleCreateSale({ print: true })}
                disabled={loading || !canSubmit}
              >
                <FileText size={16} /> Complete & print
              </button>
              <Button
                className="pos-complete-button"
                onClick={() => handleCreateSale({ print: false })}
                disabled={loading || !canSubmit}
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    Complete sale <ArrowRight size={17} />
                  </>
                )}
              </Button>
            </div>
            <p className="pos-trust-note">
              <Check size={14} /> Your transaction is validated before it is
              saved.
            </p>
          </div>
        </aside>
      </div>

      <div className="pos-keyboard-hint">
        <span>
          <kbd>Enter</kbd> Search
        </span>
        <span>
          <kbd>+</kbd> Add quantity
        </span>
        <span>
          <kbd>Esc</kbd> Clear selection
        </span>
      </div>

      <Modal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        title="Invoice Preview"
        size="xl"
      >
        {createdSale ? (
          <div className="space-y-4">
            <div className="invoice-modal-controls">
              <SaleInvoice sale={createdSale} />
              <div className="mt-4 flex justify-end gap-2 invoice-modal-actions">
                <Button
                  onClick={() =>
                    window.open(`/print/invoice/${createdSale.id}`, "_blank")
                  }
                >
                  Print Invoice
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowInvoice(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[var(--text-secondary)]">No invoice available.</p>
        )}
      </Modal>
    </div>
  );
};

export default Pos;
