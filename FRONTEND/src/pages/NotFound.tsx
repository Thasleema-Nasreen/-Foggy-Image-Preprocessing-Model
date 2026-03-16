import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="inline-block rounded-full bg-gradient-accent p-4 mb-4 shadow-glow">
          <h1 className="text-4xl font-bold text-white">404</h1>
        </div>
        <h2 className="text-2xl font-bold">Page not found</h2>
        <p className="text-muted-foreground max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="inline-flex items-center justify-center rounded-md bg-accent text-accent-foreground px-6 py-3 font-semibold hover:bg-accent/90 transition-colors">
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
