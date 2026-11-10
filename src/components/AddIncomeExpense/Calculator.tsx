
import { useState, type SetStateAction } from "react"

import {
    DialogContent,
    DialogHeader,
    Dialog,
    DialogTitle,
    Button,
} from "../ui/dialog"

import {
    IndianRupee,
    RotateCcw,
    Calculator as CalcIcon,
} from "lucide-react"

import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon,
} from "../ui/input-group"

import { CalcControls } from "./CalcControls"

interface CalcProps {
    calcPopupState: boolean
    SetCalcPopupState: React.Dispatch<SetStateAction<boolean>>
    SetResult:(result: number) => void
}

type Operator = "+" | "-" | "*" | "/" | null

export default function Calculator({
    calcPopupState,
    SetCalcPopupState,
    SetResult,
}: CalcProps) {
    const [inputValue, setInputValue] = useState("0")
    const [storedValue, setStoredValue] = useState<number | null>(null)
    const [operator, setOperator] = useState<Operator>(null)
    const [waitingForOperand, setWaitingForOperand] = useState(false)

    /*
     * Reset calculator
     */
    function resetCalculator() {
        setInputValue("0")
        setStoredValue(null)
        setOperator(null)
        setWaitingForOperand(false)
    }

    /*
     * Dialog open / close
     */
    function handleCalcPopup(state: boolean) {
        SetCalcPopupState(state)

        if (!state) {
            resetCalculator()
        }
    }

    /*
     * Convert UI operator value
     * into actual arithmetic operator
     */
    function getOperator(symbol: string): Operator {
        switch (symbol) {
            case "add":
                return "+"

            case "sub":
                return "-"

            case "mul":
                return "*"

            case "div":
                return "/"

            default:
                return null
        }
    }

    /*
     * Calculation logic
     */
    function calculate(
        firstValue: number,
        secondValue: number,
        selectedOperator: Operator
    ): number {
        switch (selectedOperator) {
            case "+":
                return firstValue + secondValue

            case "-":
                return firstValue - secondValue

            case "*":
                return firstValue * secondValue

            case "/":
                if (secondValue === 0) {
                    return NaN
                }

                return firstValue / secondValue

            default:
                return secondValue
        }
    }

    /*
     * Format calculation result
     */
    function formatResult(value: number): string {
        if (!Number.isFinite(value)) {
            return "Error"
        }

        if (Number.isInteger(value)) {
            return value.toString()
        }

        return parseFloat(value.toFixed(10)).toString()
    }

    /*
     * Number button
     *
     * Example:
     * 1 → 2 → 3
     * Result: 123
     */
    function numberClick(num: string) {
        /*
         * If previous result was an error,
         * start fresh.
         */
        if (inputValue === "Error") {
            setInputValue(num)
            setWaitingForOperand(false)
            return
        }

        /*
         * If operator was pressed,
         * the next number replaces the display.
         *
         * Example:
         * 10 + 20
         */
        if (waitingForOperand) {
            setInputValue(num)
            setWaitingForOperand(false)
            return
        }

        setInputValue((currentValue) => {
            /*
             * Replace initial 0
             */
            if (currentValue === "0") {
                return num
            }

            /*
             * Add number to existing value
             */
            return currentValue + num
        })
    }

    /*
     * Decimal button
     */
    function decimalClick() {
        /*
         * After Error
         */
        if (inputValue === "Error") {
            setInputValue("0.")
            setWaitingForOperand(false)
            return
        }

        /*
         * After operator
         */
        if (waitingForOperand) {
            setInputValue("0.")
            setWaitingForOperand(false)
            return
        }

        /*
         * Prevent multiple decimal points
         */
        if (!inputValue.includes(".")) {
            setInputValue((currentValue) => {
                return `${currentValue}.`
            })
        }
    }

    /*
     * Delete button
     */
    function deleteClick() {
        /*
         * Clear error
         */
        if (inputValue === "Error") {
            resetCalculator()
            return
        }

        /*
         * Don't delete when waiting
         * for the next operand.
         */
        if (waitingForOperand) {
            return
        }

        setInputValue((currentValue) => {
            /*
             * If only one character remains,
             * return to 0.
             */
            if (currentValue.length <= 1) {
                return "0"
            }

            const newValue = currentValue.slice(0, -1)

            /*
             * Prevent invalid states
             */
            if (newValue === "" || newValue === "-") {
                return "0"
            }

            return newValue
        })
    }

    /*
     * Operator button
     */
    function arithmeticOperatorClick(symbol: string) {
        const selectedOperator = getOperator(symbol)

        if (!selectedOperator) {
            return
        }

        /*
         * Don't allow operations on Error
         */
        if (inputValue === "Error") {
            return
        }

        const currentValue = Number(inputValue)

        if (Number.isNaN(currentValue)) {
            return
        }

        /*
         * Example:
         *
         * 10 + 20 +
         *
         * First calculate:
         *
         * 10 + 20 = 30
         *
         * Then keep + active.
         */
        if (
            storedValue !== null &&
            operator !== null &&
            !waitingForOperand
        ) {
            const result = calculate(
                storedValue,
                currentValue,
                operator
            )

            if (!Number.isFinite(result)) {
                setInputValue("Error")
                setStoredValue(null)
                setOperator(null)
                return
            }

            setInputValue(formatResult(result))
            setStoredValue(result)
        }

        /*
         * First operator
         *
         * Example:
         *
         * 100 +
         */
        else if (storedValue === null) {
            setStoredValue(currentValue)
        }

        /*
         * Store selected operator
         */
        setOperator(selectedOperator)

        /*
         * Next number should replace
         * current display.
         */
        setWaitingForOperand(true)
    }

    function handleOk() {
        const result = Number(inputValue)

        if (!Number.isFinite(result)) {
            return
        }

        SetResult(result)

        SetCalcPopupState(false)

        resetCalculator()
    }

    return (
        <Dialog
            open={calcPopupState}
            onOpenChange={handleCalcPopup}
        >
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold flex items-center gap-2">
                        <CalcIcon size="17" />
                        Calculator
                    </DialogTitle>
                </DialogHeader>

                {/* Calculator Display */}
                <div aria-label="calc-section">
                    <InputGroup className="py-5">
                        <InputGroupInput
                            value={inputValue}
                            readOnly
                            inputMode="none"
                        />

                        <InputGroupAddon>
                            <IndianRupee />
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                {/* Calculator Controls */}
                <div aria-label="calc-controls">
                    <div className="grid grid-cols-12">
                        {CalcControls.map((btn) => (
                            <div
                                key={btn.value}
                                className="col-span-3 p-1"
                            >
                                {btn.is_operator ? (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            /*
                                             * Delete
                                             */
                                            if (
                                                btn.value === "del"
                                            ) {
                                                deleteClick()
                                                return
                                            }

                                            /*
                                             * Decimal
                                             */
                                            if (
                                                btn.value === "dot"
                                            ) {
                                                decimalClick()
                                                return
                                            }

                                            /*
                                             * Arithmetic operator
                                             */
                                            arithmeticOperatorClick(
                                                btn.value
                                            )
                                        }}
                                        className="w-full rounded-full bg-[#eee] text-black hover:bg-[#d7d4d4] cursor-pointer"
                                    >
                                        {btn.icon && (
                                            <btn.icon />
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            numberClick(
                                                btn.value
                                            )
                                        }
                                        className="w-full rounded-full bg-white border border-[#d7d4d4] text-black hover:bg-[#d7d4d4] cursor-pointer"
                                    >
                                        {btn.value}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        onClick={resetCalculator}
                        className="w-1/2 bg-[#eee] text-black hover:bg-[#d7d4d4] cursor-pointer"
                    >
                        <RotateCcw />
                        Reset
                    </Button>

                    <Button
                        type="button"
                        onClick={handleOk}
                        className="w-1/2 cursor-pointer"
                    >
                        Ok
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
