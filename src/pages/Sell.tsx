import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Sell = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    condition: "",
    price: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/sign-in')
      return
    }

    try {
      const { data, error } = await supabase
        .from('books')
        .insert({
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn || null,
          category: formData.category,
          condition: formData.condition,
          price: parseFloat(formData.price),
          description: formData.description,
          seller_id: user.id,
          status: 'available',
          image_url: null, // For now, no image upload
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Book listed successfully!", {
        description: `${formData.title} has been added to your listings.`,
      });

      // Reset form
      setFormData({
        title: "",
        author: "",
        isbn: "",
        category: "",
        condition: "",
        price: "",
        description: "",
      });

      // Navigate to dashboard to see the listing
      navigate('/dashboard')
    } catch (error: any) {
      toast.error("Failed to list book", {
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold mb-2">Sell Your Books</h1>
            <p className="text-muted-foreground">List your used books and start earning. It's quick and easy!</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Book Details</CardTitle>
              <CardDescription>Provide information about the book you want to sell</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Book Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., The Great Gatsby"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      placeholder="e.g., F. Scott Fitzgerald"
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN (Optional)</Label>
                    <Input
                      id="isbn"
                      placeholder="e.g., 9780743273565"
                      value={formData.isbn}
                      onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fiction">Fiction</SelectItem>
                        <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                        <SelectItem value="romance">Romance</SelectItem>
                        <SelectItem value="self-help">Self-Help</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="children">Children's Books</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent - Like New</SelectItem>
                        <SelectItem value="very-good">Very Good - Minor wear</SelectItem>
                        <SelectItem value="good">Good - Some wear</SelectItem>
                        <SelectItem value="acceptable">Acceptable - Well used</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g., 199"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the book's condition, any highlights, or special features..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Book Photos</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB (Max 5 photos)</p>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full hover-lift">
                  List Book for Sale
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-secondary/30 border-none">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Tips for Better Sales</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Take clear, well-lit photos of the book from multiple angles</li>
                <li>✓ Be honest about the book's condition</li>
                <li>✓ Price competitively by checking similar listings</li>
                <li>✓ Write a detailed description highlighting any special features</li>
                <li>✓ Respond promptly to buyer inquiries</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Sell;
