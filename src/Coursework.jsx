import { ArrowUpRight, Plus } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { coursework } from "./courseworkData";
import "./coursework.css";

export default function Coursework() {
  return (
    <section className="coursework" id="coursework" aria-labelledby="coursework-title">
      <div className="coursework-heading">
        <div>
          <div className="label">FURTHER EXPLORATION / FOOD STUDIES</div>
          <h3 id="coursework-title">Selected <em>coursework.</em></h3>
        </div>
        <p>Smaller studies, wider perspectives.<br />Academic work from my Food Studies programme at SLU Alnarp.</p>
      </div>
      <div className="coursework-grid">
        {coursework.map((project, index) => (
          <article className="coursework-item" key={project.id}>
            <div className="coursework-meta">
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span>{project.format}</span>
            </div>
            <h4>{project.title}</h4>
            <p className="coursework-course">{project.course}</p>
            <p className="coursework-summary">{project.summary}</p>
            {project.role && <p className="coursework-role">{project.role}</p>}
            <div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
            <details className="coursework-details" onToggle={() => ScrollTrigger.refresh()}>
              <summary aria-label={`Approach and contribution: ${project.title}`}>
                Approach & contribution <Plus size={15} aria-hidden="true" />
              </summary>
              <div className="coursework-detail-copy">
                <p>{project.approach}</p>
                <p>{project.insight}</p>
                {project.team && <p className="coursework-team"><strong>Group authors</strong><br />{project.team}</p>}
              </div>
            </details>
            <a className="text-link coursework-report" href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Read report: ${project.title} (opens in a new tab)`}>
              Read report <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
