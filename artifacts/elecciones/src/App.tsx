import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "@/pages/home";
import AdminPage from "@/pages/admin";
import StatsPage from "@/pages/stats";
import ResultadosPage from "@/pages/resultados";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/stats" component={StatsPage} />
      <Route path="/resultados" component={ResultadosPage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f141e" }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">404</h1>
            <p className="mt-2 text-gray-400">Pagina no encontrada</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
