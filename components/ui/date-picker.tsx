"use client"

import { useState } from "react"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DatePickerProps {
    selected: Date | undefined
    onSelect: (date: Date | undefined) => void
}

export function DatePicker({ selected, onSelect }: DatePickerProps) {
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(selected)
    const [month, setMonth] = useState<number>(new Date().getMonth())
    const [year, setYear] = useState<number>(new Date().getFullYear())

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

    const getDaysInMonth = (year: number, month: number) => {
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null)
        }

        // Add the days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i)
        }

        return days
    }

    const handleSelect = (selectedDate: number) => {
        const newDate = new Date(year, month, selectedDate)
        setDate(newDate)
        onSelect(newDate)
        setOpen(false)
    }

    const handleMonthChange = (value: string) => {
        setMonth(months.indexOf(value))
    }

    const handleYearChange = (value: string) => {
        setYear(Number.parseInt(value))
    }

    const monthDays = getDaysInMonth(year, month)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "dd/mm/yyyy"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-4">
                    {/* Month and Year Selection */}
                    <div className="flex gap-2">
                        <Select value={months[month]} onValueChange={handleMonthChange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                    <SelectItem key={month} value={month}>
                                        {month}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={year.toString()} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Day Headers */}
                        {days.map((day) => (
                            <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                                {day}
                            </div>
                        ))}

                        {/* Calendar Days */}
                        {monthDays.map((day, index) => (
                            <div key={index} className="aspect-square">
                                {day !== null ? (
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "h-8 w-8 p-0 font-normal",
                                            date &&
                                            date.getDate() === day &&
                                            date.getMonth() === month &&
                                            date.getFullYear() === year &&
                                            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                        )}
                                        onClick={() => handleSelect(day)}
                                    >
                                        <time dateTime={day.toString()}>{day}</time>
                                    </Button>
                                ) : (
                                    <div className="h-8 w-8" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

