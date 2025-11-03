import { Outlet } from "react-router";

export default function RootLayout() {
    return (
        <div className="w-full min-h-screen font-sans">
            <Outlet />
        </div>
    )
}