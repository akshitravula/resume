import { useAuth } from "@/hooks/use-auth";
import AuthPage from "@/pages/auth";
import PostSignUpPage from "@/pages/post-sign-up";
import { useLocation } from "wouter";

export function ProtectedRouter({ component: Component }: { component: () => JSX.Element }) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

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
    return <AuthPage />;
  }

  if (!user.industry) {
    if (location !== "/post-sign-up") {
      setLocation("/post-sign-up");
    }
    return <PostSignUpPage />;
  }

  return <Component />;
}
