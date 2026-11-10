import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "./components/layout/NotFound";
import LoginForm from "./components/Auth/LoginForm";
import { Toaster } from "@/components/ui/sonner";
import { redirect } from "react-router-dom";

export default function App() {

  const routerConfig = createBrowserRouter([
    {
      path: '/',
      async lazy() {
        const Layout = await import('./components/layout/Layout')
        return { Component: Layout.default }
      },
      children: [
        {
          path: '',
          async lazy() {
            const Home = await import('./components/Home/Home');
            return { Component: Home.default }
          }
        },
        {
          path: "/add/:mode",
          async lazy() {
            const Add = await import(
              "./components/AddIncomeExpense/AddIncomeExpenses"
            );

            return { Component: Add.default };
          },
          loader({ params }) {
            if (params.mode !== "income" && params.mode !== "expense") {
              return redirect("/not-found");
            }

            return null;
          },
        },
        {
          path: '/transactions',
          async lazy() {
            const Transactions = await import('./components/TransactionHistory/Transactions');
            return { Component: Transactions.default }
          }
        },
        {
          path: '/ai-advisor',
          async lazy() {
            const AIAdvisory = await import('./components/AIAdvisory/AIAdvisory');
            return { Component: AIAdvisory.default }
          }
        },
      ]
    },
    {
      path: '/auth/login',
      element: <LoginForm />
    },
    {
      path: '/not-found',
      element: <NotFound />
    },
    {
      path: '*',
      element: <NotFound />
    }
  ])

  return (
    <div className="bg-[#eee]">
      <Toaster position="top-right" richColors />
      <RouterProvider router={routerConfig} />
    </div>
  )
}