import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const readCart = () => {
      try {
        const raw = localStorage.getItem('riply_cart')
        const items = raw ? JSON.parse(raw) as any[] : []
        setCartItems(items)
      } catch (e) {
        setCartItems([])
      }
    }

    readCart()

    const onUpdate = () => readCart()
    window.addEventListener('riply_cart_updated', onUpdate as EventListener)
    window.addEventListener('storage', onUpdate as EventListener)

    return () => {
      window.removeEventListener('riply_cart_updated', onUpdate as EventListener)
      window.removeEventListener('storage', onUpdate as EventListener)
    }
  }, [])

  const updateCart = (newCart: any[]) => {
    localStorage.setItem('riply_cart', JSON.stringify(newCart))
    setCartItems(newCart)
    window.dispatchEvent(new Event('riply_cart_updated'))
  }

  const incrementQuantity = (idx: number) => {
    const newCart = [...cartItems]
    newCart[idx].quantity = (newCart[idx].quantity || 1) + 1
    updateCart(newCart)
  }

  const decrementQuantity = (idx: number) => {
    const newCart = [...cartItems]
    if ((newCart[idx].quantity || 1) > 1) {
      newCart[idx].quantity = (newCart[idx].quantity || 1) - 1
      updateCart(newCart)
    }
  }

  const deleteItem = (idx: number) => {
    const newCart = cartItems.filter((_, i) => i !== idx)
    updateCart(newCart)
  }

  const subtotal = cartItems.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                  <p className="text-muted-foreground mb-6">Add some books to get started!</p>
                  <Link to="/browse">
                    <Button>Browse Books</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item, idx) => (
                    <div key={item.id ?? idx} className="flex items-center gap-4">
                      <img src={item.image} alt={item.title} className="h-16 w-12 object-cover rounded" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-semibold">{item.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Button variant="outline" size="sm" onClick={() => decrementQuantity(idx)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm">Qty: {item.quantity || 1}</span>
                              <Button variant="outline" size="sm" onClick={() => incrementQuantity(idx)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deleteItem(idx)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="font-medium">₹{(item.price || 0) * (item.quantity || 1)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
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
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={cartItems.length === 0}
                  onClick={async () => {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                      navigate('/sign-in')
                      return
                    }
                    navigate('/checkout')
                  }}
                >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>

            <Card className="mt-6 bg-secondary/30 border-none">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Secure Checkout
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your payment information is encrypted and secure. We accept all major payment methods.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
