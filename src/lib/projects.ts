export type Project = {
  slug: string
  title: string
  category: 'web' | 'design' | 'mobile'
  description: string
  image: string
  demoUrl?: string
  githubUrl?: string
  technologies?: string[]
}

export const projects: Project[] = [
  {
    slug: 'e-commerce-platform',
    title: 'E-Commerce Platform',
    category: 'web',
    description: 'Modern online store with payment integration and inventory management.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
    demoUrl: '/demo/ecommerce',
    technologies: ['React', 'Node.js', 'Stripe', 'MongoDB']
  },
  {
    slug: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    category: 'web',
    description: 'Real-time data visualization platform with interactive charts and insights.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    demoUrl: '/demo/dashboard',
    technologies: ['React', 'D3.js', 'TypeScript', 'Firebase']
  },
  {
    slug: 'mobile-banking-app',
    title: 'Mobile Banking App',
    category: 'mobile',
    description: 'Secure banking application with biometric authentication and real-time transactions.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop',
    demoUrl: '/demo/mobile-banking',
    technologies: ['React Native', 'Firebase', 'Biometric Auth']
  },
  {
    slug: 'restaurant-website',
    title: 'Restaurant Website',
    category: 'web',
    description: 'Responsive restaurant website with online ordering and reservation system.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=450&fit=crop',
    demoUrl: '/demo/restaurant',
    technologies: ['React', 'Tailwind CSS', 'Supabase']
  },
  {
    slug: 'brand-identity-design',
    title: 'Brand Identity Package',
    category: 'design',
    description: 'Complete brand identity including logo design, color palette, and style guide.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
    demoUrl: '/demo/branding',
    technologies: ['Figma', 'Adobe Creative Suite', 'Branding']
  },
  {
    slug: 'task-management-app',
    title: 'Task Management App',
    category: 'mobile',
    description: 'Collaborative project management tool with team features and real-time updates.',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=450&fit=crop',
    demoUrl: '/demo/task-manager',
    technologies: ['React', 'Real-time Sync', 'Team Collaboration']
  }
]
