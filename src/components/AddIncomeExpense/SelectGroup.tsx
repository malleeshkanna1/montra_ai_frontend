import {
    ArrowRightLeft,
    Banknote,
    BanknoteArrowUp,
    BanknoteCheck,
    ChartNoAxesCombined,
    CreditCard,
    HandCoins,
    Handshake,
    Info,
    Landmark,
    StarPlus,
    type LucideIcon,
} from "lucide-react"

import { useState } from "react"

import {
    Field,
    FieldLabel,
} from "../ui/field"

import {
    InputGroup,
    InputGroupAddon,
} from "../ui/input-group"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import type {
    UseFormRegister,
    UseFormSetValue,
} from "react-hook-form"

import type { IncomeFormData } from "./Form"


type CategoryIconNames =
    | "allowance"
    | "bonus"
    | "business"
    | "investment-income"
    | "other-income"
    | "pension"
    | "salary"
    | "add-new"


type PaymentIconNames =
    | "bank"
    | "card"
    | "cash"
    | "others"


type SelectItems<T extends string> = {
    label: string
    value: T
}


type InputConfig<T extends string> = {
    label: string
    name: "category" | "payment"
    id: string
    placeholder: string
    items: SelectItems<T>[]
    icons: Record<T, LucideIcon>
}


type InputProps = {
    type: "category" | "payment"
    register: UseFormRegister<IncomeFormData>
    setValue: UseFormSetValue<IncomeFormData>
    error?: string
}


const categoryItems: SelectItems<CategoryIconNames>[] = [
    {
        label: "Allowance",
        value: "allowance",
    },
    {
        label: "Bonus",
        value: "bonus",
    },
    {
        label: "Business",
        value: "business",
    },
    {
        label: "Investment Income",
        value: "investment-income",
    },
    {
        label: "Other Income",
        value: "other-income",
    },
    {
        label: "Pension",
        value: "pension",
    },
    {
        label: "Salary",
        value: "salary",
    },
]


const categoryIcons: Record<
    CategoryIconNames,
    LucideIcon
> = {
    allowance: HandCoins,
    bonus: BanknoteArrowUp,
    business: Handshake,
    "investment-income": ChartNoAxesCombined,
    "other-income": Info,
    pension: Landmark,
    salary: BanknoteCheck,
    "add-new": StarPlus,
}


const paymentItems: SelectItems<PaymentIconNames>[] = [
    {
        label: "Bank",
        value: "bank",
    },
    {
        label: "Card",
        value: "card",
    },
    {
        label: "Cash",
        value: "cash",
    },
    {
        label: "Others",
        value: "others",
    },
]


const paymentIcons: Record<
    PaymentIconNames,
    LucideIcon
> = {
    bank: Landmark,
    card: CreditCard,
    cash: Banknote,
    others: ArrowRightLeft,
}


