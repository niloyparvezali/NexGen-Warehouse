import { useEffect, useState } from "react";
import { useSafePagination } from "../../hooks/useSafePagination";
import { useLocation } from "react-router-dom";

import ProductTable from "../../components/product/ProductTable";
import ProductForm from "../../components/product/ProductForm";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from "../../services/product.service";
import { getCategories } from "../../services/category.service";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const { currentPage: safePage, totalPages: safeTotalPages, hasPreviousPage, hasNextPage } = useSafePagination(page, pagination?.totalPages, setPage);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openRestore, setOpenRestore] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteProductData, setDeleteProductData] = useState(null);
  const [restoreProductData, setRestoreProductData] = useState(null);
  const location = useLocation();

  const fetchProducts = async () => {
    try {
      const response = await getProducts(page, 10, search, selectedCategory);
      setProducts(response.products ?? []);
      setPagination(response.pagination ?? {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    }
  };

  useEffect(() => {
    let ignore = false;

    if (location.search.includes("create=true")) {
      setOpenCreate(true);
    }

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProducts(page, 10, search, selectedCategory);

        if (!ignore) {
          setProducts(response.products ?? []);
          setPagination(response.pagination ?? {});
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load products.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [page, search, selectedCategory]);

  useEffect(() => {
    let ignore = false;

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);

        // request many categories for dropdown (server paginates), large limit to include all
        const response = await getCategories(1, 1000, "");

        if (!ignore) {
          setCategories(response.categories ?? []);
        }
      } catch (err) {
        console.error("Failed to load categories for product filter", err);
      } finally {
        if (!ignore) setCategoriesLoading(false);
      }
    };

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const handleCreate = async (data) => {
    try {
      setSaving(true);
      await createProduct(data);
      setOpenCreate(false);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setOpenEdit(true);
  };

  const handleUpdate = async (data) => {
    try {
      setSaving(true);
      await updateProduct(selectedProduct.id, data);
      setOpenEdit(false);
      setSelectedProduct(null);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product) => {
    setDeleteProductData(product);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      await deleteProduct(deleteProductData.id);
      setOpenDelete(false);
      setDeleteProductData(null);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = (product) => {
    setRestoreProductData(product);
    setOpenRestore(true);
  };

  const confirmRestore = async () => {
    try {
      setSaving(true);
      await restoreProduct(restoreProductData.id);
      setOpenRestore(false);
      setRestoreProductData(null);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to restore product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="wc-page world-module world-products wc-loading-screen">
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
      <div className="wc-page world-module world-products space-y-6 page-container">
        <PageHeader
          badge="Master data"
          title="Products"
          description="Manage product inventory, pricing, and stock details across your catalog."
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" onClick={() => setOpenCreate(true)}>Add Product</Button>
            </div>
          }
        />

        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-3 sm:max-w-xl sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/80 px-4 py-3 text-[var(--text)] shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/80 px-4 py-3 text-[var(--text)] shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-56"
              >
                <option value="">All Categories</option>
                {categoriesLoading ? (
                  <option value="" disabled>Loading categories...</option>
                ) : categories.length === 0 ? (
                  <option value="" disabled>No categories</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)]">{products.length} products</span>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          {products.length === 0 ? (
            <EmptyState
              title="No products yet"
              description="Add products to build out inventory and SKU details."
              action={<Button onClick={() => setOpenCreate(true)}>Add Product</Button>}
            />
          ) : (
            <ProductTable products={products} onEdit={handleEdit} onDelete={handleDelete} onRestore={handleRestore} />
          )}
        </Card>

        <Pagination
          page={safePage}
          totalPages={safeTotalPages}
          onPrevious={() => setPage(safePage - 1)}
          onNext={() => setPage(safePage + 1)}
        />
      </div>

      <Modal isOpen={openCreate} onClose={() => setOpenCreate(false)} title="Create Product">
        <ProductForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      <Modal isOpen={openEdit} onClose={() => { setOpenEdit(false); setSelectedProduct(null); }} title="Edit Product">
        <ProductForm key={selectedProduct?.id || "edit"} initialData={selectedProduct || { id: null, name: "", sku: "", barcode: "", categoryId: "", brandId: "", unitId: "", purchasePrice: "", sellingPrice: "", minimumStock: "", description: "", warranty: "" }} onSubmit={handleUpdate} loading={saving} />
      </Modal>

      <Modal isOpen={openDelete} onClose={() => { setOpenDelete(false); setDeleteProductData(null); }} title="Delete Product">
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{deleteProductData?.name}</span>?
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenDelete(false); setDeleteProductData(null); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={openRestore} onClose={() => { setOpenRestore(false); setRestoreProductData(null); }} title="Restore Product">
        <div className="space-y-6">
          <p className="text-[var(--text-secondary)]">
            Restore <span className="font-semibold text-[var(--text)]">{restoreProductData?.name}</span>?
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setOpenRestore(false); setRestoreProductData(null); }}>
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

export default ProductList;
