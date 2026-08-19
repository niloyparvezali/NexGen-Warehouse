import {
  LayoutDashboard,
  Boxes,
  Tags,
  Ruler,
  Package,
  Users,
  Truck,
  ShoppingCart,
  Receipt,
  Warehouse,
  Wallet,
  BarChart3,
  Settings,
  RotateCcw,
  Shield,
  UserCog,
} from "lucide-react";

const navigation = [
  {
    section: "Overview",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        color: "text-sky-400",
      },
    ],
  },
  {
    section: "Transactions",
    items: [
      {
        title: "POS / Sales",
        path: "/sales",
        icon: Receipt,
        color: "text-emerald-400",
      },
      {
        title: "Purchase",
        path: "/purchase",
        icon: ShoppingCart,
        color: "text-orange-400",
      },
      {
        title: "Expenses",
        path: "/expense",
        icon: Wallet,
        color: "text-violet-400",
      },
      {
        title: "Easy Return",
        path: "/easy-return",
        icon: RotateCcw,
        color: "text-rose-400",
      },
    ],
  },
  {
    section: "Inventory",
    items: [
      {
        title: "Store",
        path: "/inventory",
        icon: Warehouse,
        color: "text-cyan-400",
      },
      {
        title: "Inventory",
        icon: Boxes,
        color: "text-green-400",
        children: [
          {
            title: "Categories",
            path: "/category",
            icon: Tags,
            color: "text-sky-400",
          },
          {
            title: "Brands",
            path: "/brand",
            icon: Tags,
            color: "text-fuchsia-400",
          },
          {
            title: "Units",
            path: "/unit",
            icon: Ruler,
            color: "text-amber-400",
          },
          {
            title: "Products",
            path: "/product",
            icon: Package,
            color: "text-emerald-400",
          },
        ],
      },
    ],
  },
  {
    section: "Customers",
    items: [
      {
        title: "Customers",
        icon: Users,
        color: "text-blue-400",
        children: [
          {
            title: "Customers",
            path: "/customer",
            icon: Users,
            color: "text-blue-400",
          },
          {
            title: "Customer Payments",
            path: "/customer-payments",
            icon: Wallet,
            color: "text-teal-400",
          },
          {
            title: "Customer Ledger",
            path: "/customer-ledger",
            icon: Receipt,
            color: "text-indigo-400",
          },
        ],
      },
    ],
  },
  {
    section: "Suppliers",
    items: [
      {
        title: "Suppliers",
        icon: Truck,
        color: "text-amber-400",
        children: [
          {
            title: "Suppliers",
            path: "/supplier",
            icon: Truck,
            color: "text-amber-400",
          },
          {
            title: "Supplier Payments",
            path: "/supplier-payments",
            icon: Wallet,
            color: "text-orange-400",
          },
          {
            title: "Supplier Ledger",
            path: "/supplier-ledger",
            icon: Receipt,
            color: "text-yellow-400",
          },
        ],
      },
    ],
  },
  {
    section: "Analytics",
    items: [
      {
        title: "Reports",
        path: "/reports",
        icon: BarChart3,
        color: "text-violet-400",
      },
    ],
  },
  {
    section: "System",
    items: [
      {
        title: "User Management",
        icon: UserCog,
        color: "text-indigo-400",
        children: [
          {
            title: "Users",
            path: "/user-management/users",
            icon: Users,
            color: "text-sky-400",
          },
          {
            title: "Roles & Permissions",
            path: "/user-management/roles",
            icon: Shield,
            color: "text-purple-400",
          },
        ],
      },
      {
        title: "Settings",
        path: "/settings",
        icon: Settings,
        color: "text-slate-300",
      },
    ],
  },
];

export default navigation;


