import { useRef, useState } from "react";
import { CameraIcon, ImageIcon, ImageOffIcon, Loader2Icon, UploadIcon, XIcon } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MAX_NOTE_IMAGES } from "@/lib/note-images";
import type { NoteImageType } from "@/types/prescription";

// Photos attached to a clinical note: wound shots, a printed report, a skin lesion. Kept
// beside the note text and, like the note, never shown to the patient.

interface NoteImageGalleryProps {
    images:      NoteImageType[];
    /** Editable when provided. Files are already validated by the caller's handler. */
    onAdd?:      (files: File[]) => void;
    onRemove?:   (image: NoteImageType) => void;
    /** Tiles to show while uploads are in flight. */
    uploadingCount?: number;
}

function ImageTile({
    image,
    onOpen,
    onRemove,
}: {
    image:     NoteImageType;
    onOpen:    () => void;
    onRemove?: () => void;
}) {
    return (
        <div className="group relative aspect-square overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
            {image.url ? (
                <button
                    type="button"
                    onClick={onOpen}
                    className="size-full cursor-zoom-in"
                    title="View photo"
                >
                    <img src={image.url} alt="Clinical note attachment" className="size-full object-cover" />
                </button>
            ) : (
                <div className="flex size-full flex-col items-center justify-center gap-1 px-2 text-center text-slate-400">
                    <ImageOffIcon className="size-5" />
                    <span className="text-[10px] leading-tight">Unavailable</span>
                </div>
            )}

            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label="Remove photo"
                    className="absolute top-1 right-1 flex size-9 sm:size-7 items-center justify-center rounded-full bg-slate-900/70 text-white transition-colors hover:bg-red-600"
                >
                    <XIcon className="size-3.5" />
                </button>
            )}
        </div>
    );
}

function UploadingTile() {
    return (
        <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <Loader2Icon className="size-5 animate-spin text-slate-400" />
        </div>
    );
}

function PickerButton({
    icon,
    label,
    onClick,
    className,
}: {
    icon:      React.ReactNode;
    label:     string;
    onClick:   () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex h-11 sm:h-9 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-400 hover:text-emerald-700 ${className ?? ""}`}
        >
            {icon}
            {label}
        </button>
    );
}

export default function NoteImageGallery({ images, onAdd, onRemove, uploadingCount = 0 }: NoteImageGalleryProps) {
    const fileInput = useRef<HTMLInputElement>(null);
    const cameraInput = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<NoteImageType | null>(null);

    const isEditable = onAdd !== undefined;
    const isFull = images.length + uploadingCount >= MAX_NOTE_IMAGES;

    if (!isEditable && images.length === 0) return null;

    const handlePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        // Reset first so picking the same file twice in a row still fires a change.
        event.target.value = "";
        if (files.length > 0) onAdd?.(files);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <ImageIcon className="size-4 text-slate-400" />
                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-900">
                    Photos
                </h4>
                {images.length > 0 && (
                    <span className="text-[11px] font-medium text-slate-500">{images.length}</span>
                )}
            </div>

            {(images.length > 0 || uploadingCount > 0) && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {images.map((image) => (
                        <ImageTile
                            key={image.blob_name}
                            image={image}
                            onOpen={() => setPreview(image)}
                            onRemove={onRemove ? () => onRemove(image) : undefined}
                        />
                    ))}
                    {Array.from({ length: uploadingCount }, (_, index) => <UploadingTile key={`uploading-${index}`} />)}
                </div>
            )}

            {isEditable && (
                <>
                    {isFull ? (
                        <p className="text-xs text-slate-500">Up to {MAX_NOTE_IMAGES} photos per note.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            <PickerButton
                                icon={<UploadIcon className="size-3.5" />}
                                label="Upload"
                                onClick={() => fileInput.current?.click()}
                            />
                            {/* A mouse-and-keyboard browser ignores `capture` and just reopens the
                                file dialog, so the camera entry is hidden where it does nothing. */}
                            <PickerButton
                                icon={<CameraIcon className="size-3.5" />}
                                label="Camera"
                                onClick={() => cameraInput.current?.click()}
                                className="pointer-fine:hidden"
                            />
                        </div>
                    )}

                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePicked}
                    />
                    <input
                        ref={cameraInput}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handlePicked}
                    />
                </>
            )}

            <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
                <DialogContent className="max-w-[calc(100%-2rem)] p-2 sm:max-w-3xl">
                    <DialogTitle className="sr-only">Clinical note photo</DialogTitle>
                    {preview?.url && (
                        <img
                            src={preview.url}
                            alt="Clinical note attachment"
                            className="max-h-[80vh] w-full rounded-md object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
