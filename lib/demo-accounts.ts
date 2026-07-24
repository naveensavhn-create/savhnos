import { UserRole } from "@/lib/enums";

/**
 * Mirrors the accounts created by `prisma/seed.ts` — single source of truth
 * for the "Try a demo account" panel on the login page. Keep in sync with
 * the seed script if role emails ever change there.
 */
export const DEMO_PASSWORD = "Demo@12345";

export interface DemoAccount {
  role: UserRole;
  label: string;
  email: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: UserRole.OWNER, label: "Owner", email: "owner@savhnos.dev" },
  { role: UserRole.SUPER_ADMIN, label: "Super Admin", email: "admin@savhnos.dev" },
  { role: UserRole.HR, label: "HR", email: "hr@savhnos.dev" },
  { role: UserRole.ARCHITECT, label: "Architect", email: "architect@savhnos.dev" },
  { role: UserRole.PROJECT_ENGINEER, label: "Project Engineer", email: "projectengineer@savhnos.dev" },
  { role: UserRole.SITE_ENGINEER, label: "Site Engineer", email: "siteengineer@savhnos.dev" },
  { role: UserRole.INTERIOR_DESIGNER, label: "Interior Designer", email: "interiordesigner@savhnos.dev" },
  { role: UserRole.DRAFTING_ENGINEER, label: "Drafting Engineer", email: "draftingengineer@savhnos.dev" },
  { role: UserRole.ACCOUNTANT, label: "Accountant", email: "accountant@savhnos.dev" },
  { role: UserRole.QC_ENGINEER, label: "QC Engineer", email: "qcengineer@savhnos.dev" },
  { role: UserRole.EMPLOYEE, label: "Employee", email: "employee@savhnos.dev" },
  { role: UserRole.CLIENT, label: "Client", email: "client@savhnos.dev" },
];
