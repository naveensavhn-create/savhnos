"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api";

export interface PendingRevision {
  id: string;
  versionLabel: string;
  fileUrl: string;
  createdAt: string;
  drawingTitle: string;
  discipline: string | null;
  projectId: string;
  projectName: string;
  projectCode: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface Drawing {
  id: string;
  title: string;
  discipline: string | null;
  revisions: { id: string; versionLabel: string; fileUrl: string; status: string; createdAt: string }[];
}

export function usePendingApprovals() {
  const [revisions, setRevisions] = useState<PendingRevision[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    apiFetch<Project[]>("/projects")
      .then(async (projects) => {
        const perProject = await Promise.all(
          projects.map(async (project) => {
            const drawings = await apiFetch<Drawing[]>(`/drawings?projectId=${project.id}`).catch(() => []);
            return drawings.flatMap((d) =>
              d.revisions
                .filter((r) => r.status === "IN_REVIEW")
                .map((r) => ({
                  id: r.id,
                  versionLabel: r.versionLabel,
                  fileUrl: r.fileUrl,
                  createdAt: r.createdAt,
                  drawingTitle: d.title,
                  discipline: d.discipline,
                  projectId: project.id,
                  projectName: project.name,
                  projectCode: project.code,
                }))
            );
          })
        );
        setRevisions(perProject.flat());
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  return { revisions, loading, error, reload };
}
