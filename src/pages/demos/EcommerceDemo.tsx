import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ShoppingCart, Star, Heart, Plus, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function EcommerceDemo() {
  const [cartItems, setCartItems] = useState<{[key: string]: number}>({})
  const [favorites, setFavorites] = useState<string[]>([])

  const products = [
    {
      id: '1',
      name: 'Wireless Headphones',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      rating: 4.5,
      description: 'Premium wireless headphones with noise cancellation'
    },
    {
      id: '2', 
      name: 'Smart Watch',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      rating: 4.8,
      description: 'Advanced fitness tracking and smart notifications'
    },
    {
      id: '3',
      name: 'Laptop Stand',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
      rating: 4.3,
      description: 'Ergonomic aluminum laptop stand with adjustable height'
    },
    {
      id: '4',
      name: 'Wireless Mouse',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop',
      rating: 4.6,
      description: 'Precision wireless mouse with customizable buttons'
    }
  ]

  const addToCart = (productId: string) => {
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const removeFromCart = (productId: string) => {
    setCartItems(prev => {
      const newItems = {...prev}
      if (newItems[productId] > 1) {
        newItems[productId]--
      } else {
        delete newItems[productId]
      }
      return newItems
    })
  }

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const totalItems = Object.values(cartItems).reduce((sum, count) => sum + count, 0)

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
              <h1 className="text-xl font-bold">TechStore Demo</h1>
              <Badge variant="secondary">Live Demo</Badge>
            </div>
            <div className="relative">
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({totalItems})
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Premium Tech Products</h2>
          <p className="text-xl opacity-90 mb-8">Discover the latest in technology and innovation</p>
          <Button size="lg" variant="secondary">
            Shop Now
          </Button>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold mb-8">Featured Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-white hover:text-red-500"
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">({product.rating})</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold">${product.price}</span>
                  </div>
                  {cartItems[product.id] ? (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => removeFromCart(product.id)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium">{cartItems[product.id]}</span>
                      <Button variant="outline" size="sm" onClick={() => addToCart(product.id)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={() => addToCart(product.id)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Free Shipping</h4>
              <p className="text-muted-foreground">Free shipping on orders over $100</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Premium Quality</h4>
              <p className="text-muted-foreground">Only the highest quality products</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Customer Support</h4>
              <p className="text-muted-foreground">24/7 customer support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Notice */}
      <div className="fixed bottom-4 right-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-900">🚀 This is a demo showcasing e-commerce functionality</p>
            <p className="text-xs text-blue-700 mt-1">Features: Product catalog, cart management, favorites, responsive design</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
