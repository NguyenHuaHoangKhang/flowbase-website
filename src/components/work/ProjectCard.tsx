import type { Project } from '@/data/projects';
import MockDashboard from '@/components/ui/MockDashboard';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-card transition-all duration-[250ms] hover:-translate-y-1 hover:border-[#d6dbe3] hover:shadow-[0_16px_34px_-24px_rgba(17,19,24,.4)]">
      <div className="relative border-b border-border bg-gradient-to-b from-[#F3F5F8] to-[#FAFBFC] p-5">
        <span className="absolute right-3.5 top-3.5 z-[2] rounded-md bg-ink/85 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.08em] text-white">
          {project.label}
        </span>
        <MockDashboard screen={project.screen} />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="mb-2.5 block font-mono text-[11px] text-primary">{project.category}</span>
        <h3 className="mb-2.5 text-[21px]">{project.title}</h3>
        <p className="flex-1 text-[14.5px] text-muted">{project.description}</p>

        <div className="mt-[18px] flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[#F3F5F8] px-2.5 py-1 text-[11.5px] font-medium text-[#4b515c]"
            >
              {tag}
            </span>
          ))}
        </div>

        <a
          href="#case"
          className="mt-5 flex items-center gap-[7px] border-t border-border pt-[18px] text-[13.5px] font-semibold text-primary transition-all duration-[250ms] group-hover:gap-[11px]"
        >
          View case study →
        </a>
      </div>
    </article>
  );
}
