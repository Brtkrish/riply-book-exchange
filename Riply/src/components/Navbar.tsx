import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingCart, User, Search, LogIn, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem('riply_cart')
        const cart = raw ? JSON.parse(raw) as any[] : []
        const count = cart.reduce((s, i) => s + (i.quantity || 1), 0)
        setCartCount(count)
      } catch (e) {
        setCartCount(0)
      }
    }

    read()

    const onUpdate = () => read()
    window.addEventListener('riply_cart_updated', onUpdate as EventListener)
    window.addEventListener('storage', onUpdate as EventListener)

    return () => {
      window.removeEventListener('riply_cart_updated', onUpdate as EventListener)
      window.removeEventListener('storage', onUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    // Clear search query when navigating away from browse page
    if (!location.pathname.startsWith('/browse')) {
      setSearchQuery("");
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    localStorage.removeItem('riply_cart')
    window.dispatchEvent(new Event('riply_cart_updated'))
    window.location.href = '/'
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary font-serif">Riply</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-10 bg-secondary/50"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
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
                  {cartCount}
                </span>
              </Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>Logout</Button>
              </>
            ) : (
              <Link to="/sign-in">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-xs flex items-center justify-center text-accent-foreground">
                  {cartCount}
                </span>
              </Button>
            </Link>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-4 mt-8">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search books..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      className="pl-10"
                    />
                  </div>

                  {/* Mobile Menu Items */}
                  <Link to="/browse" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Browse</Button>
                  </Link>
                  <Link to="/sell" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full">Sell Books</Button>
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <User className="h-5 w-5" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}>Logout</Button>
                    </>
                  ) : (
                    <Link to="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <LogIn className="h-5 w-5" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
