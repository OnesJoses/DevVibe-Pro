export type Project = {
  slug: string
  title: string
  category: 'web' | 'design' | 'mobile'
  description: string
  image: string
}

export const projects: Project[] = [
  {
    slug: 'e-commerce-revolution',
    title: 'E-Commerce Revolution',
    category: 'web',
    description: 'Next-gen shopping platform with AI-powered recommendations and seamless checkout.',
    image: 'https://picsum.photos/id/1015/800/450',
  },
  {
    slug: 'analytics-dashboard-pro',
    title: 'Analytics Dashboard Pro',
    category: 'design',
    description: 'Real-time data visualization platform for business intelligence and insights.',
    image: 'https://picsum.photos/id/1025/800/450',
  },
  {
    slug: 'fintech-mobile-app',
    title: 'FinTech Mobile App',
    category: 'mobile',
    description: 'Secure, intuitive banking application with biometric authentication.',
    image: 'https://picsum.photos/id/1035/800/450',
  },
  {
    slug: 'creative-portfolio',
    title: 'Creative Portfolio',
    category: 'web',
    description: 'Immersive portfolio showcase for digital artists and designers.',
    image: 'https://picsum.photos/id/1045/800/450',
  },
  {
    slug: 'travel-platform',
    title: 'Travel Platform',
    category: 'web',
    description: 'Comprehensive travel booking experience with virtual tours and local guides.',
    image: 'https://picsum.photos/id/1055/800/450',
  },
  {
    slug: 'health-and-fitness',
    title: 'Health & Fitness',
    category: 'mobile',
    description: 'AI-powered fitness coach with personalized workout and nutrition plans.',
    image: 'https://picsum.photos/id/1065/800/450',
  },
]
