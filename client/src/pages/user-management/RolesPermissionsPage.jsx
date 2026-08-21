import { useEffect, useMemo, useState } from "react";
import { Copy, KeyRound, PencilLine, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import "./access-control.css";

import Badge from "../../components/ui/Badge";
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
    <div className="access-control-page space-y-6 page-container">
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

      <Card className="access-panel access-filter-panel">
        <div className="access-filter-grid access-filter-grid--roles">
          <Input
            label="Search roles"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or description"
          />

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
      </Card>

      <Card className="access-panel access-table-card">
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
              <Table.Head className="access-col-secondary">Description</Table.Head>
              <Table.Head>Permissions</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head className="text-right">Actions</Table.Head>
            </Table.Header>
            <Table.Body>
              {filteredRoles.map((role) => (
                <Table.Row key={role.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <div className="access-role-mark" aria-hidden="true">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text)]">{role.name}</p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="access-col-secondary">{role.description || "No description provided."}</Table.Cell>
                  <Table.Cell>
                    <Badge variant="info">
                      {Object.keys(role.permissions || {}).length} modules
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={role.is_active ? "success" : "danger"}>
                      {role.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="access-actions">
                      <Button aria-label={`Edit ${role.name}`} size="sm" variant="secondary" onClick={() => openEditModal(role)}>
                        <PencilLine size={14} />
                        <span className="access-actions-label">Edit</span>
                      </Button>
                      <Button aria-label={`Duplicate ${role.name}`} size="sm" variant="secondary" onClick={() => handleDuplicate(role)}>
                        <Copy size={14} />
                        <span className="access-actions-label">Duplicate</span>
                      </Button>
                      <Button aria-label={`Delete ${role.name}`} size="sm" variant="danger" onClick={() => handleDelete(role)}>
                        <Trash2 size={14} />
                        <span className="access-actions-label">Delete</span>
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

          <div className="access-permission-panel">
            <div className="access-permission-panel__head">
              <KeyRound size={18} className="text-[var(--text-secondary)]" />
              <p className="font-semibold text-[var(--text)]">Permission Matrix</p>
            </div>

            <div className="access-permission-panel__table">
              <table className="text-left text-sm">
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
