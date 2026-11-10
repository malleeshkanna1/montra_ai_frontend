import { useState } from "react"
import {
    Calculator,
    IndianRupee,
} from "lucide-react"

import CalculatorPopup from "./Calculator"

import {
    Field,
    FieldLabel,
} from "@/components/ui/field"

import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"

import type {
    UseFormRegister,
    UseFormSetValue,
} from "react-hook-form"

import type { IncomeFormData } from "./Form"

interface AmountInputProps {
    register: UseFormRegister<IncomeFormData>
    setValue: UseFormSetValue<IncomeFormData>
    error?: string
}

const AmountInput: React.FC<AmountInputProps> = ({
    register,
    setValue,
    error,
}) => {

    const [calcPopupState, setCalcPopupState] =
        useState(false)

    const [inputValue, setInputValue] =
        useState("")


    function handleInputChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {

        let value = e.target.value

        // Allow only numbers and "."
        value = value.replace(/[^0-9.]/g, "")

        // Allow only one "."
        const parts = value.split(".")

        if (parts.length > 2) {
            value =
                parts[0] +
                "." +
                parts.slice(1).join("")
        }

        setInputValue(value)

        setValue(
            "amount",
            value,
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        )
    }


    function handleCalculatorResult(result: number) {

        const value = result.toString()

        setInputValue(value)

        setValue(
            "amount",
            value,
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        )
    }


    return (
        <div className="mt-3">

            <Field>

                <FieldLabel
                    className="font-bold"
                    htmlFor="income-amount"
                >
                    Income Amount
                </FieldLabel>


                <InputGroup
                    className={
                        error
                            ? "border-red-500"
                            : ""
                    }
                >

                    <InputGroupInput
                        id="income-amount"

                        {...register("amount", {
                            required:
                                "Income amount is required",

                            validate: (value) => {

                                if (
                                    value === ""
                                ) {
                                    return "Income amount is required"
                                }

                                if (
                                    Number(value) <= 0
                                ) {
                                    return "Income amount must be greater than 0"
                                }

                                return true
                            },
                        })}

                        value={inputValue}

                        onChange={handleInputChange}

                        placeholder="0"

                        inputMode="decimal"
                    />


                    <InputGroupAddon
                        align="inline-start"
                    >
                        <IndianRupee
                            className="text-muted-foreground"
                        />
                    </InputGroupAddon>


                    <InputGroupAddon
                        align="inline-end"
                    >

                        <button
                            type="button"
                            className="cursor-pointer"
                            onClick={() =>
                                setCalcPopupState(true)
                            }
                        >

                            <Calculator
                                className="text-muted-foreground"
                                size={20}
                            />

                        </button>

                    </InputGroupAddon>

                </InputGroup>


                {error && (
                    <p className="text-sm text-red-500 mt-1">
                        {error}
                    </p>
                )}

            </Field>


            <CalculatorPopup
                calcPopupState={calcPopupState}
                SetCalcPopupState={
                    setCalcPopupState
                }
                SetResult={
                    handleCalculatorResult
                }
            />

        </div>
    )
}

export default AmountInput