import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DashboardDemo() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 45231.89,
    totalUsers: 12543,
    totalOrders: 2847,
    conversionRate: 3.24
  })

  const [recentActivity] = useState([
    { id: 1, user: 'Alice Johnson', action: 'Made a purchase', amount: '$299.99', time: '2 minutes ago' },
    { id: 2, user: 'Bob Smith', action: 'Signed up', amount: '-', time: '5 minutes ago' },
    { id: 3, user: 'Carol Davis', action: 'Updated profile', amount: '-', time: '8 minutes ago' },
    { id: 4, user: 'David Wilson', action: 'Made a purchase', amount: '$149.50', time: '12 minutes ago' },
    { id: 5, user: 'Emma Brown', action: 'Left a review', amount: '-', time: '15 minutes ago' }
  ])

  const [salesData] = useState([
    { month: 'Jan', sales: 4000, users: 240 },
    { month: 'Feb', sales: 3000, users: 198 },
    { month: 'Mar', sales: 5000, users: 320 },
    { month: 'Apr', sales: 4500, users: 290 },
    { month: 'May', sales: 6000, users: 410 },
    { month: 'Jun', sales: 5500, users: 380 }
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + Math.random() * 100,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        totalOrders: prev.totalOrders + Math.floor(Math.random() * 2)
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const MetricCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          {change > 0 ? (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className={change > 0 ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(change)}% from last month
          </span>
        </p>
      </CardContent>
    </Card>
  )

  const SimpleChart = ({ data, type }: { data: any[], type: 'sales' | 'users' }) => {
    const maxValue = Math.max(...data.map(d => d[type]))
    
    return (
      <div className="flex items-end space-x-2 h-32">
        {data.map((item, index) => {
          const height = (item[type] / maxValue) * 100
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-blue-600 rounded-t transition-all duration-300 hover:bg-blue-700"
                style={{ height: `${height}%` }}
                title={`${item.month}: ${item[type].toLocaleString()}`}
              />
              <span className="text-xs text-muted-foreground mt-1">{item.month}</span>
            </div>
          )
        })}
      </div>
    )
  }

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
              <h1 className="text-xl font-bold">Analytics Dashboard Demo</h1>
              <Badge variant="secondary">Live Demo</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live Data</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">Monitor your business metrics in real-time</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={metrics.totalRevenue}
            change={12.5}
            icon={DollarSign}
            prefix="$"
          />
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers}
            change={8.2}
            icon={Users}
          />
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders}
            change={-2.1}
            icon={ShoppingCart}
          />
          <MetricCard
            title="Conversion Rate"
            value={metrics.conversionRate}
            change={4.8}
            icon={BarChart3}
            suffix="%"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleChart data={salesData} type="sales" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly user acquisition</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleChart data={salesData} type="users" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount !== '-' && (
                      <p className="text-sm font-medium text-green-600">{activity.amount}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Notice */}
      <div className="fixed bottom-4 right-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-900">📊 This is a demo showcasing dashboard functionality</p>
            <p className="text-xs text-blue-700 mt-1">Features: Real-time metrics, data visualization, activity feeds</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
