import Link from 'next/link';
import { Plus } from 'lucide-react';
import { mockProjects, mockCategories, mockTasks } from '@/lib/mockData';
import ProjectCard from '@/components/projects/ProjectCard';

export default function ProjectsPage() {
  const catMap = Object.fromEntries(mockCategories.map((c) => [c.id, c]));

  const grouped = mockCategories.map((cat) => ({
    cat,
    projects: mockProjects.filter((p) => p.categoryId === cat.id),
  }));

  return (
    <div className="min-h-[calc(100dvh-64px)] px-4 pt-5 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-text-primary">Projects</h1>
        <button className="flex items-center gap-1.5 bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-accent-hover transition-colors">
          <Plus size={14} />
          New Project
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {grouped.map(({ cat, projects }) => (
          projects.length === 0 ? null : (
            <section key={cat.id}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {cat.name}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    category={cat}
                    tasks={mockTasks}
                  />
                ))}
              </div>
            </section>
          )
        ))}
      </div>
    </div>
  );
}
