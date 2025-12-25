import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import UserGuideDialog from "./UserGuideDialog";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-header">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <button 
            className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl bg-transparent border-none p-0 text-left" 
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <img 
                src="/company-logo.png" 
                alt="Logo" 
                className="relative w-10 h-10 sm:w-12 sm:h-12 object-contain bg-white rounded-lg p-1"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-2xl font-bold tracking-tight text-gradient truncate">
                PT. Sumber Ganda Mekar
              </h1>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] hidden sm:block">
                Industrial Steel & Construction
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {user && (
              <>
                <UserGuideDialog />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300">
                      <User className="w-5 h-5 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 mt-2 glass-card">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">Administrator</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Keluar dari Sesi
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
