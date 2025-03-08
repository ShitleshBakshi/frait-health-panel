import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface Option {
    value: string
    label: string
}

interface SelectFieldProps {
    options: Option[]
    placeholder: string
    name: string
}

export function SelectField({ options, placeholder, name }: SelectFieldProps) {
    return (
        <Select name={name}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

