import { ChevronRight, Minus, Plus, Sparkles, type LucideIcon } from "lucide-react"
import { Button } from "../ui/button"
import { useNavigate, type NavigateFunction } from "react-router-dom"


const Navigations: React.FC = () => {

const navigate = useNavigate()


    const btnData = [
        {
            route: '/add/income',
            icon: Plus,
            btnName: 'Add Income'
        },
        {
            route: '/add/expense',
            icon: Minus,
            btnName: 'Add Expense'
        },
        {
            route: '/ai-advisor',
            icon: Sparkles,
            btnName: 'AI Advisor'
        }
    ]
    
    return <div className="items-center justify-center flex gap-3">
        {btnData.map((btn,i) => <RouteBtn key={i} navigate={navigate} route={btn.route} Icon={btn.icon} btnName={btn.btnName} />)}
    </div>
}



function RouteBtn({ route, Icon, btnName,navigate }: { route: string, Icon: LucideIcon, btnName: string , navigate : NavigateFunction}) {
    return <Button onClick={()=>navigate(route)} variant="outline" className="md:w-auto w-26 h-auto  py-3 shadow-md hover:shadow-none cursor-pointer">
        <div className="flex flex-col md:flex-row md:gap-5 items-center justify-between">
            <div className="bg-black flex items-center justify-center w-10 h-10 rounded-full">
                <Icon size={64} color="#ffffff" strokeWidth={1.75} />
            </div>
            <div className="flex gap-3 items-center mt-2 md:mt-0">
                <p className="font-bold text-sm ">{btnName}</p>
                <div className="hidden md:block">
                    <ChevronRight size={64} color="#000" strokeWidth={1.75} />
                </div>
            </div>
        </div>
    </Button>
}

export default Navigations