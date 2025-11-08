import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Sell = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    condition: "",
    category: "",
    description: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to list a book");
        navigate("/sign-in");
        return;
      }

      // Upload images to Supabase Storage
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('book-images')
          .upload(fileName, image);

        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage
          .from('book-images')
          .getPublicUrl(fileName);
        imageUrls.push(publicUrl);
      }

      // Create book listing
      const { error: insertError } = await supabase
        .from('books')
        .insert({
          title: formData.title,
          author: formData.author,
          price: parseFloat(formData.price),
          condition: formData.condition,
          category: formData.category,
          description: formData.description,
          images: imageUrls,
          seller_id: user.id,
          status: 'available'
        });

      if (insertError) throw insertError;

      toast.success("Book listed successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Failed to list book", {
        description: error.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Sell Your Book</h1>
            <p className="text-muted-foreground">List your used book and find it a new home</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Book Details</CardTitle>
              <CardDescription>Fill in the information about your book</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Book Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Very Good">Very Good</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fiction">Fiction</SelectItem>
                      <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                      <SelectItem value="Romance">Romance</SelectItem>
                      <SelectItem value="Self-Help">Self-Help</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Biography">Biography</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell buyers more about your book..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Book Images</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer block">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB (Max {5 - images.length} more photos)</p>
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Listing Book..." : "List Book for Sale"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Sell;
