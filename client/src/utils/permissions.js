export const normalizePermissions = (permissions = {}) => {
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) {
    return {};
  }

  return Object.entries(permissions).reduce((acc, [key, value]) => {
    const normalizedKey = String(key).trim().toLowerCase().replace(/[-\s]+/g, "_");
    const actions = Array.isArray(value)
      ? value.map((action) => String(action).trim().toLowerCase())
      : [];

    acc[normalizedKey] = actions.filter(Boolean);
    return acc;
  }, {});
};

export const hasModulePermission = (user, moduleName, action = "view") => {
  if (!user) return false;

  const roleName = String(user.role || "").trim();
  if (roleName === "Super Admin" || roleName === "Administrator") {
    return true;
  }

  const permissions = {
    ...normalizePermissions(user.permissions),
    ...normalizePermissions(user.rolePermissions),
  };

  const normalizedModule = String(moduleName || "").trim().toLowerCase().replace(/[-\s]+/g, "_");
  const normalizedAction = String(action || "view").trim().toLowerCase();

  const modulePermissions = permissions[normalizedModule] || [];
  return modulePermissions.includes(normalizedAction) || modulePermissions.includes("*");
};
