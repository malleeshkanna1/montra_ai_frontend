import BalanceInfo from "./BalanceInfo";
import Navigations from "./Navigations";
import TransactionHistory from "./TransactionHistory";

export default function Home(){
    return <>
        <Navigations/>
        <BalanceInfo/>
        <TransactionHistory/>
    </>
}