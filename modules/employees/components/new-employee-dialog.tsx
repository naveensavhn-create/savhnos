"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { UserRole } from "@/lib/enums";
import { STAFF_ROLES } from "@/modules/employees/validators/employee.validators";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatStatusLabel } from "@/lib/status";

export function NewEmployeeDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    employeeCode: string;
    designation: string;
    department: string;
  }>({
    name: "",
    email: "",
    password: "",
    role: UserRole.SITE_ENGINEER,
    employeeCode: "",
    designation: "",
    department: "",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/employees", { method: "POST", body: JSON.stringify(form) });
      toast.success("Employee added");
      setForm({ ...form, name: "", email: "", password: "", employeeCode: "", designation: "", department: "" });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create employee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
          <Input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2" />
          <Input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="col-span-2" />
          <Input
            required
            type="password"
            minLength={8}
            placeholder="Temporary password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="col-span-2"
          />
          <NativeSelect value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="col-span-2">
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {formatStatusLabel(role)}
              </option>
            ))}
          </NativeSelect>
          <Input
            required
            placeholder="Employee code"
            value={form.employeeCode}
            onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
            className="col-span-2"
          />
          <Input placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <Input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          {error && (
            <p className="col-span-2 rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:border-danger/20 dark:bg-danger/10 dark:text-danger">
              {error}
            </p>
          )}
          <Button type="submit" loading={submitting} className="col-span-2 gap-1.5">
            <UserPlus className="h-4 w-4" /> Add employee
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
