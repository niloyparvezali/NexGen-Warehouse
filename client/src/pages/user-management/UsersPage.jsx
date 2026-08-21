import { useEffect, useMemo, useState } from "react";
import { Eye, PencilLine, Power, ShieldCheck, UserCheck, UserPlus, UserX } from "lucide-react";
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
import StatCard from "../../components/dashboard/StatCard";
import Table from "../../components/ui/Table";
import { useAuth } from "../../context/auth/useAuth";
import {
  createUser,
  getRoles,
  getUsers,
  toggleUserStatus,
  updateUser,
} from "../../services/settings.service";

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  role_id: "",
  is_active: true,
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const buildUserName = (user) => {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  return fullName || user?.username || "Unnamed user";
};

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.users)) return value.users;
  if (Array.isArray(value?.roles)) return value.roles;
  return [];
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingMode, setEditingMode] = useState("create");
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, rolesResponse] = await Promise.all([getUsers(), getRoles()]);
      const userList = normalizeList(usersResponse);
      const roleList = normalizeList(rolesResponse);

      setUsers(userList);
      setRoles(roleList);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users.");
      setUsers([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const safeUsers = Array.isArray(users) ? users : [];

    return safeUsers.filter((user) => {
      const userName = buildUserName(user).toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const roleName = String(user.role?.name || "").toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        userName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        roleName.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && Boolean(user.is_active)) ||
        (statusFilter === "inactive" && !user.is_active);

      const matchesRole = roleFilter === "all" || String(user.role_id) === String(roleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [roleFilter, search, statusFilter, users]);

  const stats = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];
    const safeRoles = Array.isArray(roles) ? roles : [];
    const totalUsers = safeUsers.length;
    const activeUsers = safeUsers.filter((user) => user.is_active).length;
    const inactiveUsers = totalUsers - activeUsers;
    const totalRoles = safeRoles.length;

    return { totalUsers, activeUsers, inactiveUsers, totalRoles };
  }, [roles, users]);

  const openCreateModal = () => {
    setSelectedUser(null);
    setEditingMode("create");
    setForm({ ...EMPTY_FORM, role_id: roles[0]?.id ? String(roles[0].id) : "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditingMode("edit");
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
      role_id: String(user.role_id ?? ""),
      is_active: Boolean(user.is_active),
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = form.first_name.trim();
    const trimmedLastName = form.last_name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedUsername = (form.username || `${trimmedName}.${trimmedLastName}`.toLowerCase()).trim();

    if (!trimmedName || !trimmedLastName || !trimmedEmail || !form.role_id) {
      setFormError("Full name, email, and role are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (editingMode === "create" && !form.password) {
      setFormError("Password is required when creating a user.");
      return;
    }

    if (editingMode === "create" && form.password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        first_name: trimmedName,
        last_name: trimmedLastName,
        username: trimmedUsername,
        email: trimmedEmail,
        role_id: Number(form.role_id),
        is_active: Boolean(form.is_active),
      };

      if (editingMode === "create") {
        await createUser({ ...payload, password: form.password });
        toast.success("User created successfully.");
      } else {
        const nextRole = roles.find((role) => String(role.id) === String(form.role_id));
        if (
          selectedUser?.id === currentUser?.id &&
          nextRole &&
          String(nextRole.name) !== String(currentUser.role) &&
          !window.confirm("Changing your role may remove your current admin access. Continue?")
        ) {
          return;
        }

        await updateUser(selectedUser.id, {
          ...payload,
          ...(form.password ? { password: form.password } : {}),
        });
        toast.success("User updated successfully.");
      }

      setIsModalOpen(false);
      setForm(EMPTY_FORM);
      setSelectedUser(null);
      setFormError("");
      await loadData();
    } catch (error) {
      const message = error.response?.data?.message || "Unable to save user.";
      toast.error(message);
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (user) => {
    if (user.id === currentUser?.id && user.is_active) {
      const confirmed = window.confirm("This will deactivate your current account. Do you want to continue?");
      if (!confirmed) return;
    }

    try {
      await toggleUserStatus(user.id, !user.is_active);
      toast.success(user.is_active ? "User deactivated." : "User activated.");
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user status.");
    }
  };

  const roleOptions = roles.map((role) => ({ value: String(role.id), label: role.name }));

  return (
    <div className="access-control-page space-y-6 page-container">
      <PageHeader
        badge="Access control"
        title="Users"
        description="Review active accounts, assign roles, and keep access aligned with your operational policies."
        actions={
          <Button size="sm" onClick={openCreateModal}>
            <UserPlus size={16} />
            Add User
          </Button>
        }
      />

      <div className="access-stat-grid">
        <StatCard className="access-stat-card" title="Total Users" value={stats.totalUsers} icon={<UserPlus size={18} />} />
        <StatCard className="access-stat-card" title="Active Users" value={stats.activeUsers} icon={<UserCheck size={18} />} />
        <StatCard className="access-stat-card" title="Inactive Users" value={stats.inactiveUsers} icon={<UserX size={18} />} />
        <StatCard className="access-stat-card" title="Total Roles" value={stats.totalRoles} icon={<ShieldCheck size={18} />} />
      </div>

      <Card className="access-panel access-filter-panel">
        <div className="access-filter-grid">
          <Input
            label="Search users"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or role"
          />

          <Select
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />

          <Select
            label="Role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            options={[{ value: "all", label: "All roles" }, ...roleOptions]}
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
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Try a different search term or create a new user account."
            action={<Button onClick={openCreateModal}>Add User</Button>}
          />
        ) : (
          <Table>
            <Table.Header>
              <Table.Head>Name</Table.Head>
              <Table.Head className="access-col-secondary">Email</Table.Head>
              <Table.Head>Role</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head className="access-col-secondary">Created</Table.Head>
              <Table.Head className="access-col-secondary">Last activity</Table.Head>
              <Table.Head className="text-right">Actions</Table.Head>
            </Table.Header>
            <Table.Body>
              {filteredUsers.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    <div>
                      <p className="font-semibold text-[var(--text)]">{buildUserName(user)}</p>
                      <p className="text-xs text-[var(--text-secondary)]">@{user.username || "user"}</p>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="access-col-secondary">{user.email}</Table.Cell>
                  <Table.Cell>{user.role?.name || "Unassigned"}</Table.Cell>
                  <Table.Cell>
                    <Badge variant={user.is_active ? "success" : "danger"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="access-col-secondary">{formatDate(user.created_at)}</Table.Cell>
                  <Table.Cell className="access-col-secondary">{formatDate(user.updated_at || user.created_at)}</Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="access-actions">
                      <Button aria-label={`View ${buildUserName(user)}`} size="sm" variant="secondary" onClick={() => { setSelectedUser(user); setIsViewerOpen(true); }}>
                        <Eye size={14} />
                        <span className="access-actions-label">View</span>
                      </Button>
                      <Button aria-label={`Edit ${buildUserName(user)}`} size="sm" variant="secondary" onClick={() => openEditModal(user)}>
                        <PencilLine size={14} />
                        <span className="access-actions-label">Edit</span>
                      </Button>
                      <Button
                        aria-label={`${user.is_active ? "Deactivate" : "Activate"} ${buildUserName(user)}`}
                        size="sm"
                        variant={user.is_active ? "outline" : "secondary"}
                        onClick={() => handleStatusToggle(user)}
                      >
                        <Power size={14} />
                        <span className="access-actions-label">{user.is_active ? "Deactivate" : "Activate"}</span>
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMode === "create" ? "Add User" : "Edit User"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="First Name"
              value={form.first_name}
              onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
            />
            <Input
              label="Last Name"
              value={form.last_name}
              onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
            />
            <Input
              label="Username"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="Optional; auto-generated if empty"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            {editingMode === "create" && (
              <div className="md:col-span-2">
                <Input
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="At least 6 characters"
                />
              </div>
            )}
            {!editingMode && (
              <div className="md:col-span-2">
                <Input
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="At least 6 characters"
                />
              </div>
            )}
            <Select
              label="Role"
              value={form.role_id}
              onChange={(event) => setForm((current) => ({ ...current, role_id: event.target.value }))}
              options={roleOptions}
              placeholder="Select role"
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

          {formError && <p className="rounded-xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{formError}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editingMode === "create" ? "Create User" : "Save Changes"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} title="User Details" size="md">
        {selectedUser ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface)] text-lg font-semibold text-[var(--text)]">
                {buildUserName(selectedUser).slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[var(--text)]">{buildUserName(selectedUser)}</p>
                <p className="text-sm text-[var(--text-secondary)]">{selectedUser.role?.name || "Unassigned role"}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <p><span className="font-medium text-[var(--text)]">Email:</span> {selectedUser.email}</p>
              <p><span className="font-medium text-[var(--text)]">Username:</span> {selectedUser.username || "—"}</p>
              <p><span className="font-medium text-[var(--text)]">Status:</span> {selectedUser.is_active ? "Active" : "Inactive"}</p>
              <p><span className="font-medium text-[var(--text)]">Created:</span> {formatDate(selectedUser.created_at)}</p>
              <p><span className="font-medium text-[var(--text)]">Last activity:</span> {formatDate(selectedUser.updated_at || selectedUser.created_at)}</p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default UsersPage;
