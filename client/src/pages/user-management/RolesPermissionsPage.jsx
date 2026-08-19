import { useEffect, useMemo, useState } from "react";
import { Copy, KeyRound, PencilLine, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import Select from "../../components/ui/Select";
import Skeleton from "../../components/ui/Skeleton";
import Table from "../../components/ui/Table";
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from "../../services/settings.service";

const ACTIONS = ["view", "create", "edit", "delete", "export", "print"];

const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "sales", label: "Sales" },
  { key: "products", label: "Products" },
  { key: "customers", label: "Customers" },
  { key: "suppliers", label: "Suppliers" },
  { key: "purchases", label: "Purchases" },
  { key: "expenses", label: "Expenses" },
  { key: "inventory", label: "Inventory" },
  { key: "returns", label: "Returns" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" },
  { key: "users", label: "User Management" },
  { key: "roles", label: "Roles & Permissions" },
  { key: "payments", label: "Payments" },
];

const defaultPermissionTemplate = () =>
  MODULES.reduce((acc, module) => {
    acc[module.key] = ["view"];
    return acc;
  }, {});

const normalizeRoles = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.roles)) return value.roles;
  return [];
};

const RolesPermissionsPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
    permissions: defaultPermissionTemplate(),
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles();
      const roleList = normalizeRoles(response);
      setRoles(roleList);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load roles.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const filteredRoles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const safeRoles = Array.isArray(roles) ? roles : [];

    return safeRoles.filter((role) => {
      const matchesSearch =
        !normalizedSearch ||
        String(role.name || "").toLowerCase().includes(normalizedSearch) ||
        String(role.description || "").toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && Boolean(role.is_active)) ||
        (statusFilter === "inactive" && !role.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [roles, search, statusFilter]);

  const openCreateModal = () => {
    setEditingRole(null);
    setForm({
      name: "",
      description: "",
      is_active: true,
      permissions: defaultPermissionTemplate(),
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    const permissions = MODULES.reduce((acc, module) => {
      const currentActions = Array.isArray(role.permissions?.[module.key]) ? role.permissions[module.key] : ["view"];
      acc[module.key] = currentActions;
      return acc;
    }, {});

    setForm({
      name: role.name || "",
      description: role.description || "",
      is_active: Boolean(role.is_active),
      permissions,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const togglePermission = (moduleKey, action) => {
    setForm((current) => {
      const currentList = Array.isArray(current.permissions?.[moduleKey]) ? current.permissions[moduleKey] : [];
      const nextList = currentList.includes(action)
        ? currentList.filter((item) => item !== action)
        : [...currentList, action];

      return {
        ...current,
        permissions: {
          ...current.permissions,
          [moduleKey]: nextList,
        },
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError("Role name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        is_active: Boolean(form.is_active),
        permissions: Object.entries(form.permissions).reduce((acc, [moduleKey, actions]) => {
          if (Array.isArray(actions) && actions.length > 0) {
            acc[moduleKey] = actions;
          }
          return acc;
        }, {}),
      };

      if (editingRole) {
        await updateRole(editingRole.id, payload);
        toast.success("Role updated successfully.");
      } else {
        await createRole(payload);
        toast.success("Role created successfully.");
      }

      setIsModalOpen(false);
      setFormError("");
      await loadRoles();
    } catch (error) {
      const message = error.response?.data?.message || "Failed to save role.";
      toast.error(message);
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = (role) => {
    const permissions = MODULES.reduce((acc, module) => {
      acc[module.key] = Array.isArray(role.permissions?.[module.key]) ? role.permissions[module.key] : ["view"];
      return acc;
    }, {});

    setEditingRole(null);
    setForm({
      name: `${role.name} Copy`,
      description: role.description || "",
      is_active: true,
      permissions,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (role) => {
    const confirmed = window.confirm(`Delete the role "${role.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteRole(role.id);
      toast.success("Role deleted successfully.");
      await loadRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete role.");
    }
  };

  return (
    <div className="space-y-6 page-container">
      <PageHeader
        badge="Access control"
        title="Roles & Permissions"
        description="Define access groups for each module, then assign them to users with consistent operational policies."
        actions={
          <Button size="sm" onClick={openCreateModal}>
            <Plus size={16} />
            New Role
          </Button>
        }
      />

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full lg:max-w-md">
            <Input
              label="Search roles"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or description"
            />
          </div>

          <div className="w-full lg:max-w-xs">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              options={[
                { value: "all", label: "All roles" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card className="p-0">
        {loading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ) : filteredRoles.length === 0 ? (
          <EmptyState
            title="No roles found"
            description="Create a role to start managing access across the system."
            action={<Button onClick={openCreateModal}>Create Role</Button>}
          />
        ) : (
          <Table>
            <Table.Header>
              <Table.Head>Role</Table.Head>
              <Table.Head>Description</Table.Head>
              <Table.Head>Permissions</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head className="text-right">Actions</Table.Head>
            </Table.Header>
            <Table.Body>
              {filteredRoles.map((role) => (
                <Table.Row key={role.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text)]">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text)]">{role.name}</p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{role.description || "No description provided."}</Table.Cell>
                  <Table.Cell>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {Object.keys(role.permissions || {}).length} modules
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        role.is_active
                          ? "bg-[var(--success-soft)] text-[var(--success)]"
                          : "bg-[var(--danger-soft)] text-[var(--danger)]"
                      }`}
                    >
                      {role.is_active ? "Active" : "Inactive"}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEditModal(role)}>
                        <PencilLine size={14} />
                        Edit
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleDuplicate(role)}>
                        <Copy size={14} />
                        Duplicate
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(role)}>
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole ? "Edit Role" : "Create Role"} size="xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Role Name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Select
              label="Status"
              value={String(form.is_active)}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.value === "true" }))}
              options={[
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
            />
          </div>

          <Input
            label="Description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Describe the purpose of this role"
          />

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/60 p-4">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound size={18} className="text-[var(--text-secondary)]" />
              <p className="font-semibold text-[var(--text)]">Permission Matrix</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="pr-4 pb-3 font-medium text-[var(--text-secondary)]">Module</th>
                    {ACTIONS.map((action) => (
                      <th key={action} className="px-3 pb-3 text-center font-medium uppercase tracking-wide text-[var(--text-secondary)] text-[10px]">
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((module) => (
                    <tr key={module.key} className="border-t border-[var(--border)]">
                      <td className="py-3 pr-4 font-medium text-[var(--text)]">{module.label}</td>
                      {ACTIONS.map((action) => {
                        const permissions = form.permissions[module.key] || [];
                        const checked = permissions.includes(action);

                        return (
                          <td key={`${module.key}-${action}`} className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(module.key, action)}
                              className="h-4 w-4 rounded border-[var(--border)]"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {formError && <p className="rounded-xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{formError}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editingRole ? "Save Role" : "Create Role"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RolesPermissionsPage;
