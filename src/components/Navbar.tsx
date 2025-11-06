import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingCart, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary font-serif">Riply</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search books..."
                className="pl-10 bg-secondary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/browse">
              <Button variant="ghost" size="sm">Browse</Button>
            </Link>
            <Link to="/sell">
              <Button variant="default" size="sm">Sell Books</Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-xs flex items-center justify-center text-accent-foreground">
                  0
                </span>
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
