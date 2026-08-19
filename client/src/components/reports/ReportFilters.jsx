import { useState } from "react";
import { PRODUCT_CATEGORY_NAMES } from "../../constants/productCategories";

const ReportFilters = ({
  onFilter,
  showDateRange = true,
  showCustomer = false,
  showSupplier = false,
  showCategory = false,
  showPaymentStatus = false,
  customers = [],
  suppliers = [],
  categories = [],
}) => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    customerId: "",
    supplierId: "",
    categoryId: "",
    paymentStatus: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "")
    );
    onFilter(activeFilters);
  };

  const categoryOptions = categories?.length
    ? categories.map((category) => ({ id: category.id, name: category.name }))
    : PRODUCT_CATEGORY_NAMES.map((name) => ({ id: name, name }));

  return (
    <div className="report-filters">
      <h3 className="section-title">Filters</h3>

      <div className="report-filters__grid">
        {/* Date Range */}
        {showDateRange && (
          <>
            <div className="report-field">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
                className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text)] focus:outline-none focus:border-primary"
              />
            </div>

            <div className="report-field">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
                className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text)] focus:outline-none focus:border-primary"
              />
            </div>
          </>
        )}

        {/* Customer Filter */}
        {showCustomer && (
          <div className="report-field">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Customer
            </label>
            <select
              name="customerId"
              value={filters.customerId}
              onChange={handleChange}
              className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text)] focus:outline-none focus:border-primary"
            >
              <option value="">All Customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Supplier Filter */}
        {showSupplier && (
          <div className="report-field">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Supplier
            </label>
            <select
              name="supplierId"
              value={filters.supplierId}
              onChange={handleChange}
              className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text)] focus:outline-none focus:border-primary"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplierName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category Filter */}
        {showCategory && (
          <div className="report-field">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Category
            </label>
            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleChange}
              className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text)] focus:outline-none focus:border-primary"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Payment Status Filter */}
        {showPaymentStatus && (
          <div className="report-field">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Payment Status
            </label>
            <select
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleChange}
              className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text)] focus:outline-none focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="DUE">Due</option>
            </select>
          </div>
        )}
      </div>

      <div className="report-filters__actions">
        <button
          onClick={handleApplyFilters}
          className="report-action report-action--primary"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
};

export default ReportFilters;
