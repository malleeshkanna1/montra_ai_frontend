import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react"
import { useParams } from "react-router-dom"
import Form from "./Form";

interface IncomeExpenseTrack {
    income: {
        title: string;
        icon: LucideIcon;
        IconColor: string;
        IconBgColor: string;
        note: string;
    };
    expense: {
        title: string;
        icon: LucideIcon;
        IconColor: string;
        IconBgColor: string;
        note: string;
    };
}

export default function AddIncomeExpenses() {

    const { mode } = useParams<"mode">();

    const transactionMode: "income" | "expense" =  mode === "income" || mode === "expense" ? mode : "income";

    const modeData: IncomeExpenseTrack = {
        'income': {
            title: 'Add Income',
            icon: ArrowUp,
            IconColor: '#0E9B1C',
            IconBgColor: '#E7F8E9',
            note: 'Every income brings you one step closer to your goals.'
        },
        'expense': {
            title: 'Add Expense',
            icon: ArrowDown,
            IconColor: '#F41010',
            IconBgColor: '#FEEBEC',
            note: 'Every expense is a chance to spend with purpose.'
        },
    }
    const modeKey = mode == 'income' ? 'income' : 'expense';
    const currentModeData = modeData[modeKey];


    return <div >
        <div className="flex gap-5">
            <div className="flex justify-center">
                <div className="rounded-full w-13 flex justify-center items-center h-13" style={{ backgroundColor: currentModeData.IconBgColor }} >
                    <currentModeData.icon color={currentModeData.IconColor} size={20} />
                </div>
            </div>
            <div className="mt-2 md:mt-0">
                <h1 className="text-[#000] text-xl font-bold" >{currentModeData.title}</h1>
                <p className="text-[#999999] text-sm" >{currentModeData.note}</p>
            </div>
        </div>
        <div>
            <Form mode={transactionMode} />
        </div>
    </div>
}