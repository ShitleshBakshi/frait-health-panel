"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DatePicker } from "./ui/date-picker";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { FormField } from "./ui/form-field";
import { useToast } from "./ui/use-toast";
import { format } from "date-fns";
import * as XLSX from "xlsx";

interface NewFamilyFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        nhsNumber?: string;
        childDob?: string;
        updatedAt: string;
    }) => void;
}

export function NewFamilyForm({
                                  open,
                                  onClose,
                                  onSubmit,
                              }: NewFamilyFormProps) {
    const [name, setName] = useState("");
    const [nhsNumber, setNhsNumber] = useState("");
    const [childDob, setChildDob] = useState<Date | undefined>(undefined);
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

         if (!name) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
    };

        onSubmit({
            name,
            nhsNumber: nhsNumber || undefined,
            childDob: childDob ? format(childDob, "dd/MM/yyyy"): undefined,
            updatedAt: new Date().toISOString(),
        });

        // Reset form
        setName("");
        setNhsNumber("");
        setChildDob(undefined);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Family</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <FormField label="Family Name *">
                            <Input
                                placeholder="Enter family name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </FormField>

                        <FormField label="Child Date of Birth">
                            <DatePicker
                                selected={childDob}
                                onSelect={(date) => setChildDob(date)}
                            />
                        </FormField>

                        <FormField label="NHS Number">
                            <Input
                                placeholder="Enter NHS number"
                                value={nhsNumber}
                                onChange={(e) => setNhsNumber(e.target.value)}
                            />
                        </FormField>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Add Family
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}