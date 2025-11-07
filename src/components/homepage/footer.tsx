export default function HomeFooter() {
    return (
        <footer className="container py-4">
            <p className="text-center text-slate-600 text-sm">
                &copy; {new Date().getFullYear()} Olive AI. All rights reserved.
            </p>
        </footer>
    )
}