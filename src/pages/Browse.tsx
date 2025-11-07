import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const allBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 199,
    condition: "Good",
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 249,
    condition: "Very Good",
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80",
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    price: 179,
    condition: "Good",
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
  },
  {
    id: 4,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    price: 229,
    condition: "Excellent",
    category: "Romance",
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80",
  },
  {
    id: 5,
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    price: 199,
    condition: "Good",
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80",
  },
  {
    id: 6,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    price: 349,
    condition: "Very Good",
    category: "Non-Fiction",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&q=80",
  },
  {
    id: 7,
    title: "Atomic Habits",
    author: "James Clear",
    price: 299,
    condition: "Excellent",
    category: "Self-Help",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
  },
  {
    id: 8,
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 179,
    condition: "Good",
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&q=80",
  },
];

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('status', 'available')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform database books to match the expected format
        const transformedBooks = data.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          condition: book.condition,
          category: book.category,
          image: book.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80", // Default image
        }));

        // Combine with static books for now
        setBooks([...allBooks, ...transformedBooks]);
      } catch (error: any) {
        toast.error("Failed to load books", {
          description: error.message || "Something went wrong.",
        });
        // Fallback to static books
        setBooks(allBooks);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || book.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Books</h1>
          <p className="text-muted-foreground">Discover your next favorite read from thousands of used books</p>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg p-4 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Fiction">Fiction</SelectItem>
                <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                <SelectItem value="Romance">Romance</SelectItem>
                <SelectItem value="Self-Help">Self-Help</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filteredBooks.map((book) => (
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
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{book.condition}</Badge>
                  <Badge variant="outline">{book.category}</Badge>
                </div>
                <p className="text-xl font-bold text-primary">₹{book.price}</p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link to={`/book/${book.id}`} className="flex-1">
                  <Button className="w-full" size="sm">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No books found. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Browse;
