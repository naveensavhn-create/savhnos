"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { formatStatusLabel, projectStatusColor } from "@/lib/status";

interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
  address: string | null;
  geofence: { latitude: number; longitude: number; radiusMeters: number } | null;
}

const inputClass =
  "rounded-md border border-steel-300 px-3 py-2 text-black focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

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
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          {showForm ? "Cancel" : "New project"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-2 gap-4 rounded-xl border border-steel-200 bg-white p-6"
        >
          <input
            required
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
          <input
            required
            placeholder="Project code (e.g. SKY-002)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Site address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={`col-span-2 ${inputClass}`}
          />
          <input
            placeholder="Geofence latitude"
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Geofence longitude"
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Radius (meters)"
            value={form.radiusMeters}
            onChange={(e) => setForm({ ...form, radiusMeters: e.target.value })}
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
            Create project
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-steel-200">
        <table className="w-full text-sm">
          <thead className="bg-steel-100 text-left">
            <tr>
              <th className="px-4 py-3 font-bold">Code</th>
              <th className="px-4 py-3 font-bold">Name</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Geofence</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-steel-200">
                <td className="px-4 py-3 font-mono font-semibold">{p.code}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">
                  <Badge color={projectStatusColor(p.status)}>{formatStatusLabel(p.status)}</Badge>
                </td>
                <td className="px-4 py-3">
                  {p.geofence
                    ? `${p.geofence.latitude.toFixed(4)}, ${p.geofence.longitude.toFixed(4)} (${p.geofence.radiusMeters}m)`
                    : "Not set"}
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-steel-600">
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
