// Mirror of backend permissions - keep in sync!
export const PERMISSIONS = {
  ADD_ITEMS: "canAddItems",
  EDIT_ITEMS: "canEditItems",
  ADD_CATEGORY: "canAddCategory",
  EDIT_CATEGORY: "canEditCategory",

  MAKE_TRANSACTION: "canMakeTransaction",
  PAY_BILL_TRANSACTIONS: "canPayBillTransactions",

  APPROVE_NEW_GRN: "canApproveNewGrn",
  PAY_BILLED_GRN: "canPayBilledGrn",

  CHANGE_DEBT_STATUS: "canChangeDebtStatus",
  PAY_DEBT: "canPayDebt",

  EDIT_EXPENSES: "canEditExpenses",

  ACCESS_SETTINGS: "canAccessSettings",
  ACCESS_USER_MANAGEMENT: "canAccessUserManagement",
  ACCESS_CUSTOMER_MANAGEMENT: "canAccessCustomerManagement",
  ACCESS_SUPPLIER_MANAGEMENT: "canAccessSupplierManagement",

  SEE_REPORTS: "canSeeReports",
  ACCESS_MADENI_REPORT: "canAccessMadeniReport",
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// Human-readable labels for the permissions UI
export const PERMISSION_LABELS = {
  canAddItems: "Add Items",
  canEditItems: "Edit Items",
  canAddCategory: "Add Category",
  canEditCategory: "Edit Category",
  canMakeTransaction: "Make Transaction",
  canPayBillTransactions: "Pay Bill Transactions",
  canApproveNewGrn: "Approve New GRN",
  canPayBilledGrn: "Pay Billed GRN",
  canChangeDebtStatus: "Change Debt Status",
  canPayDebt: "Pay Debt",
  canEditExpenses: "Edit Expenses",
  canAccessSettings: "Access Settings",
  canAccessUserManagement: "Access User Management",
  canAccessCustomerManagement: "Access Customer Management",
  canAccessSupplierManagement: "Access Supplier Management",
  canSeeReports: "See Reports",
  canAccessMadeniReport: "Access Madeni Report",
};

export const ROLES = {
  Admin: {
    name: "Admin",
    permissions: ALL_PERMISSIONS,
  },
  Manager: {
    name: "Manager",
    permissions: [
      PERMISSIONS.ADD_ITEMS,
      PERMISSIONS.EDIT_ITEMS,
      PERMISSIONS.ADD_CATEGORY,
      PERMISSIONS.EDIT_CATEGORY,
      PERMISSIONS.ADJUST_STOCK,
      PERMISSIONS.MAKE_TRANSACTION,
      PERMISSIONS.PAY_BILL_TRANSACTIONS,
      PERMISSIONS.APPROVE_NEW_GRN,
      PERMISSIONS.PAY_BILLED_GRN,
      PERMISSIONS.CHANGE_DEBT_STATUS,
      PERMISSIONS.PAY_DEBT,
      PERMISSIONS.EDIT_EXPENSES,
      PERMISSIONS.ACCESS_CUSTOMER_MANAGEMENT,
      PERMISSIONS.ACCESS_SUPPLIER_MANAGEMENT,
      PERMISSIONS.SEE_REPORTS,
      PERMISSIONS.ACCESS_MADENI_REPORT,
    ],
  },
  Cashier: {
    name: "Cashier",
    permissions: [
      PERMISSIONS.MAKE_TRANSACTION,
      PERMISSIONS.PAY_BILL_TRANSACTIONS,
      PERMISSIONS.PAY_DEBT,
    ],
  },
  Accountant: {
    name: "Accountant",
    permissions: [
      PERMISSIONS.PAY_BILL_TRANSACTIONS,
      PERMISSIONS.PAY_BILLED_GRN,
      PERMISSIONS.CHANGE_DEBT_STATUS,
      PERMISSIONS.PAY_DEBT,
      PERMISSIONS.EDIT_EXPENSES,
      PERMISSIONS.SEE_REPORTS,
      PERMISSIONS.ACCESS_MADENI_REPORT,
    ],
  },
};



export const hasPermission = (user, permission) => {
  if (!user) return false;

  // New shape (preferred)
  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }

  // Legacy shape fallback (until all users are migrated)
  if (user.roles && typeof user.roles === "object") {
    // Map the new permission string back to the legacy boolean key
    const legacyKey = LEGACY_KEY[permission];
    return legacyKey ? !!user.roles[legacyKey] : false;
  }

  return false;
};

/**
 * Returns the user's role name, preferring the new field.
 */
export const getUserRole = (user) => {
  if (!user) return null;
  if (user.role) return user.role;
  // Legacy fallback — infer from roles object (approximate)
  if (user.roles?.canAccessUserManagement && user.roles?.canAccessSettings) {
    return "Admin";
  }
  if (user.roles?.canSeeReports) return "Manager";
  if (user.roles?.canEditExpenses) return "Accountant";
  return "Cashier";
};

// New permission string → legacy boolean key
const LEGACY_KEY = {
  [PERMISSIONS.ADD_ITEMS]: "canAddItems",
  [PERMISSIONS.EDIT_ITEMS]: "canEditItems",
  [PERMISSIONS.ADD_CATEGORY]: "canAddCategory",
  [PERMISSIONS.EDIT_CATEGORY]: "canEditCategory",
  [PERMISSIONS.ADJUST_STOCK]: "canAdjustStock",
  [PERMISSIONS.MAKE_TRANSACTION]: "canMakeTransaction",
  [PERMISSIONS.PAY_BILL_TRANSACTIONS]: "canPayBillTransaction",
  [PERMISSIONS.APPROVE_NEW_GRN]: "canApproveNewGrn",
  [PERMISSIONS.PAY_BILLED_GRN]: "canPayBilledGrn",
  [PERMISSIONS.CHANGE_DEBT_STATUS]: "canChangeDebtStatus",
  [PERMISSIONS.PAY_DEBT]: "canPayDebt",
  [PERMISSIONS.EDIT_EXPENSES]: "canEditExpenses",
  [PERMISSIONS.ACCESS_SETTINGS]: "canAccessSettings",
  [PERMISSIONS.ACCESS_USER_MANAGEMENT]: "canAccessUserManagement",
  [PERMISSIONS.ACCESS_CUSTOMER_MANAGEMENT]: "canAccessCustomerManagement",
  [PERMISSIONS.ACCESS_SUPPLIER_MANAGEMENT]: "canAccessSupplierManagement",
  [PERMISSIONS.SEE_REPORTS]: "canSeeReports",
  [PERMISSIONS.ACCESS_MADENI_REPORT]: "canAccessMadeniReport",
};

export const ROLE_NAMES = Object.keys(ROLES);