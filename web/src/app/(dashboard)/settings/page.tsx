"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, MapPinned, Users, Plus, ShieldCheck } from "lucide-react";
import { UserRole } from "@savhnos/shared";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input, NativeSelect } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { formatStatusLabel } from "@/lib/status";

interface Company {
  name: string;
  gstNumber: string | null;
  logoUrl: string | null;
}
interface Branch {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
}
interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Workspace, branches and team — signed in as {user?.email}.</p>
      </div>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <CompanyTab />
        </TabsContent>
        <TabsContent value="branches">
          <BranchesTab />
        </TabsContent>
        <TabsContent value="team">
          <TeamTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CompanyTab() {
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    apiFetch<Company>("/company/me").then(setCompany).catch(() => {});
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Company profile
        </CardTitle>
        <CardDescription>Fetched live from your workspace API.</CardDescription>
      </CardHeader>
      <CardContent>
        {!company ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Name</p>
              <p className="text-sm font-semibold">{company.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">GST number</p>
              <p className="text-sm font-semibold">{company.gstNumber ?? "Not set"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BranchesTab() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", address: "", city: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch<Branch[]>("/company/branches")
      .then(setBranches)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async () => {
    if (!form.name) return;
    setSubmitting(true);
    try {
      await apiFetch("/company/branches", { method: "POST", body: JSON.stringify(form) });
      toast.success("Branch added");
      setForm({ name: "", address: "", city: "" });
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add branch");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="h-4 w-4" /> Branches
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : branches.length === 0 ? (
            <EmptyState icon={MapPinned} title="No branches yet" className="py-8" />
          ) : (
            <ul className="divide-y divide-border">
              {branches.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{[b.address, b.city].filter(Boolean).join(", ") || "No address"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add branch</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          <Input placeholder="Branch name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Button onClick={submit} loading={submitting} disabled={!form.name} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add branch
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TeamTab() {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: UserRole.EMPLOYEE });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch<CompanyUser[]>("/users")
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async () => {
    if (!form.name || !form.email || !form.password) return;
    setSubmitting(true);
    try {
      await apiFetch("/users", { method: "POST", body: JSON.stringify(form) });
      toast.success("User invited");
      setForm({ name: "", email: "", password: "", role: UserRole.EMPLOYEE });
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to invite user (requires OWNER/SUPER_ADMIN/HR)");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Team members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <ul className="divide-y divide-border">
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-3 py-2.5">
                  <Avatar name={u.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant="outline">{formatStatusLabel(u.role)}</Badge>
                  {!u.isActive && <Badge variant="danger">Inactive</Badge>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Invite user
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input
            type="password"
            placeholder="Temporary password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <NativeSelect value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
            {Object.values(UserRole).map((r) => (
              <option key={r} value={r}>
                {formatStatusLabel(r)}
              </option>
            ))}
          </NativeSelect>
          <Button onClick={submit} loading={submitting} disabled={!form.name || !form.email || !form.password} className="gap-1.5">
            <Plus className="h-4 w-4" /> Invite
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
