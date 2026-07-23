"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { PipelineStage } from "@savhnos/shared";

interface Client {
  id: string;
  name: string;
  organization: string | null;
  email: string | null;
  phone: string | null;
  pipelineStage: string;
  estimatedValue: string | null;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", organization: "", email: "", phone: "" });

  const load = () => apiFetch<Client[]>("/clients").then(setClients).catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/clients", { method: "POST", body: JSON.stringify(form) });
      setShowForm(false);
      setForm({ name: "", organization: "", email: "", phone: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create client");
    }
  };

  const updateStage = async (id: string, pipelineStage: PipelineStage) => {
    await apiFetch(`/clients/${id}`, { method: "PATCH", body: JSON.stringify({ pipelineStage }) });
    load();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients &amp; Leads</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {showForm ? "Cancel" : "New client"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            placeholder="Organization"
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="col-span-2 rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
          >
            Create client
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Pipeline stage</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.organization ?? "—"}</td>
                <td className="px-4 py-3">{c.email ?? c.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <select
                    value={c.pipelineStage}
                    onChange={(e) => updateStage(c.id, e.target.value as PipelineStage)}
                    className="rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                  >
                    {Object.values(PipelineStage).map((stage) => (
                      <option key={stage} value={stage}>
                        {stage.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
