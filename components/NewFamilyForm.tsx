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
        childDob: string;
        updatedAt: string;
    }) => void;
    onExcelUpload: (families: any[]) => void;
}

export function NewFamilyForm({
                                  open,
                                  onClose,
                                  onSubmit,
                                  onExcelUpload,
                              }: NewFamilyFormProps) {
    const [inputMethod, setInputMethod] = useState<"manual" | "excel">("manual");
    const [name, setName] = useState("");
    const [nhsNumber, setNhsNumber] = useState("");
    const [childDob, setChildDob] = useState<Date | undefined>(undefined);
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (inputMethod === "manual") {
            if (!name || !childDob) {
                toast({
                    title: "Error",
                    description: "Please fill in all required fields",
                    variant: "destructive",
                });
                return;
            }

            onSubmit({
                name,
                nhsNumber: nhsNumber || undefined,
                childDob: childDob ? format(childDob, "dd/MM/yyyy") : "",
                updatedAt: new Date().toISOString(),
            });

            // Reset form
            setName("");
            setNhsNumber("");
            setChildDob(undefined);
        } else if (inputMethod === "excel" && excelFile) {
            processExcelFile(excelFile);
        } else {
            toast({
                title: "Error",
                description: "Please select an Excel file to upload",
                variant: "destructive",
            });
        }
    };

    const processExcelFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Process and validate the data
                const processedData = jsonData.map((row: any) => {
                    // Map Excel columns to our data structure
                    // Assuming Excel has columns like "Family Name", "NHS Number", "Child DOB"
                    return {
                        name: row["Family Name"] || "Unknown Family",
                        nhsNumber: row["NHS Number"] || undefined,
                        childDob: row["Child DOB"] || format(new Date(), "dd/MM/yyyy"),
                        updatedAt: new Date().toISOString(),
                    };
                });

                if (processedData.length > 0) {
                    onExcelUpload(processedData);

                    // Reset form
                    setExcelFile(null);

                    toast({
                        title: "Success",
                        description: `Imported ${processedData.length} families from Excel`,
                    });
                } else {
                    toast({
                        title: "Warning",
                        description: "No valid data found in the Excel file",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("Error processing Excel file:", error);
                toast({
                    title: "Error",
                    description: "Failed to process the Excel file",
                    variant: "destructive",
                });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setExcelFile(e.target.files[0]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Family</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <Label>Choose input method</Label>
                        <RadioGroup
                            defaultValue="manual"
                            value={inputMethod}
                            onValueChange={(value) => setInputMethod(value as "manual" | "excel")}
                            className="flex flex-col space-y-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="manual" id="manual" />
                                <Label htmlFor="manual">Add data manually</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="excel" id="excel" />
                                <Label htmlFor="excel">Upload Excel sheet</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {inputMethod === "manual" ? (
                        <div className="space-y-4">
                            <FormField label="Family Name *">
                                <Input
                                    placeholder="Enter family name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </FormField>

                            <FormField label="Child Date of Birth *">
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
                    ) : (
                        <div className="space-y-4">
                            <FormField label="Family Sheet - Upload">
                                <Input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                />
                            </FormField>
                            {excelFile && (
                                <p className="text-sm text-gray-500">
                                    Selected file: {excelFile.name}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            {inputMethod === "manual" ? "Add Family" : "Upload"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}