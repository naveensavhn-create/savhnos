"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { FolderKanban, Users, Handshake, Search, ArrowRight } from "lucide-react";
import { useCommandPalette } from "./command-palette-context";
import { ALL_NAV_ITEMS } from "@/lib/nav";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";

interface EntityResults {
  projects: { id: string; name: string; code: string }[];
  employees: { id: string; employeeCode: string; user: { name: string } }[];
  clients: { id: string; name: string; organization: string | null }[];
}

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [entities, setEntities] = useState<EntityResults | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open || entities) return;
    Promise.all([
      apiFetch<EntityResults["projects"]>("/projects").catch(() => []),
      apiFetch<EntityResults["employees"]>("/employees").catch(() => []),
      apiFetch<EntityResults["clients"]>("/clients").catch(() => []),
    ]).then(([projects, employees, clients]) => setEntities({ projects, employees, clients }));
  }, [open, entities]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-foreground/20 px-4 pt-[15vh] backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
      <Command
        shouldFilter
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-popover shadow-popover animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search projects, employees, clients, pages…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
            ESC
          </kbd>
        </div>
        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          <Command.Group heading="Pages" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground/70">
            {ALL_NAV_ITEMS.map((item) => (
              <Command.Item
                key={item.href}
                value={`page ${item.label}`}
                onSelect={() => go(item.href)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-foreground",
                  "data-[selected=true]:bg-accent"
                )}
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{item.label}</span>
                {item.shortcut && <span className="text-xs text-muted-foreground">{item.shortcut}</span>}
              </Command.Item>
            ))}
          </Command.Group>

          {entities && entities.projects.length > 0 && (
            <Command.Group heading="Projects" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground/70">
              {entities.projects.map((p) => (
                <Command.Item
                  key={p.id}
                  value={`project ${p.name} ${p.code}`}
                  onSelect={() => go(`/projects/${p.id}`)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-accent"
                >
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{p.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{p.code}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {entities && entities.employees.length > 0 && (
            <Command.Group heading="Employees" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground/70">
              {entities.employees.map((e) => (
                <Command.Item
                  key={e.id}
                  value={`employee ${e.user.name} ${e.employeeCode}`}
                  onSelect={() => go(`/employees`)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-accent"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{e.user.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{e.employeeCode}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {entities && entities.clients.length > 0 && (
            <Command.Group heading="Clients" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground/70">
              {entities.clients.map((c) => (
                <Command.Item
                  key={c.id}
                  value={`client ${c.name} ${c.organization ?? ""}`}
                  onSelect={() => go(`/clients`)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-accent"
                >
                  <Handshake className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{c.name}</span>
                  {c.organization && <span className="text-xs text-muted-foreground">{c.organization}</span>}
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
