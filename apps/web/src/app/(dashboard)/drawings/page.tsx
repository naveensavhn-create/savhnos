"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  code: string;
}

interface DrawingRevision {
  id: string;
  versionLabel: string;
  fileUrl: string;
  status: string;
  createdAt: string;
}

interface Drawing {
  id: string;
  title: string;
  discipline: string | null;
  revisions: DrawingRevision[];
}

export default function DrawingsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newDrawing, setNewDrawing] = useState({ title: "", discipline: "" });
  const [revisionInputs, setRevisionInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<Project[]>("/projects").then((ps) => {
      setProjects(ps);
      if (ps.length > 0) setProjectId(ps[0].id);
    });
  }, []);

  const loadDrawings = (pid: string) =>
    apiFetch<Drawing[]>(`/drawings?projectId=${pid}`).then(setDrawings).catch((err) => setError(err.message));

  useEffect(() => {
    if (projectId) loadDrawings(projectId);
  }, [projectId]);

  const createDrawing = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/drawings", {
        method: "POST",
        body: JSON.stringify({ projectId, title: newDrawing.title, discipline: newDrawing.discipline || undefined }),
      });
      setNewDrawing({ title: "", discipline: "" });
      loadDrawings(projectId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create drawing");
    }
  };

  const uploadRevision = async (drawingId: string) => {
    const fileUrl = revisionInputs[drawingId];
    if (!fileUrl) return;
    const versionLabel = `Rev-${new Date().toISOString().slice(0, 10)}`;
    try {
      await apiFetch(`/drawings/${drawingId}/revisions`, {
        method: "POST",
        body: JSON.stringify({ versionLabel, fileUrl }),
      });
      setRevisionInputs((prev) => ({ ...prev, [drawingId]: "" }));
      loadDrawings(projectId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload revision");
    }
  };

  const review = async (revisionId: string, decision: "APPROVED" | "REJECTED") => {
    try {
      await apiFetch(`/drawings/revisions/${revisionId}/review`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
      loadDrawings(projectId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to review revision");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Drawings</h1>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} — {p.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {projectId && (
        <form
          onSubmit={createDrawing}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Drawing title</label>
            <input
              required
              value={newDrawing.title}
              onChange={(e) => setNewDrawing({ ...newDrawing, title: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Discipline</label>
            <input
              placeholder="Architecture / Structural / MEP"
              value={newDrawing.discipline}
              onChange={(e) => setNewDrawing({ ...newDrawing, discipline: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
          >
            Add drawing
          </button>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {drawings.map((d) => (
          <div
            key={d.id}
            className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{d.title}</div>
                {d.discipline && <div className="text-sm text-slate-500">{d.discipline}</div>}
              </div>
              <div className="flex gap-2">
                <input
                  placeholder="File URL for new revision"
                  value={revisionInputs[d.id] ?? ""}
                  onChange={(e) => setRevisionInputs((prev) => ({ ...prev, [d.id]: e.target.value }))}
                  className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  onClick={() => uploadRevision(d.id)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Upload revision
                </button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-1 pr-4">Version</th>
                  <th className="py-1 pr-4">Status</th>
                  <th className="py-1 pr-4">Uploaded</th>
                  <th className="py-1 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {d.revisions.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-2 pr-4">{r.versionLabel}</td>
                    <td className="py-2 pr-4">{r.status}</td>
                    <td className="py-2 pr-4">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">
                      {r.status === "IN_REVIEW" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => review(r.id, "APPROVED")}
                            className="text-green-600 hover:underline"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => review(r.id, "REJECTED")}
                            className="text-red-600 hover:underline"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {d.revisions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-2 text-slate-400">
                      No revisions uploaded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
        {drawings.length === 0 && projectId && (
          <p className="text-slate-500">No drawings for this project yet.</p>
        )}
      </div>
    </div>
  );
}
