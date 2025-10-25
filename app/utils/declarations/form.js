import { z } from "zod";

const periodRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
const decimalRegex = /^\d+(\.\d{1,2})?$/;

const declarationFormSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi zorunludur."),
  typeId: z.string().min(1, "Beyanname türü zorunludur."),
  periodName: z
    .string()
    .regex(periodRegex, "Dönem MM/YYYY formatında olmalıdır."),
  dueDate: z.string().min(1, "Son tarih zorunludur."),
  reminderDays: z
    .string()
    .min(1, "Hatırlatma günü zorunludur.")
    .refine((value) => /^\d+$/.test(value), "Lütfen geçerli bir sayı girin."),
  totalAmount: z
    .string()
    .optional()
    .refine(
      (value) => !value || decimalRegex.test(value),
      "Geçerli bir tutar girin."
    ),
  paidAmount: z
    .string()
    .min(1, "Ödenen tutar zorunludur.")
    .refine((value) => decimalRegex.test(value), "Geçerli bir tutar girin."),
  lateFee: z
    .string()
    .optional()
    .refine(
      (value) => !value || decimalRegex.test(value),
      "Geçerli bir tutar girin."
    ),
  status: z.string().min(1, "Durum zorunludur."),
  priority: z.string().min(1, "Öncelik zorunludur."),
  completionDate: z.string().optional(),
  completedBy: z.string().optional(),
 notes: z.array(
      z.object({
        id: z.union([z.number(), z.undefined()]), // Önceki düzenlememiz
        title: z.string().min(1, 'Başlık alanı zorunludur'),
        content: z.string().min(1, 'İçerik alanı zorunludur'),
        tags: z.string().optional(),
      })
    ).optional(),
});

const declarationFormInitialValues = {
  customerId: "",
  typeId: "",
  periodName: "",
  dueDate: "",
  reminderDays: "7",
  totalAmount: "0.00",
  paidAmount: "0.00",
  lateFee: "0.00",
  status: "Pending",
  priority: "Medium",
  completionDate: "",
  completedBy: "Admin",
  notes: [],
};

// Status options cover the dropdown on both create/update forms for consistent labels and values.
const statusOptions = [
  { label: "Beklemede", value: "Pending" },
  { label: "Devam Ediyor", value: "InProgress" },
  { label: "Tamamlandı", value: "Completed" },
  { label: "Gecikmiş", value: "Overdue" },
];

// Priority options mirror backend enum values while showing Turkish labels to the user.
const priorityOptions = [
  { label: "Düşük", value: "Low" },
  { label: "Orta", value: "Medium" },
  { label: "Yüksek", value: "High" },
  { label: "Acil", value: "Urgent" },
];

export {
  declarationFormSchema,
  declarationFormInitialValues,
  statusOptions,
  priorityOptions,
};
