// Shared minimal footer for every layout. `flex-none` keeps it sticky to the bottom of a
// flex-column page (sits at the viewport bottom when content is short, flows below when long).
export default function AppFooter() {
    return (
        <footer className="flex h-16 flex-none items-center justify-center px-4 text-center text-xs text-slate-400 print:hidden">
            &copy; {new Date().getFullYear()} Olive. All rights reserved.
        </footer>
    );
}
