import { EditIcon } from "lucide-react";
import { Button } from "../ui/button";
import type { ListInfoType } from "@/types/prescription";
import { Dialog } from "../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import Editor from "./editor";

interface ListInfoProps {
    title: string;
    info: ListInfoType[];
}

export default function ListInfo({ title, info }: ListInfoProps) {

    return (
        <div className="">
            <div className="flex items-center mb-1 gap-2">
                <h3 className="font-semibold text-md text-emerald-600">{title}</h3>

                <Dialog>
                    <DialogTrigger>
                        <Button variant="ghost" size="icon" className="bg-emerald-50 hover:bg-emerald-500/20">
                            <EditIcon className="text-emerald-600" />
                        </Button>
                    </DialogTrigger>

                    <Editor />
                </Dialog>
            </div>
            <ul className="ml-8 list-disc">
                {info.map((item, index) => (
                    <InfoItem key={index} item={item} />
                ))}
            </ul>
        </div>
    )
}

const InfoItem = ({ item }: { item: ListInfoType }) => {
    const hasDuration = "duration" in item && item.duration;
    const hasNotes = "notes" in item && item.notes;

    return (
        <li className="ml-2">
            <span className="text-slate-700">{item.name}</span>

            {hasDuration && (
                <span className="ml-2 text-sm italic text-slate-500">
                    {item.duration}
                </span>
            )}

            {hasNotes && (
                <p className="text-sm text-slate-600">{item.notes}</p>
            )}
        </li>
    );
};