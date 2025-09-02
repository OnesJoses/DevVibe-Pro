import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, MapPin, Phone, Star, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function RestaurantDemo() {
  const [selectedCategory, setSelectedCategory] = useState('appetizers')
  const [cart, setCart] = useState<{[key: string]: number}>({})

  const categories = [
    { id: 'appetizers', name: 'Appetizers' },
    { id: 'mains', name: 'Main Dishes' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'drinks', name: 'Beverages' }
  ]

  const menuItems = {
    appetizers: [
      { id: '1', name: 'Truffle Arancini', description: 'Crispy risotto balls with truffle oil and parmesan', price: 16, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop' },
      { id: '2', name: 'Burrata Caprese', description: 'Fresh burrata with heirloom tomatoes and basil', price: 18, image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=300&h=200&fit=crop' }
    ],
    mains: [
      { id: '3', name: 'Grilled Salmon', description: 'Atlantic salmon with roasted vegetables and lemon butter', price: 28, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop' },
      { id: '4', name: 'Ribeye Steak', description: 'Dry-aged ribeye with garlic mashed potatoes', price: 42, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop' }
    ],
    desserts: [
      { id: '5', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with vanilla ice cream', price: 12, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&h=200&fit=crop' },
      { id: '6', name: 'Tiramisu', description: 'Classic Italian dessert with espresso and mascarpone', price: 10, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop' }
    ],
    drinks: [
      { id: '7', name: 'Craft Cocktail', description: 'Signature cocktail with premium spirits', price: 14, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300&h=200&fit=crop' },
      { id: '8', name: 'Wine Selection', description: 'Curated wine by the glass', price: 12, image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=200&fit=crop' }
    ]
  }

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }))
  }

  const totalItems = Object.values(cart).reduce((sum, count) => sum + count, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-semibold">Back to Portfolio</span>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Bella Vista Restaurant</h1>
              <Badge variant="secondary">Live Demo</Badge>
            </div>
            <Button variant="outline" size="sm">
              Cart ({totalItems})
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop)'}}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h2 className="text-5xl font-bold mb-4">Bella Vista</h2>
            <p className="text-xl mb-6">Authentic Italian cuisine in the heart of the city</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Main Street, City</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Mon-Sun: 5PM - 11PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-6">Our Story</h3>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Since 1987, Bella Vista has been serving authentic Italian cuisine crafted from the finest ingredients. 
            Our passionate chefs bring traditional recipes from Italy to create an unforgettable dining experience.
          </p>
          <div className="flex items-center justify-center mt-6 gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-muted-foreground">4.8/5 (324 reviews)</span>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Our Menu</h3>
            <p className="text-lg text-muted-foreground">Discover our carefully crafted dishes</p>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems[selectedCategory as keyof typeof menuItems].map((item) => (
              <Card key={item.id} className="flex overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="w-32 h-32 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <span className="text-lg font-bold text-green-600">${item.price}</span>
                  </div>
                  <CardDescription className="mb-4">{item.description}</CardDescription>
                  <Button
                    size="sm"
                    onClick={() => addToCart(item.id)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Add to Order
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Make a Reservation</CardTitle>
              <CardDescription>Book your table for an unforgettable dining experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <select className="w-full px-3 py-2 border rounded-md bg-background">
                    <option>5:00 PM</option>
                    <option>6:00 PM</option>
                    <option>7:00 PM</option>
                    <option>8:00 PM</option>
                    <option>9:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Guests</label>
                  <select className="w-full px-3 py-2 border rounded-md bg-background">
                    <option>2 guests</option>
                    <option>3 guests</option>
                    <option>4 guests</option>
                    <option>5+ guests</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" placeholder="Your name" className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="tel" placeholder="Your phone number" className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
              </div>
              <Button className="w-full" size="lg">
                Make Reservation
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo Notice */}
      <div className="fixed bottom-4 right-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-900">🍽️ This is a demo showcasing restaurant website functionality</p>
            <p className="text-xs text-blue-700 mt-1">Features: Menu display, online ordering, reservations, responsive design</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
