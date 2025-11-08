import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Package, ShoppingBag, Settings, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          // Wait a bit and try again in case auth state is still loading
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: { user: retryUser } } = await supabase.auth.getUser();
          if (!retryUser) {
            toast.error("Please sign in to view your dashboard");
            setTimeout(() => {
              window.location.href = '/sign-in';
            }, 2000);
            setLoading(false);
            return;
          }
          setUser(retryUser);
          await loadUserData(retryUser);
          setLoading(false);
          return;
        }

        setUser(authUser);
        await loadUserData(authUser);
        setLoading(false);
      } catch (error: any) {
        toast.error("Failed to load dashboard data", {
          description: error.message || "Something went wrong.",
        });
        setLoading(false);
      }
    };

    const loadUserData = async (authUser: any) => {
      try {
        // Fetch user's profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        // Merge auth user with profile data
        const userData = {
          ...authUser,
          name: profile?.full_name || authUser.email?.split('@')[0] || 'User',
          avatar: profile?.avatar_url || null,
          memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
        };

        setUser(userData);

        // Fetch user's book listings
        const { data: books, error } = await supabase
          .from('books')
          .select('*')
          .eq('seller_id', authUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(books || []);
      } catch (error: any) {
        toast.error("Failed to load listings", {
          description: error.message || "Something went wrong.",
        });
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Please sign in to view your dashboard</p>
            <Link to="/sign-in">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <Avatar className="h-20 w-20 mx-auto mb-3">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Member since {user.memberSince}</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-4">Quick Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Books Sold</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Books Listed</span>
                    <span className="font-semibold">{listings.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Wishlist</span>
                    <span className="font-semibold">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
              <p className="text-muted-foreground">Manage your books, orders, and account</p>
            </div>

            <Tabs defaultValue="listings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="listings">
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Listings
                </TabsTrigger>
                <TabsTrigger value="purchases">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Purchases
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <Package className="h-4 w-4 mr-2" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="wishlist">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Book Listings</CardTitle>
                    <CardDescription>Books you're currently selling</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {listings.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">You haven't listed any books yet</p>
                        <Link to="/sell">
                          <Button>List Your First Book</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {listings.map((book) => (
                          <Card key={book.id} className="overflow-hidden">
                            <div className="aspect-[3/4] overflow-hidden">
                              <img
                                src={Array.isArray(book.images) && book.images.length > 0 ? book.images[0] : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80"}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                              <CardDescription className="line-clamp-1">{book.author}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary">{book.condition}</Badge>
                                <Badge variant="outline">{book.category}</Badge>
                              </div>
                              <p className="text-xl font-bold text-primary">₹{book.price}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Listed on {new Date(book.created_at).toLocaleDateString()}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="purchases" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Purchase History</CardTitle>
                    <CardDescription>Books you've bought on Riply</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">You haven't made any purchases yet</p>
                      <Link to="/browse">
                        <Button>Browse Books</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Management</CardTitle>
                    <CardDescription>Track your orders and manage fulfillment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No active orders</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wishlist" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Wishlist</CardTitle>
                    <CardDescription>Books you want to buy later</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                      <Link to="/browse">
                        <Button>Discover Books</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
