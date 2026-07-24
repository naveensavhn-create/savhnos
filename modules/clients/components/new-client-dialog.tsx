"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Handshake } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function NewClientDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", organization: "", email: "", phone: "", estimatedValue: "" });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/clients", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined,
        }),
      });
      toast.success("Client added");
      setForm({ name: "", organization: "", email: "", phone: "", estimatedValue: "" });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create client");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New client</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
          <Input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2" />
          <Input placeholder="Organization" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} className="col-span-2" />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input
            placeholder="Estimated value (₹)"
            value={form.estimatedValue}
            onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
            className="col-span-2"
          />
          {error && (
            <p className="col-span-2 rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:border-danger/20 dark:bg-danger/10 dark:text-danger">
              {error}
            </p>
          )}
          <Button type="submit" loading={submitting} className="col-span-2 gap-1.5">
            <Handshake className="h-4 w-4" /> Add client
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
