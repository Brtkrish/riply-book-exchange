import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Leaf, ShoppingBag, TrendingUp, Heart, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-books.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const features = [
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description: "Reduce waste by giving books a second life",
  },
  {
    icon: ShoppingBag,
    title: "Affordable",
    description: "Save up to 70% on your favorite titles",
  },
  {
    icon: TrendingUp,
    title: "Easy Selling",
    description: "List your books in minutes and earn money",
  },
  {
    icon: Heart,
    title: "Community",
    description: "Join thousands of book lovers like you",
  },
];

const stats = [
  { label: "Books Sold", value: "50,000+", icon: BookOpen },
  { label: "Happy Readers", value: "10,000+", icon: Users },
  { label: "Trees Saved", value: "2,500+", icon: Leaf },
];

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;

        // Transform database books to match the expected format
        const transformedBooks = data.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          condition: book.condition,
          image: Array.isArray(book.images) && book.images.length > 0 ? book.images[0] : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80", // Default image
        }));

        setFeaturedBooks(transformedBooks);
      } catch (error: any) {
        toast.error("Failed to load featured books", {
          description: error.message || "Something went wrong.",
        });
        setFeaturedBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <Badge className="w-fit bg-accent/20 text-accent-foreground border-accent/30">
                Sustainable Reading
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Give Books a Second Life
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Buy and sell used books affordably while promoting sustainability. Join India's most trusted eco-friendly book marketplace.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/browse">
                  <Button size="lg" className="hover-lift">
                    Browse Books
                  </Button>
                </Link>
                <Link to="/sell">
                  <Button size="lg" variant="outline" className="hover-lift">
                    Sell Your Books
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <img 
                src={heroImage} 
                alt="Stack of books with plants" 
                className="rounded-2xl shadow-2xl hover:shadow-[0_20px_50px_hsla(122,39%,31%,0.2)] transition-shadow duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <stat.icon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-4xl font-bold">{stat.value}</p>
                <p className="text-primary-foreground/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Riply?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're more than just a marketplace. We're building a sustainable reading community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover-lift card-hover">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Books</h2>
              <p className="text-muted-foreground">Discover amazing deals on popular titles</p>
            </div>
            <Link to="/browse">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-[3/4] bg-muted animate-pulse" />
                  <CardHeader>
                    <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 bg-muted animate-pulse rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-muted animate-pulse rounded w-16" />
                      <div className="h-5 bg-muted animate-pulse rounded w-12" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-9 bg-muted animate-pulse rounded w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden hover-lift card-hover group">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                    <CardDescription className="line-clamp-1">{book.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{book.condition}</Badge>
                      <p className="text-xl font-bold text-primary">₹{book.price}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/book/${book.id}`} className="w-full">
                      <Button className="w-full">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No featured books available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Leaf className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Sustainable Reading Journey</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Every book you buy or sell on Riply helps reduce waste and promotes a greener planet. Join our community today!
          </p>
          <Link to="/browse">
            <Button size="lg" variant="secondary" className="hover-lift">
              Explore Books Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
