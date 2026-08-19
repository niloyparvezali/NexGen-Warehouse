import { useEffect, useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";
import api from "../../api/axios";

const WARRANTY_UNITS = ["Day", "Month", "Year"];

const parseWarrantyInput = (value) => {
  if (value == null || value === "") {
    return { value: "", unit: "Day" };
  }

  const normalized = String(value).trim().toLowerCase();
  const quantityMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  const quantity = quantityMatch ? Number(quantityMatch[1]) : NaN;

  if (!Number.isFinite(quantity)) {
    return { value: "", unit: "Day" };
  }

  let unit = "Day";

  if (/year|yr/.test(normalized)) {
    unit = "Year";
  } else if (/month|mo/.test(normalized)) {
    unit = "Month";
  } else if (/day|d/.test(normalized)) {
    unit = "Day";
  }

  return {
    value: String(Math.max(0, Math.trunc(quantity))),
    unit,
  };
};

const convertWarrantyToDaysString = (value, unit) => {
  const quantity = Number(value);

  if (!Number.isFinite(quantity)) {
    return undefined;
  }

  const multiplier = unit === "Year" ? 365 : unit === "Month" ? 30 : 1;
  return String(Math.round(quantity * multiplier));
};

const ProductForm = ({ initialData = { id: null, name: "", sku: "", barcode: "", categoryId: "", brandId: "", unitId: "", purchasePrice: "", sellingPrice: "", minimumStock: "", description: "", warranty: "" }, onSubmit, loading = false }) => {
  const [name, setName] = useState(initialData.name || "");
  const [sku, setSku] = useState(initialData.sku || "");
  const [barcode, setBarcode] = useState(initialData.barcode || "");
  const [categoryId, setCategoryId] = useState(initialData.categoryId || "");
  const [brandId, setBrandId] = useState(initialData.brandId || "");
  const [unitId, setUnitId] = useState(initialData.unitId || "");
  const [purchasePrice, setPurchasePrice] = useState(initialData.purchasePrice || "");
  const [sellingPrice, setSellingPrice] = useState(initialData.sellingPrice || "");
  const [minimumStock, setMinimumStock] = useState(initialData.minimumStock || "");
  const initialWarranty = parseWarrantyInput(initialData.warranty);
  const [description, setDescription] = useState(initialData.description || "");
  const [warrantyValue, setWarrantyValue] = useState(initialWarranty.value);
  const [warrantyUnit, setWarrantyUnit] = useState(initialWarranty.unit);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);

  const isEdit = Boolean(initialData?.id);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoryRes, brandRes, unitRes] = await Promise.all([
          api.get("/categories", {
            params: {
              page: 1,
              limit: 1000,
              search: "",
            },
          }),
          api.get("/brands"),
          api.get("/units"),
        ]);

        const allCategories = categoryRes.data?.data?.categories ?? [];
        const selectedCategory =
          initialData?.categoryId &&
          !allCategories.some((category) => category.id === initialData.categoryId)
            ? {
                id: initialData.categoryId,
                name: initialData?.category?.name || "Selected category",
              }
            : null;

        setCategories(selectedCategory ? [...allCategories, selectedCategory] : allCategories);
        setBrands(brandRes.data?.data?.brands ?? []);
        setUnits(unitRes.data?.data?.units ?? []);
      } catch (err) {
        console.error(err);
      }
    };

    loadOptions();
  }, [initialData?.categoryId, initialData?.category?.name]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!categoryId) {
      setError("Category is required.");
      return;
    }

    if (!brandId) {
      setError("Brand is required.");
      return;
    }

    if (!unitId) {
      setError("Unit is required.");
      return;
    }

    setError("");

    onSubmit({
      name: name.trim(),
      sku: sku.trim() || undefined,
      barcode: barcode.trim() || undefined,
      categoryId,
      brandId,
      unitId,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      minimumStock: Number(minimumStock || 0),
      description: description.trim() || undefined,
      warranty:
        warrantyValue !== ""
          ? convertWarrantyToDaysString(warrantyValue, warrantyUnit)
          : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="wc-form">
      {error && <p className="wc-form-error">{error}</p>}

      <section className="wc-form-section">
        <div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Product identity</h3><p className="wc-form-section__hint">Use clear identifiers so staff can find the item quickly during sales, purchases and stock work.</p></div></div>
        <div className="wc-form-grid wc-form-grid--2">
          <Input label="Product name" placeholder="e.g. Logitech M185 Wireless Mouse" value={name} autoFocus onChange={(e) => { setName(e.target.value); if (error) setError(""); }} />
          <Input label="SKU" placeholder="Leave blank to auto-generate" value={sku} onChange={(e) => setSku(e.target.value)} />
          <Input label="Barcode" placeholder="Scan or enter barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
          <div className="form-field"><label className="form-label">Unit</label><select value={unitId} onChange={(e) => setUnitId(e.target.value)}><option value="">Select unit</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></div>
        </div>
      </section>

      <section className="wc-form-section">
        <div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Classification</h3><p className="wc-form-section__hint">Keep categories and brands consistent so reports and filters stay useful.</p></div></div>
        <div className="wc-form-grid wc-form-grid--2">
          <div className="form-field"><label className="form-label">Category</label><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div className="form-field"><label className="form-label">Brand</label><select value={brandId} onChange={(e) => setBrandId(e.target.value)}><option value="">Select brand</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></div>
        </div>
      </section>

      <section className="wc-form-section">
        <div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Pricing & stock</h3><p className="wc-form-section__hint">Set the commercial values and the minimum level that should trigger attention.</p></div></div>
        <div className="wc-form-grid wc-form-grid--3">
          <Input label="Cost price" type="number" min="0" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
          <Input label="Selling price" type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
          <Input label="Minimum stock" type="number" min="0" value={minimumStock} onChange={(e) => setMinimumStock(e.target.value)} />
        </div>
      </section>

      <section className="wc-form-section">
        <div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Warranty & notes</h3><p className="wc-form-section__hint">Optional product information used by sales and support staff.</p></div></div>
        <div className="wc-form-grid wc-form-grid--2">
          <div className="form-field"><label className="form-label">Warranty</label><div className="grid min-w-0 grid-cols-[minmax(0,1fr)_140px] gap-3"><Input aria-label="Warranty value" placeholder="0" type="number" min="0" step="1" value={warrantyValue} onChange={(e) => setWarrantyValue(e.target.value)} /> <select aria-label="Warranty unit" value={warrantyUnit} onChange={(e) => setWarrantyUnit(e.target.value)}>{WARRANTY_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></div></div>
          <div className="form-field"><label className="form-label">Description</label><textarea rows={3} placeholder="Optional product notes or specifications" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
      </section>

      <div className="wc-form-actions"><Button type="submit" disabled={loading}>{loading ? (isEdit ? "Updating…" : "Saving…") : isEdit ? "Update product" : "Save product"}</Button></div>
    </form>
  );

};

export default ProductForm;
