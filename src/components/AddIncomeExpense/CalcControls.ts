import {
    Delete,
    Divide,
    Dot,
    Minus,
    Plus,
    X,
    type LucideIcon,
} from "lucide-react"

export interface CalcControl {
    value: string
    is_operator: boolean
    icon?: LucideIcon
}

export const CalcControls: CalcControl[] = [
    {
        value: "7",
        is_operator: false,
    },
    {
        value: "8",
        is_operator: false,
    },
    {
        value: "9",
        is_operator: false,
    },
    {
        icon: Delete,
        is_operator: true,
        value: "del",
    },

    {
        value: "4",
        is_operator: false,
    },
    {
        value: "5",
        is_operator: false,
    },
    {
        value: "6",
        is_operator: false,
    },
    {
        icon: Plus,
        is_operator: true,
        value: "add",
    },

    {
        value: "1",
        is_operator: false,
    },
    {
        value: "2",
        is_operator: false,
    },
    {
        value: "3",
        is_operator: false,
    },
    {
        icon: Minus,
        is_operator: true,
        value: "sub",
    },

    {
        value: "0",
        is_operator: false,
    },
    {
        icon: Dot,
        is_operator: true,
        value: "dot",
    },
    {
        icon: Divide,
        is_operator: true,
        value: "div",
    },
    {
        icon: X,
        is_operator: true,
        value: "mul",
    },
]