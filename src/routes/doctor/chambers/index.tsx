import { createFileRoute } from "@tanstack/react-router";
import ChambersManager from "@/components/dashboard/chambers/chambers-manager";

export const Route = createFileRoute("/doctor/chambers/")({
    component: ChambersManager,
});
