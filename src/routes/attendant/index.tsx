import { createFileRoute } from "@tanstack/react-router";
import AttendantHome from "@/components/attendant/attendant-home";

export const Route = createFileRoute("/attendant/")({
    component: AttendantHome,
});
