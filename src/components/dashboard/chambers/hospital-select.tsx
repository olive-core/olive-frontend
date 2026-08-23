import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createHospital, listHospitals } from "@/lib/attendant-queue";
import { indexHospitals, rankHospitals } from "@/lib/hospital-search";
import type { Hospital } from "@/types/attendant-queue";
import { handleError } from "@/lib/utils";

interface HospitalSelectProps {
    selected: Hospital | null;
    onSelect: (hospital: Hospital | null) => void;
}

export default function HospitalSelect({ selected, onSelect }: HospitalSelectProps) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Full list fetched once, ranked locally as the user types — same
    // mechanism as the medicine search.
    const { data: hospitals = [] } = useQuery({
        queryKey: ["hospitals"],
        queryFn: listHospitals,
        staleTime: Infinity,
    });
    const index = useMemo(() => indexHospitals(hospitals), [hospitals]);
    const results = query.trim().length >= 2 ? rankHospitals(query, index) : [];

    if (selected) {
        return (
            <div className="flex items-center justify-between border rounded-md px-3 h-11">
                <span className="text-sm truncate">{selected.name_en}</span>
                <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>
                    Change
                </Button>
            </div>
        );
    }

    const create = async () => {
        setCreating(true);
        try {
            const hospital = await createHospital(query.trim());
            onSelect(hospital);
            setQuery("");
            setOpen(false);
        } catch (error) {
            handleError(error, "Could not create hospital");
        } finally {
            setCreating(false);
        }
    };

    const exactMatch = results.some(
        (h) => (h.name_en || "").toLowerCase() === query.trim().toLowerCase()
    );

    return (
        <div className="relative">
            <Input
                placeholder="Search hospital or chamber name…"
                className="h-11 sm:h-9"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
            />
            {open && query.trim().length >= 2 && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-sm max-h-60 overflow-auto">
                    {results.map((hospital) => (
                        <button
                            key={hospital.hospital_id}
                            type="button"
                            className="w-full min-h-11 text-left px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                            onClick={() => {
                                onSelect(hospital);
                                setOpen(false);
                                setQuery("");
                            }}
                        >
                            {hospital.name_en}
                            {hospital.district ? ` · ${hospital.district}` : ""}
                        </button>
                    ))}
                    {!exactMatch && (
                        <button
                            type="button"
                            disabled={creating}
                            className="w-full min-h-11 text-left px-3 py-2 text-sm text-primary hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                            onClick={create}
                        >
                            + Create “{query.trim()}”
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
