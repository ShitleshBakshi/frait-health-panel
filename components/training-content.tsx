"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2 } from "lucide-react"

interface Module {
    id: number
    name: string
    completed: boolean
}

export function TrainingContent() {
    const { toast } = useToast()
    const [modules, setModules] = useState<Module[]>([
        { id: 1, name: "HV Module 1", completed: false },
        { id: 2, name: "HV Module 2", completed: false },
        { id: 3, name: "HV Module 3", completed: false },
        { id: 4, name: "HV Module 4", completed: false },
    ])
    const [selectedModule, setSelectedModule] = useState<Module | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const handleToggle = (module: Module) => {
        if (!module.completed) {
            setSelectedModule(module)
            setDialogOpen(true)
        }
    }

    const handleConfirm = () => {
        if (selectedModule) {
            setModules(modules.map((m) => (m.id === selectedModule.id ? { ...m, completed: true } : m)))
            setDialogOpen(false)
            toast({
                title: "Success",
                description: "Training has been completed successfully!",
                action: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            })
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">FRAIT Training</h1>
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                    Get certificate
                </Button>
            </div>

            <p className="text-gray-600">
                FRAIT training package comprises a set of learning materials that offers participants an opportunity to take the
                FRAIT forward in health visiting practice by identifying aspects of family resilience and ensure evidence based
                decision making.
            </p>

            <div className="bg-[#1a2634] rounded-lg p-6 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-white text-lg font-medium">Training items</h2>
                    <p className="text-gray-400 text-sm">You completed the training on: 20-10-2022 14:44:11</p>
                </div>

                <div className="space-y-4">
                    {modules.map((module) => (
                        <div key={module.id} className="flex items-center justify-between bg-[#1f2937] p-4 rounded-md">
                            <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-sm">
                  {module.id}
                </span>
                                <span className="text-white">{module.name}</span>
                            </div>
                            <Switch checked={module.completed} onCheckedChange={() => handleToggle(module)} />
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Module Completion</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to mark this item as completed?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm}>Ok</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

