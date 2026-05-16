import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
    page:         number;
    totalPages:   number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    return (
        <div className="flex items-center justify-center gap-4 mt-8 print:hidden">
            <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="gap-1"
            >
                <ChevronLeftIcon className="size-4" />
                Previous
            </Button>

            <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
            </span>

            <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="gap-1"
            >
                Next
                <ChevronRightIcon className="size-4" />
            </Button>
        </div>
    );
}
