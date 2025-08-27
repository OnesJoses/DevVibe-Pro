"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronDown, Github, Linkedin, Mail, ExternalLink, Code, Palette, Smartphone, Globe, ArrowRight, Star } from 'lucide-react'
import Logo from '@/components/Logo'
import { useAuthStore } from '@/hooks/useAuthStore'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { projects as allProjects } from '@/lib/projects'

/**
 * Home page component for the portfolio website
 */
export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const [backendMessage, setBackendMessage] = useState<string>('Connecting to backend...')
  const navigate = useNavigate()
  const { user, isAuthenticated, hydrate, logout } = useAuthStore()
  const location = useLocation()

  useEffect(() => { hydrate() }, [hydrate])

  // Fetch a health status from the Django backend
  useEffect(() => {
    const DJANGO_BASE = (typeof window !== 'undefined' && (window as any).__VITE_DJANGO_API_BASE__) || 
                       (typeof process !== 'undefined' && process.env?.VITE_DJANGO_API_BASE) || 
                       'http://127.0.0.1:8000'
    fetch(`${DJANGO_BASE}/api/py/health`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setBackendMessage(data.status ? 'Backend is healthy' : 'Backend responded'))
      .catch(() => setBackendMessage('Backend is offline.'));
  }, []);

  // Show one-time notices passed via sessionStorage (e.g., after profile save)
  useEffect(() => {
    const n = sessionStorage.getItem('notice')
    if (n) {
      sessionStorage.removeItem('notice')
      setNotice(n)
      const t = setTimeout(() => setNotice(null), 4000)
      return () => clearTimeout(t)
    }
  }, [])

  const roles = [
    "Full Stack Developer",
    "UI/UX Designer", 
    "Digital Creator",
    "Problem Solver"
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Role rotation animation
  useEffect(() => {
    const roleInterval = setInterval(() => {
      setCurrentRoleIndex((prevIndex) => (prevIndex + 1) % roles.length)
    }, 3000)
    return () => clearInterval(roleInterval)
  }, [])

  // Smooth-scroll to section based on pathname (/about -> #about)
  useEffect(() => {
    const path = location.pathname.replace(/^\/+/, '') // remove leading slashes
    const section = path === '' ? 'home' : path
    const selector = `#${section}`
    const el = document.querySelector(selector)
    if (el) {
      // small timeout to ensure layout is ready
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }
  }, [location.pathname])

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'AI Guide', path: '/ai' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Contact', path: '/contact' }
  ]

  const services = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "Web Development",
      description: "Crafting scalable, high-performance web applications with cutting-edge technologies."
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "UI/UX Design",
      description: "Designing intuitive, beautiful interfaces that delight users and drive engagement."
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Development",
      description: "Building responsive, native-feeling mobile experiences for all platforms."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Digital Strategy",
      description: "Transforming ideas into digital solutions that make an impact and drive growth."
    }
  ]

  const projects = allProjects

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart Inc.",
      content: "Exceptional work! The platform exceeded our expectations and increased conversions by 40%. Their attention to detail and innovative approach is outstanding.",
  avatar: "https://i.pravatar.cc/128?img=12"
    },
    {
      name: "Michael Chen",
      role: "Marketing Director, BrandCo",
      content: "A true professional who delivers beyond expectations. Our brand transformation has been incredible, and user engagement has skyrocketed.",
  avatar: "https://i.pravatar.cc/128?img=32"
    },
    {
      name: "Emily Rodriguez",
      role: "Founder, StartupHub",
      content: "The mobile app they created is intuitive and has significantly improved user retention. Highly recommend for any digital project.",
  avatar: "https://i.pravatar.cc/128?img=48"
    }
  ]

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter)

  // Contact form submit: open default mail client with prefilled subject/body
  function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()
    const subject = String(data.get('subject') || 'Project inquiry').trim()
    const message = String(data.get('message') || '').trim()
    const lines = [
      name ? `Name: ${name}` : '',
      email ? `Email: ${email}` : '',
      '',
      message,
    ].filter(Boolean)
    const body = encodeURIComponent(lines.join('\n'))
    const mailto = `mailto:onesjoses5@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`
    window.location.href = mailto
  }

  return (
    <div className="min-h-screen bg-background">
      {notice && (
        <div role="status" aria-live="polite" className="fixed top-2 left-1/2 -translate-x-1/2 z-50">
          <div className="rounded-md bg-emerald-600 text-white px-4 py-2 shadow">
            {notice}
          </div>
        </div>
      )}
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex-shrink-0">
              <Link to="/" aria-label="Home">
                <Logo size={36} />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Account actions */}
            <div className="hidden md:flex items-center gap-2">
              {!isAuthenticated ? (
                <>
                  <Button asChild size="sm" variant="outline"><Link to="/login">Log in</Link></Button>
                  <Button asChild size="sm"><Link to="/register">Sign up</Link></Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline"><Link to="/profile">Profile</Link></Button>
                  <Button asChild size="sm" variant="ghost"><Link to="/settings">Settings</Link></Button>
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-input hover:bg-accent"
                    onClick={() => { logout(); navigate('/'); }}
                    aria-label="Log out"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Log out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Toggle menu"
                title="Toggle menu"
                aria-controls="mobile-nav"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden" id="mobile-nav">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/95 backdrop-blur-md">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t mt-2 pt-2 space-y-1">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Log in</Link>
                    <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Sign up</Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                    <Link to="/settings" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Settings</Link>
                    <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground" onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}>Log out</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Beautiful Background */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        
        {/* Animated Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')"></div>
        </div>

        {/* Floating Particles (CSS-driven to avoid inline styles) */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="particle absolute w-1 h-1 bg-white/30 rounded-full animate-float" />
          ))}
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="space-y-8">
            {/* Badge (links to contact) */}
            <Link to="/contact" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <div className="h-4 w-4 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white/90">Available for new projects</span>
            </Link>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                Hi, I'm <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Onesmus M.</span>
              </h1>
              <div className="text-2xl md:text-4xl text-white/80 font-light">
                <span className="inline-block min-w-[300px]">
                  {roles[currentRoleIndex]}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              I transform ideas into exceptional digital experiences. With a passion for clean code and beautiful design, 
              I craft solutions that not only look stunning but deliver measurable results.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 group">
                <Link to="/portfolio">
                  View My Work
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
                <Link to="/contact">Let's Connect</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="bg-white/15 text-white hover:bg-white/25">
                <Link to="/ai">Ask the AI</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-white/60">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">5+</div>
                <div className="text-white/60">Years</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-white/60">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <Link to="/about" aria-label="Scroll to About">
            <ChevronDown className="h-6 w-6 text-white/50" />
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold">About Me</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                I'm a passionate full-stack developer and UI/UX designer with over 5 years of experience creating digital solutions that drive results. My approach combines technical expertise with creative vision to deliver exceptional user experiences.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                I specialize in modern web technologies and have a keen eye for design. Whether it's building scalable web applications or crafting beautiful interfaces, I'm committed to delivering quality work that exceeds expectations.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Node.js', 'UI/UX Design', 'Tailwind CSS', 'Next.js', 'GraphQL', 'MongoDB'].map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button asChild variant="outline" size="sm" className="bg-transparent">
                  <a href="https://github.com/OnesJoses" target="_blank" rel="noreferrer noopener" aria-label="Visit my GitHub profile">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-transparent">
                  <a href="https://www.linkedin.com/in/onesmus-m-1a41a5372/" target="_blank" rel="noreferrer noopener" aria-label="Visit my LinkedIn profile">
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-30"></div>
                <Avatar className="h-80 w-80 relative">
                  <AvatarImage src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop" alt="Sunrise" className="object-cover" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">My Services</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded mx-auto"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                I offer comprehensive digital solutions to help your business thrive in the digital landscape
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Featured Portfolio</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded mx-auto"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A showcase of my recent work and creative projects
              </p>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {['all', 'web', 'design', 'mobile'].map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={activeFilter === filter ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'bg-transparent'}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm relative">
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{project.category}</span>
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                {/* Full-card internal link to project detail */}
                <Link to={`/project/${project.slug}`} className="absolute inset-0" aria-label={`Open ${project.title}`}></Link>
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Client Testimonials</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded mx-auto"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                What my clients say about working with me
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-0">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Let's Work Together</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded mx-auto"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Have a project in mind? I'd love to hear about it and help bring your ideas to life
              </p>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle>Send me a message</CardTitle>
                <CardDescription>
                  Fill out the form below and I'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-background"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-background"
                        placeholder="onesjoses5@gmail.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-background"
                      placeholder="Project inquiry"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                    <textarea
                      id="message"
                      rows={4}
                      name="message"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-background"
                      placeholder="Tell me about your project..."
                      required
                    ></textarea>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-3">
                <Logo size={28} />
                <span className="sr-only">Onesmus M.</span>
              </div>
              <p className="text-muted-foreground mt-2">© 2025 Onesmus M. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Link to="/ai" aria-label="AI Guide">AI</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <a href="https://github.com/OnesJoses" target="_blank" rel="noreferrer noopener" aria-label="GitHub">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <a href="https://www.linkedin.com/in/onesmus-m-1a41a5372/" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <a href="mailto:onesjoses5@gmail.com" aria-label="Email">
                  <Mail className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </footer>

  {/* Custom Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        /* Particle positions and timings */
        .particle:nth-child(1) { left: 5%; top: 12%; animation-delay: 0.2s; animation-duration: 7s; }
        .particle:nth-child(2) { left: 18%; top: 34%; animation-delay: 1.1s; animation-duration: 10s; }
        .particle:nth-child(3) { left: 28%; top: 22%; animation-delay: 0.6s; animation-duration: 8s; }
        .particle:nth-child(4) { left: 42%; top: 16%; animation-delay: 1.8s; animation-duration: 11s; }
        .particle:nth-child(5) { left: 60%; top: 10%; animation-delay: 0.9s; animation-duration: 9s; }
        .particle:nth-child(6) { left: 72%; top: 24%; animation-delay: 1.4s; animation-duration: 12s; }
        .particle:nth-child(7) { left: 85%; top: 20%; animation-delay: 0.3s; animation-duration: 7.5s; }
        .particle:nth-child(8) { left: 12%; top: 58%; animation-delay: 1.0s; animation-duration: 9.5s; }
        .particle:nth-child(9) { left: 30%; top: 62%; animation-delay: 0.5s; animation-duration: 8.5s; }
        .particle:nth-child(10){ left: 48%; top: 55%; animation-delay: 1.6s; animation-duration: 12.5s; }
        .particle:nth-child(11){ left: 66%; top: 68%; animation-delay: 0.7s; animation-duration: 10.5s; }
        .particle:nth-child(12){ left: 78%; top: 52%; animation-delay: 1.2s; animation-duration: 11.5s; }
        .particle:nth-child(13){ left: 90%; top: 60%; animation-delay: 0.4s; animation-duration: 9s; }
        .particle:nth-child(14){ left: 8%;  top: 80%; animation-delay: 1.9s; animation-duration: 13s; }
        .particle:nth-child(15){ left: 22%; top: 78%; animation-delay: 0.8s; animation-duration: 8.8s; }
        .particle:nth-child(16){ left: 38%; top: 84%; animation-delay: 1.3s; animation-duration: 10.8s; }
        .particle:nth-child(17){ left: 54%; top: 78%; animation-delay: 0.1s; animation-duration: 7.2s; }
        .particle:nth-child(18){ left: 70%; top: 86%; animation-delay: 1.5s; animation-duration: 12.2s; }
        .particle:nth-child(19){ left: 82%; top: 74%; animation-delay: 0.6s; animation-duration: 9.2s; }
        .particle:nth-child(20){ left: 94%; top: 88%; animation-delay: 1.7s; animation-duration: 11.2s; }
  `}</style>
    </div>
  )
}
