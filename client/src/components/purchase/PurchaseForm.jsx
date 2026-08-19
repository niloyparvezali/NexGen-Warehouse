import { useEffect, useMemo, useRef, useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";
import PurchaseItemsTable from "./PurchaseItemsTable";

import { getSuppliers } from "../../services/supplier.service";
import { getProducts } from "../../services/product.service";
import { formatMoney } from "../../utils/formatters";

const emptyItem = (product) => ({
  productId: product?.id,
  product,
  quantity: 1,
  purchasePrice: Number(product?.purchasePrice || 0),
});

const generateUuid = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const PurchaseForm = ({ initialData = null, onSubmit, loading = false }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [notFoundQuery, setNotFoundQuery] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState(initialData?.attachment || "");
  const [clientReferenceId, setClientReferenceId] = useState(initialData?.clientReferenceId || generateUuid());
  const [supplierId, setSupplierId] = useState(initialData?.supplierId || "");
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || "");
  const [referenceNumber, setReferenceNumber] = useState(initialData?.referenceNumber || "");
  const [discount, setDiscount] = useState(initialData?.discount || 0);
  const [tax, setTax] = useState(initialData?.tax || 0);
  const [shippingCost, setShippingCost] = useState(initialData?.shippingCost || 0);
  const [totalBill, setTotalBill] = useState(initialData?.subtotal || initialData?.totalBill || 0);
  const [paidAmount, setPaidAmount] = useState(initialData?.paidAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || "CASH");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [items, setItems] = useState(
    initialData?.items?.map((item) => ({
      productId: item.productId || item.product?.id,
      product: item.product || null,
      quantity: item.quantity || 1,
      purchasePrice: Number(item.purchasePrice || item.product?.purchasePrice || 0),
    })) || [],
  );
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const isEdit = Boolean(initialData?.id);

  const maxAttachmentSize = 10 * 1024 * 1024;
  const acceptedFileTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ];
  const acceptedExtensions = ["pdf", "jpg", "jpeg", "png", "webp", "heic", "heif"];

  const getFileExtension = (fileName) => fileName.split(".").pop()?.toLowerCase() || "";
  const isPreviewableImage = (file) => {
    const ext = getFileExtension(file.name);
    return file.type.startsWith("image/") && !["heic", "heif"].includes(ext);
  };
  const isSupportedFile = (file) => {
    const ext = getFileExtension(file.name);
    return acceptedFileTypes.includes(file.type.toLowerCase()) || acceptedExtensions.includes(ext);
  };

  useEffect(() => {
    return () => {
      if (attachmentPreviewUrl) {
        URL.revokeObjectURL(attachmentPreviewUrl);
      }
    };
  }, [attachmentPreviewUrl]);

  const handleAttachmentSelect = (file) => {
    if (!file) return;

    const ext = getFileExtension(file.name);
    if (!isSupportedFile(file)) {
      setUploadError("Unsupported file: This file format is not supported. Please upload PDF, JPG, JPEG, PNG, WEBP, HEIC, or HEIF.");
      setAttachmentFile(null);
      setAttachmentPreviewUrl("");
      return;
    }

    if (file.size > maxAttachmentSize) {
      setUploadError("File is too large. Please upload a file smaller than 10 MB.");
      setAttachmentFile(null);
      setAttachmentPreviewUrl("");
      return;
    }

    setUploadError("");
    setAttachmentFile(file);
    if (attachmentPreviewUrl) {
      URL.revokeObjectURL(attachmentPreviewUrl);
    }
    setAttachmentPreviewUrl(isPreviewableImage(file) ? URL.createObjectURL(file) : "");
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0] || null;
    handleAttachmentSelect(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0] || null;
    handleAttachmentSelect(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleRemoveSelectedAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreviewUrl("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadSuppliers = async () => {
      setLoadingSuppliers(true);

      try {
        const response = await getSuppliers(1, 100, "");
        if (!ignore) {
          setSuppliers(response?.suppliers ?? []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) {
          setLoadingSuppliers(false);
        }
      }
    };

    loadSuppliers();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setSupplierId(initialData?.supplierId || "");
    setInvoiceNumber(initialData?.invoiceNumber || "");
    setReferenceNumber(initialData?.referenceNumber || "");
    setDiscount(initialData?.discount || 0);
    setTax(initialData?.tax || 0);
    setShippingCost(initialData?.shippingCost || 0);
    setTotalBill(initialData?.subtotal || initialData?.totalBill || 0);
    setPaidAmount(initialData?.paidAmount || 0);
    setPaymentMethod(initialData?.paymentMethod || "CASH");
    setNotes(initialData?.notes || "");
    setAttachmentFile(null);
    setAttachmentUrl(initialData?.attachment || "");
    setItems(
      initialData?.items?.map((item) => ({
        productId: item.productId || item.product?.id,
        product: item.product || null,
        quantity: item.quantity || 1,
        purchasePrice: Number(item.purchasePrice || item.product?.purchasePrice || 0),
      })) || [],
    );
  }, [initialData?.id]);

  const subtotal = Number(totalBill || 0);

  const grandTotal = subtotal - Number(discount || 0) + Number(tax || 0) + Number(shippingCost || 0);
  const supplierDue = Math.max(0, grandTotal - Number(paidAmount || 0) - Number(shippingCost || 0));
  const dueAmount = supplierDue;

  const handleSearchProducts = async () => {
    const term = searchText.trim();
    if (!term) {
      setSearchResults([]);
      setNotFoundQuery("");
      return;
    }

    try {
      const response = await getProducts(1, 20, term);
      const products = response?.products ?? [];
      const exact = products.find((item) => String(item.barcode || "").trim() === term);

      if (exact) {
        addProduct(exact);
        setSearchText("");
        setSearchResults([]);
        setNotFoundQuery("");
        setError("");
        return;
      }

      setSearchResults(products);
      setNotFoundQuery(products.length ? "" : term);
      setError(products.length ? "" : "No product matched your search.");
    } catch (err) {
      console.error(err);
      setSearchResults([]);
      setNotFoundQuery(term);
      setError("Unable to search products right now.");
    }
  };


  const addProduct = (product) => {
    setItems((current) => {
      const existingItem = current.find((item) => item.productId === product.id);
      if (existingItem) {
        return current.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [...current, emptyItem(product)];
    });
  };

  const handleUpdateItem = (index, field, value) => {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const handleRemoveItem = (index) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!supplierId) {
      setError("Supplier is required.");
      return;
    }

    if (Number(paidAmount || 0) > grandTotal - Number(shippingCost || 0)) {
      setError("Paid to supplier cannot exceed supplier amount due.");
      return;
    }

    setError("");

    onSubmit({
      supplierId,
      invoiceNumber: invoiceNumber.trim() || undefined,
      referenceNumber: referenceNumber.trim() || undefined,
      discount: Number(discount || 0),
      tax: Number(tax || 0),
      shippingCost: Number(shippingCost || 0),
      totalBill: Number(totalBill || 0),
      paidAmount: Number(paidAmount || 0),
      paymentMethod,
      notes: notes.trim() || undefined,
      attachment: attachmentFile || attachmentUrl || undefined,
      clientReferenceId,
      status: "COMPLETED",
      items: items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity || 1),
        purchasePrice: Number(item.purchasePrice || 0),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="wc-form purchase-form">
      {error && <p className="purchase-error">{error}</p>}

      <section className="purchase-compact-section">
        <div className="purchase-section-head">
          <div><span>Purchase</span><h3>Supplier & reference</h3></div>
          <small>Required supplier · optional reference</small>
        </div>
        <div className="purchase-meta-grid">
          <div>
            <label>Supplier</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} disabled={loadingSuppliers}>
              <option value="">{loadingSuppliers ? "Loading suppliers..." : "Select supplier"}</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.supplierName}{supplier.companyName ? ` · ${supplier.companyName}` : ""}</option>)}
            </select>
          </div>
          <Input label="Invoice number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Optional" />
          <Input label="Reference" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Optional" />
        </div>
      </section>

      <section className="purchase-compact-section purchase-search-section">
        <div className="purchase-section-head">
          <div><span>Catalog</span><h3>Add products</h3></div>
          <small>Type a name, SKU or scan a barcode in the same box</small>
        </div>
        <div className="purchase-unified-search">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchProducts())}
            placeholder="Search product, SKU or scan barcode..."
            aria-label="Search product or scan barcode"
          />
          <Button type="button" onClick={handleSearchProducts}>Search</Button>
        </div>
        <p className="purchase-search-hint">A barcode scanner types directly into this field, so no separate scanner box is necessary.</p>

        {searchResults.length > 0 ? (
          <div className="purchase-search-results">
            {searchResults.map((product) => (
              <button type="button" className="purchase-result-row" key={product.id} onClick={() => addProduct(product)}>
                <span><strong>{product.name}</strong><small>SKU {product.sku || "—"} · Stock {product.stockQuantity ?? 0}</small></span>
                <b>৳ {formatMoney(product.purchasePrice || 0)}</b>
                <span className="purchase-result-add">Add</span>
              </button>
            ))}
          </div>
        ) : notFoundQuery ? (
          <div className="purchase-not-found">
            <span>No product found for “{notFoundQuery}”.</span>
            <Button type="button" variant="secondary" size="sm" onClick={() => window.open("/product?create=true", "_blank")}>Add Product</Button>
          </div>
        ) : null}
      </section>

      <section className="purchase-compact-section purchase-items-section">
        <div className="purchase-section-head">
          <div><span>Line items</span><h3>Products in this purchase</h3></div>
          <small>{items.length} item{items.length === 1 ? "" : "s"}</small>
        </div>
        <PurchaseItemsTable items={items} onUpdateItem={handleUpdateItem} onRemoveItem={handleRemoveItem} />
      </section>

      <section className="purchase-summary-grid">
        <div className="purchase-compact-section">
          <div className="purchase-section-head"><div><span>Financials</span><h3>Purchase totals</h3></div></div>
          <div className="purchase-fields-grid">
            <Input label="Total bill" type="number" min="0" value={totalBill} onChange={(e) => setTotalBill(e.target.value)} />
            <Input label="Discount" type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            <Input label="Tax" type="number" min="0" value={tax} onChange={(e) => setTax(e.target.value)} />
            <Input label="Shipping cost" type="number" min="0" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} />
            <Input label="Paid to supplier" type="number" min="0" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
            <div><label>Payment method</label><select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option value="CASH">Cash</option><option value="CARD">Card</option><option value="BANK_TRANSFER">Bank transfer</option><option value="MOBILE_BANKING">Mobile banking</option></select></div>
          </div>
        </div>

        <aside className="purchase-total-card">
          <span>Grand total</span><strong>৳ {formatMoney(grandTotal || 0)}</strong>
          <div><span>Bill</span><b>৳ {formatMoney(subtotal || 0)}</b></div>
          <div><span>Discount</span><b>− ৳ {formatMoney(discount || 0)}</b></div>
          <div><span>Tax</span><b>৳ {formatMoney(tax || 0)}</b></div>
          <div><span>Shipping</span><b>৳ {formatMoney(shippingCost || 0)}</b></div>
          <div className="purchase-total-due"><span>Due to supplier</span><b>৳ {formatMoney(dueAmount || 0)}</b></div>
        </aside>
      </section>

      <section className="purchase-bottom-grid">
        <div>
          <label className="purchase-field-label">Purchase document</label>
          <div
            onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            className={`purchase-upload ${isDragActive ? "is-active" : ""}`}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif" onChange={handleFileInputChange} className="hidden" />
            <strong>{attachmentFile ? attachmentFile.name : "Attach invoice or purchase document"}</strong>
            <span>PDF, JPG, PNG, WEBP, HEIC · max 10 MB</span>
          </div>
          {uploadError ? <p className="purchase-error purchase-error--small">{uploadError}</p> : null}
          {attachmentFile ? (
            <div className="purchase-attachment-row"><span>{Math.round(attachmentFile.size / 1024)} KB</span><Button type="button" variant="secondary" size="sm" onClick={handleRemoveSelectedAttachment}>Remove</Button></div>
          ) : attachmentUrl ? (
            <div className="purchase-attachment-row"><a href={attachmentUrl} target="_blank" rel="noreferrer">View existing document</a></div>
          ) : null}
        </div>
        <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional purchase notes" />
      </section>

      <div className="wc-form-actions">
        <Button type="submit" disabled={loading}>
          {loading ? (isEdit ? "Updating purchase..." : "Saving purchase...") : isEdit ? "Update purchase" : "Save purchase"}
        </Button>
      </div>
    </form>
  );
};

export default PurchaseForm;
