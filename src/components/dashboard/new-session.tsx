import { PlusCircleIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function NewSession() {

    const handleCreateSession = () => { }

    return (
        <div onClick={handleCreateSession} className="w-3/5 h-64 border rounded-lg flex flex-col items-center justify-center bg-linear-to-br from-emerald-300/40 to-emerald-200/10 border-emerald-300/60 hover:from-emerald-300/60 hover:to-emerald-200/30 transition-colors cursor-pointer duration-300 group">
            <PlusCircleIcon className="w-8 h-8 text-emerald-900" />
            <Button variant="link" className="mt-4 text-base text-emerald-900 font-display group-hover:underline pb-2 transition duration-300">Start New Session</Button>
        </div>
    )
}