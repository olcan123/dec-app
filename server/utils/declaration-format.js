const declarationFormDefaults = {
  reminderDays: "7",
  totalAmount: "0.00",
  paidAmount: "0.00",
  lateFee: "0.00",
  status: "Pending",
  priority: "Medium",
  completionDate: "",
  completedBy: "",
};

const formatDateForForm = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toISOString().slice(0, 10);
};

const formatDecimalForForm = (value, fallbackKey) => {
  const fallback = declarationFormDefaults[fallbackKey] ?? "0.00";

  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return fallback;
  }

  return numeric.toFixed(2);
};

const formatDeclarationForForm = (record) => {
  if (!record) {
    return null;
  }

  return {
    customerId: String(record.customerId ?? ""),
    typeId: String(record.typeId ?? ""),
    periodName: record.periodName ?? "",
    dueDate: formatDateForForm(record.dueDate),
    reminderDays:
      record.reminderDays === null || record.reminderDays === undefined
        ? declarationFormDefaults.reminderDays
        : String(record.reminderDays),
    totalAmount: formatDecimalForForm(record.totalAmount, "totalAmount"),
    paidAmount: formatDecimalForForm(record.paidAmount, "paidAmount"),
    lateFee: formatDecimalForForm(record.lateFee, "lateFee"),
    status: record.status ?? declarationFormDefaults.status,
    priority: record.priority ?? declarationFormDefaults.priority,
    completionDate: formatDateForForm(record.completionDate),
    completedBy: record.completedBy ?? declarationFormDefaults.completedBy,
  };
};

export {
  declarationFormDefaults,
  formatDateForForm,
  formatDecimalForForm,
  formatDeclarationForForm,
};
