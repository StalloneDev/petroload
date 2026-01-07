import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
// Lazy load pages to split the bundle
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Login = lazy(() => import("@/pages/login"));
const StationsPage = lazy(() => import("@/pages/stations"));
const TrucksPage = lazy(() => import("@/pages/trucks"));
const ValidationsPage = lazy(() => import("@/pages/validations"));
const OrdersHistoryPage = lazy(() => import("@/pages/orders-history"));

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const auth = localStorage.getItem("auth") === "true";
  if (!auth) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
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
    </Suspense>
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
