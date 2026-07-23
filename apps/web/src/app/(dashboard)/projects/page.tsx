"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
  address: string | null;
  geofence: { latitude: number; longitude: number; radiusMeters: number } | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    latitude: "",
    longitude: "",
    radiusMeters: "150",
  });

  const load = () => apiFetch<Project[]>("/projects").then(setProjects).catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          code: form.code,
          address: form.address || undefined,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
          radiusMeters: form.radiusMeters ? Number(form.radiusMeters) : undefined,
        }),
      });
      setShowForm(false);
      setForm({ name: "", code: "", address: "", latitude: "", longitude: "", radiusMeters: "150" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create project");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {showForm ? "Cancel" : "New project"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <input
            required
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            required
            placeholder="Project code (e.g. SKY-002)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            placeholder="Site address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="col-span-2 rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            placeholder="Geofence latitude"
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            placeholder="Geofence longitude"
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            placeholder="Radius (meters)"
            value={form.radiusMeters}
            onChange={(e) => setForm({ ...form, radiusMeters: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
          {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="col-span-2 rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
          >
            Create project
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Geofence</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-3 font-mono">{p.code}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">
                  {p.geofence
                    ? `${p.geofence.latitude.toFixed(4)}, ${p.geofence.longitude.toFixed(4)} (${p.geofence.radiusMeters}m)`
                    : "Not set"}
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No projects yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
