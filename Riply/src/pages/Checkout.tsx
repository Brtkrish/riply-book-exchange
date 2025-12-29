import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, Phone, Mail, MapPin, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Checkout = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const readCart = () => {
      try {
        const raw = localStorage.getItem('riply_cart')
        const items = raw ? JSON.parse(raw) as any[] : []
        setCartItems(items)
        fetchSellers(items)
      } catch (e) {
        setCartItems([])
        setLoading(false)
      }
    }

    const fetchSellers = async (items: any[]) => {
      if (items.length === 0) {
        setLoading(false)
        return
      }

      try {
        // Get unique seller IDs
        const sellerIds = [...new Set(items.map(item => item.seller_id))]

        // Fetch seller profiles
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .in('id', sellerIds)

        if (error) throw error

        const sellerMap: any = {}
        profiles.forEach(profile => {
          sellerMap[profile.id] = profile
        })

        setSellers(sellerMap)
      } catch (error: any) {
        toast.error("Failed to load seller information", {
          description: error.message || "Something went wrong.",
        })
      } finally {
        setLoading(false)
      }
    }

    readCart()
  }, [])

  const subtotal = cartItems.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handleContactSeller = (seller: any, method: 'phone' | 'email') => {
    if (method === 'phone' && seller.phone) {
      window.open(`tel:${seller.phone}`)
    } else if (method === 'email') {
      // Now that emails are stored in profiles table, we can use them
      const emailToUse = seller.email
      if (emailToUse) {
        const subject = encodeURIComponent(`Interest in your books on RipLy`)
        const body = encodeURIComponent(`Hi ${seller.full_name || 'Seller'},

I'm interested in purchasing the following books from your listings on RipLy:

${cartItems.filter(item => item.seller_id === seller.id).map(item =>
  `- ${item.title} (Quantity: ${item.quantity || 1}) - ₹${item.price * (item.quantity || 1)}`
).join('\n')}

Total: ₹${cartItems.filter(item => item.seller_id === seller.id).reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)}

Please let me know the next steps for delivery.

Best regards,
[Your Name]`)
        const mailtoLink = `mailto:${emailToUse}?subject=${subject}&body=${body}`
        window.location.href = mailtoLink
      } else {
        toast.error("Email address not available for this seller")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some books to get started!</p>
            <Button onClick={() => navigate('/browse')}>Browse Books</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Group items by seller
  const itemsBySeller = cartItems.reduce((acc, item) => {
    const sellerId = item.seller_id
    if (!acc[sellerId]) {
      acc[sellerId] = []
    }
    acc[sellerId].push(item)
    return acc
  }, {} as any)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Contact sellers to complete your purchase</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(itemsBySeller).map(([sellerId, items]: [string, any[]]) => {
              const seller = sellers[sellerId]
              if (!seller) return null

              const sellerTotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)

              return (
                <Card key={sellerId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={seller.avatar_url} />
                        <AvatarFallback>{seller.full_name?.[0] || seller.username?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{seller.full_name || seller.username || 'Anonymous Seller'}</div>
                        <div className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {seller.location || 'Location not specified'}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item, idx) => (
                      <div key={item.id ?? idx} className="flex items-center gap-4">
                        <img src={item.image} alt={item.title} className="h-16 w-12 object-cover rounded" />
                        <div className="flex-1">
                          <div className="font-semibold">{item.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Quantity: {item.quantity || 1} × ₹{item.price}
                          </div>
                        </div>
                        <div className="font-medium">₹{(item.price || 0) * (item.quantity || 1)}</div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total for this seller:</span>
                      <span>₹{sellerTotal}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    {seller.phone && (
                      <Button
                        variant="outline"
                        onClick={() => handleContactSeller(seller, 'phone')}
                        className="flex-1"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Seller
                      </Button>
                    )}
                    <Button
                      onClick={() => handleContactSeller(seller, 'email')}
                      className="flex-1"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email Seller
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl text-primary">₹{total}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-secondary/30 border-none">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">How it works</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Contact the seller using the buttons above</li>
                  <li>• Arrange payment and delivery details</li>
                  <li>• Complete the transaction directly with the seller</li>
                  <li>• Books will be delivered as arranged</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
