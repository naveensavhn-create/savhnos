"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { UserRole } from "@savhnos/shared";
import { Badge } from "@/components/ui/badge";
import { employmentStatusColor, formatStatusLabel } from "@/lib/status";

interface Employee {
  id: string;
  employeeCode: string;
  designation: string | null;
  department: string | null;
  status: string;
  user: { name: string; email: string; role: string };
}

const inputClass =
  "rounded-md border border-steel-300 px-3 py-2 text-black focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: UserRole.SITE_ENGINEER,
    employeeCode: "",
    designation: "",
    department: "",
  });

  const load = () =>
    apiFetch<Employee[]>("/employees").then(setEmployees).catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/employees", { method: "POST", body: JSON.stringify(form) });
      setShowForm(false);
      setForm({ ...form, name: "", email: "", password: "", employeeCode: "", designation: "", department: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create employee");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          {showForm ? "Cancel" : "Add employee"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-2 gap-4 rounded-xl border border-steel-200 bg-white p-6"
        >
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
          <input
            required
            type="password"
            minLength={8}
            placeholder="Temporary password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            className={inputClass}
          >
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {role.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Employee code (e.g. EMP-010)"
            value={form.employeeCode}
            onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Designation"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className={inputClass}
          />
          {error && (
            <p className="col-span-2 rounded-md border border-alert-300 bg-alert-50 px-3 py-2 text-sm font-medium text-black">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="col-span-2 rounded-md bg-safety-500 px-4 py-2 font-semibold text-black hover:bg-safety-600"
          >
            Create employee
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-steel-200">
        <table className="w-full text-sm">
          <thead className="bg-steel-100 text-left">
            <tr>
              <th className="px-4 py-3 font-bold">Code</th>
              <th className="px-4 py-3 font-bold">Name</th>
              <th className="px-4 py-3 font-bold">Role</th>
              <th className="px-4 py-3 font-bold">Designation</th>
              <th className="px-4 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t border-steel-200">
                <td className="px-4 py-3 font-mono font-semibold">{emp.employeeCode}</td>
                <td className="px-4 py-3 font-medium">{emp.user.name}</td>
                <td className="px-4 py-3">{emp.user.role.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">{emp.designation ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge color={employmentStatusColor(emp.status)}>{formatStatusLabel(emp.status)}</Badge>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-steel-600">
                  No employees yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
