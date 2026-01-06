import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import StationsPage from "@/pages/stations";
import TrucksPage from "@/pages/trucks";
import ValidationsPage from "@/pages/validations";
import OrdersHistoryPage from "@/pages/orders-history";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const auth = localStorage.getItem("auth") === "true";
  if (!auth) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/stations">
        {() => <ProtectedRoute component={StationsPage} />}
      </Route>
      <Route path="/trucks">
        {() => <ProtectedRoute component={TrucksPage} />}
      </Route>
      <Route path="/validations">
        {() => <ProtectedRoute component={ValidationsPage} />}
      </Route>
      <Route path="/orders-history">
        {() => <ProtectedRoute component={OrdersHistoryPage} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