const SelectInputGroup = ({
    type,
    setValue,
    error,
    register
}: InputProps) => {

    const [selectedCategory, setSelectedCategory] =
        useState<CategoryIconNames | "">("")

    const [selectedPayment, setSelectedPayment] =
        useState<PaymentIconNames | "">("")


    /*
     * CATEGORY
     */
    if (type === "category") {

        register("category", {
            required: "Category is required",
        })

        const config: InputConfig<CategoryIconNames> = {
            label: "Category",
            name: "category",
            id: "category",
            placeholder: "Select a category",
            items: categoryItems,
            icons: categoryIcons,
        }


        const CurrentIcon =
            selectedCategory
                ? config.icons[selectedCategory]
                : Info


        return (
            <div className="mt-3">

                <Field>

                    <FieldLabel
                        className="font-bold"
                        htmlFor={config.id}
                    >
                        {config.label}
                    </FieldLabel>


                    <InputGroup
                        className={
                            error
                                ? "border-red-500"
                                : ""
                        }
                    >

                        <InputGroupAddon align="inline-start">

                            <CurrentIcon
                                className="text-muted-foreground"
                                size={20}
                            />

                        </InputGroupAddon>


                        <Select
                            value={selectedCategory}
                            onValueChange={(value) => {

                                const category =
                                    value as CategoryIconNames

                                setSelectedCategory(category)

                                setValue(
                                    "category",
                                    category,
                                    {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                    }
                                )
                            }}
                        >

                            <SelectTrigger
                                id={config.id}
                                className="w-full border-0 shadow-none focus:ring-0"
                            >

                                <SelectValue placeholder={config.placeholder}>
                                    {selectedCategory
                                        ? config.items.find(
                                            (item) =>
                                                item.value === selectedCategory
                                        )?.label
                                        : config.placeholder}
                                </SelectValue>

                            </SelectTrigger>


                            <SelectContent>

                                <SelectGroup>

                                    <SelectLabel>
                                        {config.label}
                                    </SelectLabel>


                                    {config.items.map(
                                        (item) => {

                                            const ItemIcon =
                                                config.icons[
                                                item.value
                                                ]

                                            return (
                                                <SelectItem
                                                    key={item.value}
                                                    value={item.value}
                                                >

                                                    <ItemIcon
                                                        className="text-muted-foreground"
                                                        size={20}
                                                    />

                                                    {item.label}

                                                </SelectItem>
                                            )
                                        }
                                    )}

                                    <SelectItem
                                        value="add-new"
                                    >

                                        <StarPlus
                                            className="text-muted-foreground"
                                            size={20}
                                        />

                                        Add New Category

                                    </SelectItem>

                                </SelectGroup>

                            </SelectContent>

                        </Select>

                    </InputGroup>


                    {error && (
                        <p className="text-sm text-red-500 mt-1">
                            {error}
                        </p>
                    )}

                </Field>

            </div>
        )
    }


    /*
     * PAYMENT
     */

    register("payment", {
        required: "Payment method is required",
    })

    const config: InputConfig<PaymentIconNames> = {
        label: "Payment Method",
        name: "payment",
        id: "payment",
        placeholder: "Select a payment",
        items: paymentItems,
        icons: paymentIcons,
    }


    const CurrentIcon =
        selectedPayment
            ? config.icons[selectedPayment]
            : Landmark


    return (
        <div className="mt-3">

            <Field>

                <FieldLabel
                    className="font-bold"
                    htmlFor={config.id}
                >
                    {config.label}
                </FieldLabel>


                <InputGroup
                    className={
                        error
                            ? "border-red-500"
                            : ""
                    }
                >

                    <InputGroupAddon align="inline-start">

                        <CurrentIcon
                            className="text-muted-foreground"
                            size={20}
                        />

                    </InputGroupAddon>


                    <Select
                        value={selectedPayment}
                        onValueChange={(value) => {

                            const payment =
                                value as PaymentIconNames

                            setSelectedPayment(payment)

                            setValue(
                                "payment",
                                payment,
                                {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                }
                            )
                        }}
                    >

                        <SelectTrigger
                            id={config.id}
                            className="w-full border-0 shadow-none focus:ring-0"
                        >

                            <SelectValue placeholder={config.placeholder}>
                                {selectedPayment
                                    ? config.items.find(
                                        (item) =>
                                            item.value === selectedPayment
                                    )?.label
                                    : config.placeholder}
                            </SelectValue>

                        </SelectTrigger>


                        <SelectContent>

                            <SelectGroup>

                                <SelectLabel>
                                    {config.label}
                                </SelectLabel>


                                {config.items.map(
                                    (item) => {

                                        const ItemIcon =
                                            config.icons[
                                            item.value
                                            ]

                                        return (
                                            <SelectItem
                                                key={item.value}
                                                value={item.value}
                                            >

                                                <ItemIcon
                                                    className="text-muted-foreground"
                                                    size={20}
                                                />

                                                {item.label}

                                            </SelectItem>
                                        )
                                    }
                                )}

                            </SelectGroup>

                        </SelectContent>

                    </Select>

                </InputGroup>


                {error && (
                    <p className="text-sm text-red-500 mt-1">
                        {error}
                    </p>
                )}

            </Field>

        </div>
    )
}


export default SelectInputGroup
