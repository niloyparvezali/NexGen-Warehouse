import { useEffect, useState } from "react";
import {
  Briefcase,
  ShieldCheck,
  Users,
  FileText,
  ScanLine,
  DatabaseBackup,
  KeyRound,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import {
  getSettings,
  updateSettings,
  getRoles,
  getUsers,
  backupDatabase,
  getBackupHistory,
  changePassword,
  resetUserData,
  resetStockData,
  resetSalesData,
  resetPurchasesData,
  resetExpensesData,
  resetReturnsData,
  resetReportsData,
  resetCustomerData,
  resetSupplierData,
} from "../../services/settings.service";
import { normalizePhoneInput, isValidPhoneNumber } from "../../utils/phone";
import UsersPage from "../user-management/UsersPage";
import RolesPermissionsPage from "../user-management/RolesPermissionsPage";

const tabs = [
  { key: "company", label: "Company", icon: Briefcase },
  { key: "users", label: "Users", icon: Users },
  { key: "roles", label: "Roles", icon: ShieldCheck },
  { key: "invoice", label: "Invoice", icon: FileText },
  { key: "barcode", label: "Barcode", icon: ScanLine },
  { key: "backup", label: "Backup", icon: DatabaseBackup },
  { key: "security", label: "Security", icon: KeyRound },
];

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.users)) return value.users;
  if (Array.isArray(value?.roles)) return value.roles;
  if (Array.isArray(value?.backups)) return value.backups;
  return [];
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("company");
  const [settings, setSettings] = useState(null);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resettingStock, setResettingStock] = useState(false);
  const [resettingSales, setResettingSales] = useState(false);
  const [resettingPurchases, setResettingPurchases] = useState(false);
  const [resettingExpenses, setResettingExpenses] = useState(false);
  const [resettingReturns, setResettingReturns] = useState(false);
  const [resettingReports, setResettingReports] = useState(false);
  const [resettingCustomers, setResettingCustomers] = useState(false);
  const [resettingSuppliers, setResettingSuppliers] = useState(false);
  const [form, setForm] = useState({});
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const resetInProgress =
    resetting ||
    resettingStock ||
    resettingSales ||
    resettingPurchases ||
    resettingExpenses ||
    resettingReturns ||
    resettingReports ||
    resettingCustomers ||
    resettingSuppliers;

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, rolesRes, usersRes, backupsRes] = await Promise.all([
        getSettings(),
        getRoles(),
        getUsers(),
        getBackupHistory(),
      ]);
      const settingsData = settingsRes?.data || settingsRes;
      setSettings(settingsData);
      setForm(settingsData || {});
      setRoles(normalizeList(rolesRes));
      setUsers(normalizeList(usersRes));
      setBackups(normalizeList(backupsRes));
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load settings.");
      setRoles([]);
      setUsers([]);
      setBackups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const [settingsRes, rolesRes, usersRes, backupsRes] = await Promise.all(
          [getSettings(), getRoles(), getUsers(), getBackupHistory()],
        );
        if (!active) return;

        const settingsData = settingsRes?.data || settingsRes;
        setSettings(settingsData);
        setForm(settingsData || {});
        setRoles(normalizeList(rolesRes));
        setUsers(normalizeList(usersRes));
        setBackups(normalizeList(backupsRes));
      } catch (error) {
        if (active) {
          setMessage(
            error.response?.data?.message || "Failed to load settings.",
          );
          setRoles([]);
          setUsers([]);
          setBackups([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    const cleanPhone = normalizePhoneInput(form.company_phone || "");
    if ((form.company_phone || "").trim() && !isValidPhoneNumber(cleanPhone)) {
      setMessage("Phone number must be exactly 11 digits.");
      return;
    }

    try {
      setSaving(true);
      const payload = { ...form, company_phone: cleanPhone || undefined };
      const response = await updateSettings(payload);
      setSettings(response.data || response);
      setForm(response.data || response || {});
      setMessage("Settings updated successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      await changePassword(password);
      setMessage("Password updated successfully.");
      setPassword("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update password.");
    }
  };

  const handleBackup = async () => {
    try {
      await backupDatabase();
      setMessage("Backup created successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Backup failed.");
    }
  };

  const handleResetUserData = async () => {
    const confirmed = window.confirm(
      "Reset User Data?\n\nThis permanently removes ALL user-created business data, including customers, suppliers, sales, purchases, expenses, payments, returns, stock history, products, brands, units, and categories.\n\nSystem users, roles, and company settings are not deleted, so you can still sign in after the reset.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setResetting(true);
      await resetUserData();
      setMessage("User data reset successfully.");
      await loadData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to reset user data.",
      );
    } finally {
      setResetting(false);
    }
  };

  const handleResetStockData = async () => {
    const confirmed = window.confirm("Reset Stock Data?\n\nThis will set every product stock quantity to 0.");
    if (!confirmed) return;

    try {
      setResettingStock(true);
      await resetStockData();
      setMessage("Stock reset successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset stock data.");
    } finally {
      setResettingStock(false);
    }
  };

  const handleResetSalesData = async () => {
    const confirmed = window.confirm("Reset Sales Data?\n\nThis clears all sales, sale returns, customer payments, and their stock movements. Customer records stay saved and customer balances are reset.");
    if (!confirmed) return;

    try {
      setResettingSales(true);
      await resetSalesData();
      setMessage("Sales data reset successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset sales data.");
    } finally {
      setResettingSales(false);
    }
  };

  const handleResetPurchasesData = async () => {
    const confirmed = window.confirm("Reset Purchases Data?\n\nThis clears all purchases, supplier payments, and their stock movements. Supplier records stay saved and supplier balances are reset.");
    if (!confirmed) return;

    try {
      setResettingPurchases(true);
      await resetPurchasesData();
      setMessage("Purchases data reset successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset purchases data.");
    } finally {
      setResettingPurchases(false);
    }
  };

  const handleResetExpensesData = async () => {
    const confirmed = window.confirm("Reset Expenses Data?\n\nThis will permanently remove all recorded expenses.");
    if (!confirmed) return;

    try {
      setResettingExpenses(true);
      await resetExpensesData();
      setMessage("Expenses data reset successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset expenses data.");
    } finally {
      setResettingExpenses(false);
    }
  };

  const handleResetReturnsData = async () => {
    const confirmed = window.confirm("Reset Easy Return Data?\n\nThis clears all sale returns and return items, reverses the stock added by those returns, and restores affected sales to Completed.");
    if (!confirmed) return;

    try {
      setResettingReturns(true);
      await resetReturnsData();
      setMessage("Easy return data reset successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset easy return data.");
    } finally {
      setResettingReturns(false);
    }
  };

  const handleResetReportsData = async () => {
    const confirmed = window.confirm("Reset Reports & Analytics Data?\n\nThis clears the transaction data used by reports: sales, purchases, returns, payments, expenses, stock history, and related balances. Master records stay saved.");
    if (!confirmed) return;

    try {
      setResettingReports(true);
      await resetReportsData();
      setMessage("Reports & analytics data reset successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset reports and analytics data.");
    } finally {
      setResettingReports(false);
    }
  };

  const handleResetCustomerData = async () => {
    const confirmed = window.confirm("Reset Customer Data?\n\nThis clears sales, returns, payments, and stock movements linked to customers while keeping customer records saved. Guest sales are not removed.");
    if (!confirmed) return;

    try {
      setResettingCustomers(true);
      await resetCustomerData();
      setMessage("Customer data reset successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset customer data.");
    } finally {
      setResettingCustomers(false);
    }
  };

  const handleResetSupplierData = async () => {
    const confirmed = window.confirm("Reset Supplier Data?\n\nThis clears purchases, supplier payments, and their stock movements while keeping supplier records saved.");
    if (!confirmed) return;

    try {
      setResettingSuppliers(true);
      await resetSupplierData();
      setMessage("Supplier data reset successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset supplier data.");
    } finally {
      setResettingSuppliers(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="wc-page world-module world-settings flex h-[70vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="wc-page world-module world-settings space-y-5 page-container page-standard settings-page">
      <div>
        <h1 className="page-title">Settings & Administration</h1>
        <p className="mt-2 secondary-text">
          Manage company profile, users, roles, invoice rules, and backups.
        </p>
      </div>

      {message && (
        <div className="settings-message">
          {message}
        </div>
      )}

      <div className="settings-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.key}
              size="sm"
              variant={activeTab === tab.key ? "secondary" : "ghost"}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon size={16} />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {activeTab === "company" && (
        <Card title="Company Profile">
          <div className="max-w-3xl mx-auto">
            {/* Company Logo */}
            <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 p-5">
              <p className="mb-3 text-sm font-medium text-[var(--text-secondary)]">
                Company Logo
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="flex h-32 w-64 items-center justify-center rounded-lg bg-[var(--surface)] p-4">
                  <img
                    src={form.company_logo || "/logo/ng-full-black.png"}
                    alt={form.company_name || "NEXGEN TECHNOLOGY"}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="text-sm text-[var(--text-secondary)]">
                  <p className="font-medium text-[var(--text)]">NEXGEN TECHNOLOGY</p>
                  <p className="mt-1">Current company logo</p>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Company Name"
                value={form.company_name || ""}
                onChange={(e) =>
                  setForm({ ...form, company_name: e.target.value })
                }
              />

              <Input
                label="Phone"
                value={form.company_phone || ""}
                maxLength={11}
                onChange={(e) =>
                  setForm({
                    ...form,
                    company_phone: normalizePhoneInput(e.target.value),
                  })
                }
              />

              <Input
                label="Email"
                value={form.company_email || ""}
                onChange={(e) =>
                  setForm({ ...form, company_email: e.target.value })
                }
              />

              <Input
                label="Website"
                value={form.company_website || ""}
                onChange={(e) =>
                  setForm({ ...form, company_website: e.target.value })
                }
              />

              <Input
                label="Tax Number"
                value={form.tax_number || ""}
                onChange={(e) =>
                  setForm({ ...form, tax_number: e.target.value })
                }
              />

              <Input
                label="Currency"
                value={form.currency || ""}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              />

              <Input
                label="Time Zone"
                value={form.timezone || ""}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              />

              <Input
                label="Address"
                value={form.company_address || ""}
                onChange={(e) =>
                  setForm({ ...form, company_address: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Company Profile"}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === "users" && (
        <div className="settings-managed-view">
          <UsersPage />
        </div>
      )}

      {activeTab === "roles" && (
        <div className="settings-managed-view">
          <RolesPermissionsPage />
        </div>
      )}

      {activeTab === "invoice" && (
        <Card title="Invoice Settings">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Invoice Prefix"
              value={form.invoice_prefix || ""}
              onChange={(e) =>
                setForm({ ...form, invoice_prefix: e.target.value })
              }
            />
            <Input
              label="Purchase Prefix"
              value={form.purchase_prefix || ""}
              onChange={(e) =>
                setForm({ ...form, purchase_prefix: e.target.value })
              }
            />
            <Input
              label="Payment Prefix"
              value={form.payment_prefix || ""}
              onChange={(e) =>
                setForm({ ...form, payment_prefix: e.target.value })
              }
            />
            <Input
              label="Number Format"
              value={form.number_format || ""}
              onChange={(e) =>
                setForm({ ...form, number_format: e.target.value })
              }
            />
          </div>
          <div className="mt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Invoice Settings"}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === "barcode" && (
        <Card title="Barcode Settings">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Barcode Type"
              value={form.barcode_type || ""}
              onChange={(e) =>
                setForm({ ...form, barcode_type: e.target.value })
              }
            />
            <Input
              label="Barcode Prefix"
              value={form.barcode_prefix || ""}
              onChange={(e) =>
                setForm({ ...form, barcode_prefix: e.target.value })
              }
            />
            <Input
              label="Print Size"
              value={form.barcode_print_size || ""}
              onChange={(e) =>
                setForm({ ...form, barcode_print_size: e.target.value })
              }
            />
            <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/60 px-4 py-3 text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={Boolean(form.auto_generate_barcode)}
                onChange={(e) =>
                  setForm({ ...form, auto_generate_barcode: e.target.checked })
                }
              />
              Auto Generate Barcode
            </label>
          </div>
          <div className="mt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Barcode Settings"}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === "backup" && (
        <Card title="Backup & Restore">
          <div className="flex gap-3">
            <Button onClick={handleBackup} disabled={resetInProgress}>Create Backup</Button>
          </div>

          <div className="mt-6 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4">
            <p className="mb-2 text-sm font-medium text-[var(--text)]">
              Reset User Data
            </p>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              Permanently remove all user-created business data, including inventory (Products, Brands, Units, and Categories). System users, roles, and company settings are preserved.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="danger" onClick={handleResetUserData} disabled={resetInProgress}>
                {resetting ? "Resetting..." : "Reset User Data"}
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-base font-semibold text-[var(--text)]">
                Danger Zone
              </p>
              <span className="rounded-full border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-danger)]">
                Destructive
              </span>
            </div>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              These reset actions permanently clear data for that section. Use carefully.
            </p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Button variant="danger" className="min-h-[46px] w-full justify-center" onClick={handleResetStockData} disabled={resetInProgress}>
                {resettingStock ? "Resetting Stock..." : "Reset Stock"}
              </Button>
              <Button variant="danger" className="min-h-[46px] w-full justify-center" onClick={handleResetSalesData} disabled={resetInProgress}>
                {resettingSales ? "Resetting Sales..." : "Reset Sales"}
              </Button>
              <Button variant="danger" className="min-h-[46px] w-full justify-center" onClick={handleResetPurchasesData} disabled={resetInProgress}>
                {resettingPurchases ? "Resetting Purchases..." : "Reset Purchases"}
              </Button>
              <Button variant="danger" className="min-h-[46px] w-full justify-center" onClick={handleResetExpensesData} disabled={resetInProgress}>
                {resettingExpenses ? "Resetting Expenses..." : "Reset Expenses"}
              </Button>
              <Button variant="danger" className="min-h-[46px] w-full justify-center" onClick={handleResetReturnsData} disabled={resetInProgress}>
                {resettingReturns ? "Resetting Returns..." : "Reset Easy Return"}
              </Button>
              <Button variant="danger" className="min-h-[46px] w-full justify-center" onClick={handleResetReportsData} disabled={resetInProgress}>
                {resettingReports ? "Resetting Reports..." : "Reset Reports"}
              </Button>
              <Button variant="danger" className="min-h-[46px] w-full justify-center" onClick={handleResetCustomerData} disabled={resetInProgress}>
                {resettingCustomers ? "Resetting Customers..." : "Reset Customers"}
              </Button>
              <Button variant="danger" className="min-h-[46px] w-full justify-center" onClick={handleResetSupplierData} disabled={resetInProgress}>
                {resettingSuppliers ? "Resetting Suppliers..." : "Reset Suppliers"}
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {backups.map((backup) => (
              <div
                key={backup.fileName}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/60 p-3 text-sm text-[var(--text-secondary)]"
              >
                {backup.fileName}
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "security" && (
        <Card title="Password Management">
          <Input
            label="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
          <div className="mt-4">
            <Button onClick={handlePasswordChange}>Change Password</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Settings;
