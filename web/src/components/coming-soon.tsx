import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  needs,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  needs: string[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <Badge variant="warning">Roadmap</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
            <Icon className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold">Not built yet — by design</p>
            <p className="max-w-md text-sm text-muted-foreground">
              This module needs backend work (API endpoints, data model, and often a third-party
              integration) before it can show real data. Rather than fake it, here&apos;s what it
              needs:
            </p>
          </div>
          <ul className="flex flex-wrap justify-center gap-2">
            {needs.map((n) => (
              <li key={n} className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                {n}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
