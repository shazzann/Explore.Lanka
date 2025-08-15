
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-lanka-ivory px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-lanka-orange/10 flex items-center justify-center animate-pulse-glow">
              <span className="text-3xl font-bold text-lanka-orange">404</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-lanka-blue flex items-center justify-center text-white">
              !
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Location Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Oops! This destination isn't on our map yet. Let's get you back on your adventure path!
        </p>
        <Button asChild>
          <Link to="/" className="inline-flex items-center gap-2">
            Return to Exploration
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
