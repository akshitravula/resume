import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import EditorPage from "@/pages/editor";
import TemplatesPage from "@/pages/templates";
import ResumesPage from "@/pages/resumes";
import PostSignUpPage from "@/pages/post-sign-up";
import { MainLayout } from "@/components/ui/MainLayout";
import { Chatbot } from "@/components/chat/chatbot";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/auth");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/post-sign-up">
        <ProtectedRoute component={PostSignUpPage} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/templates">
        <ProtectedRoute component={TemplatesPage} />
      </Route>
      <Route path="/resumes">
        <ProtectedRoute component={ResumesPage} />
      </Route>
      <Route path="/editor/:id">
        <ProtectedRoute component={EditorPage} />
      </Route>
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const showMainLayout = location !== "/auth" && location !== "/post-sign-up" && !location.startsWith("/editor");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          {showMainLayout ? (
            <MainLayout>
              <Router />
            </MainLayout>
          ) : (
            <Router />
          )}
          <Chatbot onClose={() => {}} />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}



export default App;