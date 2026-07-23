import { Sparkles } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function AiAssistantPage() {
  return (
    <ComingSoon
      icon={Sparkles}
      title="AI Assistant"
      description="Ask questions about your projects, generate BOQs and site reports, summarize meetings, and predict delays."
      needs={["LLM provider integration", "Retrieval over project data", "Prompt-safe write actions"]}
    />
  );
}
