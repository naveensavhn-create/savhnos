"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  name: string;
  code: string;
}

interface AttendanceRecord {
  id: string;
  clockInAt: string;
  clockOutAt: string | null;
  withinGeofence: boolean;
  distanceMeters: number | null;
  project: { name: string; code: string } | null;
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

export default function AttendancePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadHistory = () =>
    apiFetch<AttendanceRecord[]>("/attendance/me").then(setHistory).catch(() => {});

  useEffect(() => {
    apiFetch<Project[]>("/projects").then(setProjects).catch(() => {});
    loadHistory();
  }, []);

  const clockIn = async () => {
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const position = await getCurrentPosition();
      await apiFetch("/attendance/clock-in", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectId || undefined,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });
      setStatus("Clocked in successfully.");
      loadHistory();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const clockOut = async () => {
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const position = await getCurrentPosition();
      await apiFetch("/attendance/clock-out", {
        method: "POST",
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });
      setStatus("Clocked out successfully.");
      loadHistory();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Attendance</h1>

      <div className="rounded-xl border border-steel-200 bg-white p-6">
        <p className="mb-4 text-sm font-medium text-black">
          Clock in from a project site to trigger a geofence check. Leave the project unselected
          for office attendance.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="rounded-md border border-steel-300 px-3 py-2 text-black focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Office (no geofence)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={clockIn}
            disabled={busy}
            className="rounded-md bg-brand-700 px-4 py-2 font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            Clock in
          </button>
          <button
            onClick={clockOut}
            disabled={busy}
            className="rounded-md border border-steel-300 px-4 py-2 font-semibold text-black hover:bg-steel-100 disabled:opacity-60"
          >
            Clock out
          </button>
        </div>
        {status && (
          <p className="mt-3 rounded-md border border-brand-300 bg-brand-50 px-3 py-2 text-sm font-medium text-black">
            {status}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-md border border-alert-300 bg-alert-50 px-3 py-2 text-sm font-medium text-black">
            {error}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-steel-200">
        <table className="w-full text-sm">
          <thead className="bg-steel-100 text-left">
            <tr>
              <th className="px-4 py-3 font-bold">Clock in</th>
              <th className="px-4 py-3 font-bold">Clock out</th>
              <th className="px-4 py-3 font-bold">Project</th>
              <th className="px-4 py-3 font-bold">Geofence</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {history.map((a) => (
              <tr key={a.id} className="border-t border-steel-200">
                <td className="px-4 py-3">{new Date(a.clockInAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {a.clockOutAt ? new Date(a.clockOutAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">{a.project ? `${a.project.code} — ${a.project.name}` : "Office"}</td>
                <td className="px-4 py-3">
                  <Badge color={a.withinGeofence ? "blue" : "red"}>
                    {a.withinGeofence ? "Within geofence" : "Outside geofence"}
                    {a.distanceMeters != null ? ` (${Math.round(a.distanceMeters)}m)` : ""}
                  </Badge>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-steel-600">
                  No attendance records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
