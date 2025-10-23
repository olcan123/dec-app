import { z } from "zod";

const customerFormSchema = z.object({
  uidNumber: z.string().length(9, "UID Numarası zorunludur."),
  title: z.string().min(1, "Şirket unvanı zorunludur."),
  authorizedPerson: z.string().min(1, "Yetkili kişi zorunludur."),
  taxOffice: z.string().min(1, "Vergi dairesi zorunludur."),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

const customerFormInitialValues = {
  uidNumber: "",
  title: "",
  authorizedPerson: "",
  taxOffice: "",
  isActive: true,
  notes: "",
};

export { customerFormSchema, customerFormInitialValues };