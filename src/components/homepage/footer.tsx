export default function HomeFooter() {
    return (
        <footer className="container">
            <p className="text-center text-slate-600 text-sm my-4">
                &copy; {new Date().getFullYear()} Olive AI. All rights reserved.
            </p>
        </footer>
    )
}