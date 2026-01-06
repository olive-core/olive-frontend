import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"


interface SearchableSelectProps {
    options: {
        value: string,
        label: string
    }[],
    type: string,
}


export default function SearchableSelect({
    options,
    type,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState<string>("")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between"
                >
                    {value
                        ? options.find((opt) => opt.value === value)?.label
                        : `Select ${type}...`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandInput placeholder={`Search ${type}...`} />
                    <CommandEmpty>No {type} found.</CommandEmpty>

                    <CommandGroup>
                        {options.map((opt) => (
                            <CommandItem
                                key={opt.value}
                                value={opt.value}
                                onSelect={(currentValue) => {
                                    setValue(currentValue === value ? "" : currentValue)
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === opt.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {opt.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
