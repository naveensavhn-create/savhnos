"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { UserRole } from "@savhnos/shared";

interface Employee {
  id: string;
  employeeCode: string;
  designation: string | null;
  department: string | null;
  status: string;
  user: { name: string; email: string; role: string };
}

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
        <h1 className="text-2xl font-semibold">Employees</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {showForm ? "Cancel" : "Add employee"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            required
            type="password"
            minLength={8}
            placeholder="Temporary password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
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
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            placeholder="Designation"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="col-span-2 rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
          >
            Create employee
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-3 font-mono">{emp.employeeCode}</td>
                <td className="px-4 py-3">{emp.user.name}</td>
                <td className="px-4 py-3">{emp.user.role.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">{emp.designation ?? "—"}</td>
                <td className="px-4 py-3">{emp.status}</td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
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
