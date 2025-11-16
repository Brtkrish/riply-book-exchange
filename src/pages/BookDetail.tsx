import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Heart, Share2, MapPin, Shield, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;

      try {
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .select('*')
          .eq('id', id)
          .single();

        if (bookError) throw bookError;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', bookData.seller_id)
          .single();

        if (profileError) throw profileError;

        setBook(bookData);
        setSeller(profileData);
      } catch (error: any) {
        toast.error("Failed to load book", {
          description: error.message || "Something went wrong.",
        });
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/sign-in')
      return
    }

    if (!book) return;

    try {
      const raw = localStorage.getItem('riply_cart')
      const cart = raw ? JSON.parse(raw) as any[] : []

      const existing = cart.find((i: any) => i.id === book.id)
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1
      } else {
        cart.push({
          id: book.id,
          title: book.title,
          price: book.price,
          image: Array.isArray(book.images) && book.images.length > 0 ? book.images[0] : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
          quantity: 1,
          seller_id: book.seller_id,
        })
      }

      localStorage.setItem('riply_cart', JSON.stringify(cart))
      // notify other parts of the app
      window.dispatchEvent(new CustomEvent('riply_cart_updated', { detail: { cart } }))

      toast.success("Added to cart!", {
        description: `${book.title} has been added to your cart.`,
      });
    } catch (err: any) {
      toast.error("Could not add to cart", { description: err?.message || String(err) })
    }
  };

  const handleBuyNow = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/sign-in')
      return
    }

    toast.info("Coming soon!", {
      description: "Payment integration will be enabled after connecting Lovable Cloud.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!book || !seller) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Book not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const bookImages = Array.isArray(book.images) && book.images.length > 0
    ? book.images
    : ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80"];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-lg overflow-hidden border">
              <img
                src={bookImages[0]}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {bookImages.map((image: string, index: number) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border cursor-pointer hover:border-primary transition-colors">
                  <img
                    src={image}
                    alt={`${book.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{book.category}</Badge>
              <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>

              <div className="flex items-baseline gap-3 mb-4">
                <p className="text-4xl font-bold text-primary">₹{book.price}</p>
                <Badge variant="outline" className="text-sm">
                  {book.condition} Condition
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Quality Checked
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Seller Info */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-3">Sold by</p>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarImage src={seller.avatar_url} />
                    <AvatarFallback>{seller.full_name?.[0] || seller.username?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{seller.full_name || seller.username || 'Anonymous'}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>Location not specified</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button size="lg" className="flex-1 hover-lift" onClick={handleBuyNow}>
                Buy Now
              </Button>
              <Button size="lg" variant="outline" className="flex-1 hover-lift" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="hover-lift">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="hover-lift">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Description & Details */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{book.description}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Book Details</h3>
                <dl className="space-y-3 text-sm">
                  {book.isbn && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">ISBN</dt>
                        <dd className="font-medium">{book.isbn}</dd>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium">{book.category}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Condition</dt>
                    <dd className="font-medium">{book.condition}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Listed</dt>
                    <dd className="font-medium">{new Date(book.created_at).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookDetail;
