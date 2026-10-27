import { createFileRoute } from "@tanstack/react-router";
import TryOlivePage from "@/components/try-olive/try-olive-page";

export const Route = createFileRoute("/try")({ component: TryOlivePage });
