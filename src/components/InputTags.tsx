'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, InputProps } from "@/components/ui/input";
import { Edit2, XIcon } from "lucide-react";
import { Dispatch, SetStateAction, forwardRef, useState } from "react";

type InputTagsProps = InputProps & {
    value: string[];
    onChange: Dispatch<SetStateAction<string[]>>;
};

export const InputTags = forwardRef<HTMLInputElement, InputTagsProps>(
    ({ value, onChange, ...props }, ref) => {
        const [pendingDataPoint, setPendingDataPoint] = useState("");
        const [editingIndex, setEditingIndex] = useState<number | null>(null);

        const addOrUpdateDataPoint = () => {
            if (pendingDataPoint.trim()) {
                if (editingIndex !== null) {
                    const newDataPoints = [...value];
                    newDataPoints[editingIndex] = pendingDataPoint.trim();
                    onChange(Array.from(new Set(newDataPoints)));
                    setEditingIndex(null);
                } else {
                    const newDataPoints = new Set([...value, pendingDataPoint.trim()]);
                    onChange(Array.from(newDataPoints));
                }
                setPendingDataPoint("");
            }
        };

        const editTag = (index: number) => {
            setPendingDataPoint(value[index]);
            setEditingIndex(index);
        };

        return (
            <>
                <div className="flex gap-2">
                    <Input
                        value={pendingDataPoint}
                        onChange={(e) => setPendingDataPoint(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addOrUpdateDataPoint();
                            }
                        }}
                        className="rounded-r-none"
                        {...props}
                        ref={ref}
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        className="border mt-1 border-l-0"
                        onClick={addOrUpdateDataPoint}
                    >
                        {editingIndex !== null ? "Update" : "Add"}
                    </Button>
                </div>
                {value.length > 0 && (
                    <div className="rounded-md mt-1 min-h-[2.5rem] overflow-y-auto flex gap-2 flex-wrap items-center">
                        {value.map((item, idx) => (
                            <Badge key={idx} variant="secondary">
                                {item}
                                <button
                                    type="button"
                                    className="w-3 ml-2"
                                    onClick={() => editTag(idx)}
                                >
                                    <Edit2 className="w-3" />
                                </button>
                                <button
                                    type="button"
                                    className="w-3 ml-2"
                                    onClick={() => {
                                        onChange(value.filter((i) => i !== item));
                                    }}
                                >
                                    <XIcon className="w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </>
        );
    }
);

InputTags.displayName = "InputTags";