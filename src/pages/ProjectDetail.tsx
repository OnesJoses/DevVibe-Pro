import { useParams, Link } from 'react-router'
import { projects } from '@/lib/projects'
import { Button } from '@/components/ui/button'

export default function ProjectDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const project = projects.find(p => p.slug === slug)

  if (!project) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">Project not found</h1>
        <p className="text-muted-foreground mb-4">We couldn't find that project.</p>
        <Button asChild variant="outline"><Link to="/portfolio">Back to Portfolio</Link></Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <Button asChild variant="outline"><Link to="/portfolio">Back</Link></Button>
      </div>
      <div className="aspect-video overflow-hidden rounded-lg border">
        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
      </div>
      <p className="text-lg text-muted-foreground mt-4">{project.description}</p>
    </div>
  )
}
