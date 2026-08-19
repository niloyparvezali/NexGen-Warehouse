import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import InvoicePrint from "../components/invoice/InvoicePrint";

import Dashboard from "../pages/dashboard/Dashboard";
import Brand from "../pages/brand/Brand";
import Unit from "../pages/unit/Unit";
import Product from "../pages/product/Product";
import Customer from "../pages/customer/Customer";
import CustomerPayments from "../pages/customer/CustomerPayments";
import CustomerLedger from "../pages/customer/CustomerLedger";
import Supplier from "../pages/supplier/Supplier";
import SupplierPayments from "../pages/supplier/SupplierPayments";
import SupplierLedger from "../pages/supplier/SupplierLedger";
import Purchase from "../pages/purchase/Purchase";
import Sales from "../pages/sales/Sales";
import EasyReturn from "../pages/easy-return/EasyReturn";
import Inventory from "../pages/inventory/Inventory";
import Expense from "../pages/expense/Expense";
import Reports from "../pages/reports/Reports";
import Settings from "../pages/settings/Settings";
import UsersPage from "../pages/user-management/UsersPage";
import RolesPermissionsPage from "../pages/user-management/RolesPermissionsPage";
import CategoryList from "../pages/category/CategoryList";
import PermissionRoute from "./PermissionRoute";
import NotFound from "../pages/NotFound";

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/print/invoice/:id" element={<InvoicePrint />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/category" element={<CategoryList />} />
          <Route path="/brand" element={<Brand />} />
          <Route path="/unit" element={<Unit />} />
          <Route path="/product" element={<Product />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/customer-payments" element={<CustomerPayments />} />
          <Route path="/customer-ledger" element={<CustomerLedger />} />
          <Route path="/supplier" element={<Supplier />} />
          <Route path="/supplier-payments" element={<SupplierPayments />} />
          <Route path="/supplier-ledger" element={<SupplierLedger />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/easy-return" element={<EasyReturn />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />

          <Route element={<PermissionRoute module="users" action="view" />}>
            <Route path="/user-management/users" element={<UsersPage />} />
          </Route>

          <Route element={<PermissionRoute module="roles" action="view" />}>
            <Route path="/user-management/roles" element={<RolesPermissionsPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
