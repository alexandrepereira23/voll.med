import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Doctors from "@/pages/Doctors";
import Patients from "@/pages/Patients";
import Appointments from "@/pages/Appointments";
import MedicalRecords from "@/pages/MedicalRecords";
import Prescriptions from "@/pages/Prescriptions";
import Certificates from "@/pages/Certificates";
import Specialties from "@/pages/Specialties";
import Insurance from "@/pages/Insurance";
import Login from "@/pages/Login";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <PrivateRoute component={Dashboard} />} />
      <Route path="/doctors" component={() => <PrivateRoute component={Doctors} />} />
      <Route path="/patients" component={() => <PrivateRoute component={Patients} />} />
      <Route path="/appointments" component={() => <PrivateRoute component={Appointments} />} />
      <Route path="/medical-records" component={() => <PrivateRoute component={MedicalRecords} />} />
      <Route path="/prescriptions" component={() => <PrivateRoute component={Prescriptions} />} />
      <Route path="/certificates" component={() => <PrivateRoute component={Certificates} />} />
      <Route path="/specialties" component={() => <PrivateRoute component={Specialties} />} />
      <Route path="/insurance" component={() => <PrivateRoute component={Insurance} />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
