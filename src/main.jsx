import React, {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  Download,
  Menu,
  X,
  Plus,
  Minus,
  Pause,
  Play,
  ChevronRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  projects,
  experience,
  education,
  stages,
  reports,
  linkedin,
  email,
} from "./content";
import ProjectArt from "./ProjectArt";
import "./styles.css";
import "@fontsource-variable/dm-sans/wght.css";
import "@fontsource/libre-caslon-display/latin-400.css";
import "./readability.css";
import "./motion.css";
const Ecosystem = lazy(() => import("./Ecosystem"));
gsap.registerPlugin(ScrollTrigger);
const external = { target: "_blank", rel: "noopener noreferrer" };
function Ext({ href, children, className = "" }) {
  return (
    <a href={href} {...external} className={className}>
      {children}
      <ArrowUpRight size={17} />
    </a>
  );
}
function Label({ children }) {
  return <div className="label">{children}</div>;
}
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function StaticSpecimen() {
  return (
    <div className="static-specimen" aria-hidden="true">
      <div className="static-land" />
      <div className="static-water" />
      <div className="static-soil" />
      <div className="static-orbit" />
    </div>
  );
}
function App() {
  const [menu, setMenu] = useState(false),
    [focus, setFocus] = useState("all"),
    [filter, setFilter] = useState("All work"),
    [selected, setSelected] = useState(null),
    [stage, setStage] = useState(0),
    [tab, setTab] = useState("Experience"),
    [reduced, setReduced] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [paused, setPaused] = useState(false),
    [visible, setVisible] = useState(true),
    [gpu, setGpu] = useState(true);
  const progress = useRef(0),
    motionTarget = useRef({ phase: 0 }),
    manualPerspective = useRef(false),
    pauseState = useRef(false),
    story = useRef(),
    scene = useRef(),
    dialog = useRef(),
    lastFocus = useRef(),
    nav = useRef();
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(mq.matches);
    mq.addEventListener("change", change);
    const vis = () => {
      const rect = scene.current.getBoundingClientRect();
      setVisible(!document.hidden && rect.bottom > 0 && rect.top < innerHeight);
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      mq.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2");
      setGpu(!!gl);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setGpu(false);
    }
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && !document.hidden),
      { rootMargin: "100px" },
    );
    observer.observe(scene.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const media = gsap.matchMedia();
      if (!reduced && gpu)
        media.add("(min-width: 761px)", () => {
          gsap.fromTo(
            motionTarget.current,
            { phase: 0 },
            {
              phase: 4,
              ease: "none",
              scrollTrigger: {
                trigger: story.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.15,
                invalidateOnRefresh: true,
              },
              onUpdate: () => {
                if (pauseState.current || manualPerspective.current) return;
                const p = motionTarget.current.phase;
                progress.current = p;
                setFocus(
                  p < 0.65
                    ? "all"
                    : p < 1.65
                      ? "food"
                      : p < 2.65
                        ? "environment"
                        : p < 3.65
                          ? "people"
                          : "lifecycle",
                );
              },
            },
          );
        });
      if (!reduced) {
        gsap.fromTo(
          ".hero-copy h1",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.25, ease: "power3.out" },
        );
        gsap.utils.toArray(".reveal").forEach((el) =>
          gsap.fromTo(
            el,
            { y: 25, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 94%", once: true },
            },
          ),
        );
      }
    });
    return () => ctx.revert();
  }, [reduced, gpu]);
  useEffect(() => {
    pauseState.current = paused;
  }, [paused]);
  useEffect(() => {
    const resume = () => {
      manualPerspective.current = false;
    };
    window.addEventListener("scroll", resume, { passive: true });
    return () => window.removeEventListener("scroll", resume);
  }, []);
  useEffect(() => {
    if (reduced || paused) return;
    const tween = gsap.fromTo(
      ".lens-content",
      { opacity: 0.45, y: 9 },
      { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" },
    );
    return () => tween.kill();
  }, [focus, reduced, paused]);
  function choosePerspective(value) {
    manualPerspective.current = true;
    setFocus(value);
    progress.current = {
      all: 0,
      food: 1,
      environment: 2,
      people: 3,
      lifecycle: 4,
    }[value];
  }
  useEffect(() => {
    if (selected) {
      lastFocus.current = document.activeElement;
      dialog.current.showModal();
      document.body.style.overflow = "hidden";
    } else {
      if (dialog.current?.open) dialog.current.close();
      document.body.style.overflow = "";
      lastFocus.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);
  useEffect(() => {
    if (!menu) return;
    const escape = (e) => {
      if (e.key === "Escape") {
        setMenu(false);
        document.querySelector(".menu-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [menu]);
  const lenses = {
    all: [
      "Everything is connected.",
      "Food, people and the environment are parts of the same living system. Understanding their relationships is where meaningful change begins.",
    ],
    food: [
      "Food is more than a product.",
      "From fields to processing and local markets, I explore the choices and policies that shape resilient food systems.",
    ],
    environment: [
      "Follow the resource flows.",
      "Life cycle thinking connects inputs, processes and outputs, making environmental questions visible across a value chain.",
    ],
    people: [
      "People belong in the picture.",
      "Foodscapes are shaped by culture, access and community. Social context gives environmental research its purpose.",
    ],
    lifecycle: [
      "Every product is part of a longer story.",
      "Follow the whole system. Make boundaries explicit. Let evidence guide the conclusions.",
    ],
  };
  const filtered = projects.filter(
    (p) => filter === "All work" || p.type === filter,
  );
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Goutham Nidhi home">
          <span className="monogram">
            gn<span>.</span>
          </span>
          <span>
            Goutham Nidhi<small>FOOD SYSTEMS & SUSTAINABILITY</small>
          </span>
        </a>
        <button
          className="menu-toggle"
          aria-expanded={menu}
          aria-controls="navigation"
          aria-label={menu ? "Close menu" : "Open menu"}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
        <nav
          ref={nav}
          id="navigation"
          aria-label="Main navigation"
          className={menu ? "open" : ""}
        >
          {[
            ["Selected work", "work"],
            ["About", "about"],
            ["Journey", "journey"],
            ["Research", "research"],
          ].map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
              {label}
            </a>
          ))}
          <a
            className="nav-contact"
            href="#contact"
            onClick={() => setMenu(false)}
          >
            Let’s connect <ArrowUpRight size={16} />
          </a>
        </nav>
      </header>
      <main id="main">
        <div
          className={`story ${reduced || !gpu ? "motion-reduced" : ""}`}
          id="top"
          ref={story}
          data-perspective={focus}
        >
          <section className="hero-copy" aria-labelledby="hero-title">
            <div className="eyebrow">
              <span className="status-dot" /> FOOD SYSTEMS · SUSTAINABILITY ·
              RESEARCH
            </div>
            <h1 id="hero-title">
              Understanding
              <br />
              systems.
              <br />
              <em>Growing</em>
              <br />
              <em>resilience.</em>
            </h1>
            <p className="hero-role">
              Goutham Nidhi
              <br />
              <span>
                Food Systems Researcher & Sustainability / LCA Analyst
              </span>
            </p>
            <p className="hero-description">
              Connecting science, policy and people
              <br className="desktop-break" /> for a more resilient food future.
            </p>
            <div className="actions">
              <a className="button primary" href="#work">
                Explore my work <ArrowDown size={17} />
              </a>
              <a className="text-link" href="./goutham-nidhi-cv.pdf" download>
                Download CV <Download size={16} />
              </a>
            </div>
            <div className="hero-location">
              <span>MALMÖ, SWEDEN / ROOTED IN KERALA</span>
              <span>
                Open to opportunities <span className="tiny-dot" />
              </span>
            </div>
          </section>
          <div className="scene-column">
            <div className="scene-sticky" ref={scene}>
              <div className="scene-topline">
                <span>FIELD NOTES / 001</span>
                <span>
                  {
                    {
                      all: "A LIVING SYSTEM",
                      food: "01 / FOOD SYSTEMS",
                      environment: "02 / ENVIRONMENT",
                      people: "03 / PEOPLE",
                      lifecycle: "04 / LIFE CYCLE",
                    }[focus]
                  }
                </span>
              </div>
              <div
                className="scene-canvas"
                role="img"
                aria-label="Abstract ecosystem sculpture with cultivated green terrain, a translucent water layer, soil and connecting resource flows"
              >
                {gpu && !reduced ? (
                  <SceneBoundary fallback={<StaticSpecimen />}>
                    <Suspense fallback={<StaticSpecimen />}>
                      <Ecosystem
                        progress={progress}
                        paused={paused || !visible}
                        onError={() => setGpu(false)}
                      />
                    </Suspense>
                  </SceneBoundary>
                ) : (
                  <StaticSpecimen />
                )}
              </div>
              <div className="specimen-label label-land">
                <i /> {focus === "people" ? "SHARED RESOURCES" : "CULTIVATION"}
              </div>
              <div className="specimen-label label-water">
                <i />{" "}
                {focus === "lifecycle" ? "CIRCULAR PATHWAYS" : "RESOURCE FLOWS"}
              </div>
              <div className="specimen-label label-soil">
                <i /> LIVING FOUNDATIONS
              </div>
              <div className="scene-bottom">
                <span className="scene-chapters" aria-hidden="true">
                  {["food", "environment", "people", "lifecycle"].map(
                    (v, i) => (
                      <i key={v} className={focus === v ? "active" : ""}>
                        <b>0{i + 1}</b>
                        <span>
                          {v === "lifecycle" ? "LIFE CYCLE" : v.toUpperCase()}
                        </span>
                      </i>
                    ),
                  )}
                </span>
                {gpu && !reduced && (
                  <button
                    onClick={() => setPaused(!paused)}
                    aria-label={paused ? "Play animation" : "Pause animation"}
                  >
                    {paused ? <Play size={13} /> : <Pause size={13} />}{" "}
                    {paused ? "Play motion" : "Pause motion"}
                  </button>
                )}
              </div>
            </div>
          </div>
          <section className="systems-copy" aria-labelledby="systems-title">
            <div className="systems-inner">
              <Label>01 / A CONNECTED PERSPECTIVE</Label>
              <h2 id="systems-title">
                One system.
                <br />
                <em>Many relationships.</em>
              </h2>
              <div
                className="lens-tabs"
                role="group"
                aria-label="Explore ecosystem perspectives"
              >
                {["all", "food", "environment", "people", "lifecycle"].map(
                  (f) => (
                    <button
                      key={f}
                      aria-pressed={f === focus}
                      onClick={() => choosePerspective(f)}
                    >
                      {f === "all"
                        ? "Whole system"
                        : f === "lifecycle"
                          ? "Life cycle"
                          : f[0].toUpperCase() + f.slice(1)}
                    </button>
                  ),
                )}
              </div>
              <div className="lens-content" aria-live="polite">
                <h3>{lenses[focus][0]}</h3>
                <p>{lenses[focus][1]}</p>
              </div>
              <span className="quiet-note">
                An abstract view of interconnected systems.
              </span>
              <div className="story-progress" aria-hidden="true">
                <span>
                  {
                    {
                      all: "00",
                      food: "01",
                      environment: "02",
                      people: "03",
                      lifecycle: "04",
                    }[focus]
                  }
                </span>
                <i>
                  <b
                    style={{
                      transform: `scaleX(${{ all: 0, food: 0.25, environment: 0.5, people: 0.75, lifecycle: 1 }[focus]})`,
                    }}
                  />
                </i>
                <span>04</span>
              </div>
              <a
                className="text-link story-next"
                href={focus === "lifecycle" ? "#approach" : "#work"}
              >
                {focus === "lifecycle"
                  ? "Explore life cycle thinking"
                  : "Explore the research"}{" "}
                <ArrowDown size={14} />
              </a>
            </div>
          </section>
        </div>
        <div className="discipline-strip">
          <span>FOOD SYSTEMS</span>
          <i>↗</i>
          <span>LIFE CYCLE THINKING</span>
          <i>↗</i>
          <span>SCENARIO MODELLING</span>
          <i>↗</i>
          <span>HUMAN CONTEXT</span>
        </div>
        <section className="section work-section" id="work">
          <div className="section-heading reveal">
            <div>
              <Label>02 / SELECTED WORK</Label>
              <h2>
                Research with
                <br />
                <em>real-world roots.</em>
              </h2>
            </div>
            <p>
              From a single ingredient to an entire foodscape.
              <br />A selection of questions I’ve worked on.
            </p>
          </div>
          <div
            className="work-filters"
            role="group"
            aria-label="Filter selected work"
          >
            {["All work", "Food systems", "LCA & environment", "Research"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                >
                  {f}
                  <span>
                    {f === "All work"
                      ? "05"
                      : String(
                          projects.filter((p) => p.type === f).length,
                        ).padStart(2, "0")}
                  </span>
                </button>
              ),
            )}
          </div>
          <div className="project-list" aria-live="polite">
            {filtered.map((p) => (
              <article key={p.id} className="project-row">
                <button
                  className="art-button"
                  onClick={() => setSelected(p)}
                  aria-label={`Explore ${p.subtitle}`}
                >
                  <ProjectArt type={p.art} />
                  <span className="art-open">
                    <ArrowUpRight size={25} />
                  </span>
                </button>
                <div className="project-copy">
                  <Label>{p.meta}</Label>
                  <h3>
                    {p.title.split("\n").map((t, i) => (
                      <React.Fragment key={t}>
                        {i > 0 && <br />}
                        {t}
                      </React.Fragment>
                    ))}
                  </h3>
                  <h4>{p.subtitle}</h4>
                  <p>{p.summary}</p>
                  <div className="tags">
                    {p.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <button
                    className="text-link case-link"
                    onClick={() => setSelected(p)}
                  >
                    Explore case study <ArrowUpRight size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="lifecycle-section" id="approach">
          <div className="section-heading reveal">
            <div>
              <Label>03 / LIFE CYCLE THINKING</Label>
              <h2>
                A wider lens.
                <br />
                <em>A clearer picture.</em>
              </h2>
            </div>
            <p>
              Every product is part of a longer story.
              <br />
              Explore the stages to see the questions behind an assessment.
            </p>
          </div>
          <div
            className="lifecycle-nav"
            role="tablist"
            aria-label="Life cycle stages"
          >
            {stages.map((s, i) => (
              <button
                key={s[0]}
                id={`stage-tab-${i}`}
                role="tab"
                aria-selected={stage === i}
                aria-controls="stage-panel"
                tabIndex={stage === i ? 0 : -1}
                onKeyDown={(e) => {
                  if (
                    ["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)
                  ) {
                    e.preventDefault();
                    const next =
                      e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? 5
                          : (stage + (e.key === "ArrowRight" ? 1 : 5)) % 6;
                    setStage(next);
                    document.getElementById(`stage-tab-${next}`)?.focus();
                  }
                }}
                onClick={() => setStage(i)}
              >
                <span className="stage-number">0{i + 1}</span>
                <span>{s[0]}</span>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
          <div
            className="stage-panel"
            role="tabpanel"
            id="stage-panel"
            aria-labelledby={`stage-tab-${stage}`}
            tabIndex={0}
          >
            <div className="stage-orbit" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <i
                  key={i}
                  className={stage === i ? "active" : ""}
                  style={{ "--i": i }}
                />
              ))}
              <span>0{stage + 1}</span>
            </div>
            <div>
              <Label>{stages[stage][0]}</Label>
              <h3>{stages[stage][1]}</h3>
              <p>{stages[stage][2]}</p>
            </div>
            <div className="lca-note">
              <span>THE PRINCIPLE</span>
              <p>
                Follow the whole system.
                <br />
                Make boundaries explicit.
                <br />
                Let evidence guide the conclusions.
              </p>
              <small>
                Conceptual illustration — no environmental impact data is
                represented.
              </small>
              <Ext href={reports.lca} className="text-link">
                View my LCA proposal
              </Ext>
            </div>
          </div>
        </section>
        <section className="section about-section" id="about">
          <div className="portrait-composition reveal">
            <div className="portrait-frame">
              <img
                src="./portrait.webp"
                alt="Goutham Nidhi in a navy jacket and glasses"
                width="900"
                height="900"
                loading="lazy"
              />
            </div>
            <div className="portrait-caption">
              <span>GOUTHAM NIDHI</span>
              <span>Researcher. Systems thinker.</span>
            </div>
            <div className="portrait-stamp" aria-hidden="true">
              SCIENCE
              <br />
              <i>↗</i>
              <br />
              TO SYSTEMS
            </div>
          </div>
          <div className="about-copy reveal">
            <Label>04 / THE PERSON BEHIND THE WORK</Label>
            <h2>
              From cellular systems
              <br />
              <em>to food systems.</em>
            </h2>
            <p className="large-copy">
              I’m interested in how things connect — and what those connections
              can tell us about a better future.
            </p>
            <p>
              My path began in biotechnology, studying cells, proteins and
              cancer biology. Food studies brought that scientific curiosity
              into a wider landscape: the ways we grow, move and consume food.
            </p>
            <p>
              Today, I bring together life cycle assessment, scenario modelling
              and food policy. From Sweden’s oat value chains to Kerala’s
              changing foodscapes, I connect scientific detail with the
              decisions that shape everyday life.
            </p>
            <p>
              Based in Malmö, with roots in Kerala. Open to research, industry
              and consultancy opportunities in food systems, sustainability,
              environmental analysis, LCA and ESG.
            </p>
            <Ext href={linkedin} className="text-link">
              More about me on LinkedIn
            </Ext>
          </div>
        </section>
        <section className="section journey-section" id="journey">
          <div className="journey-intro reveal">
            <Label>05 / EXPERIENCE & EDUCATION</Label>
            <h2>
              A connected,
              <br />
              <em>evolving journey.</em>
            </h2>
            <p>
              Scientific rigour. A broader perspective.
              <br />A continuing curiosity about complex systems.
            </p>
            <a className="text-link" href="./goutham-nidhi-cv.pdf" download>
              Download full CV <Download size={16} />
            </a>
          </div>
          <div className="journey-content">
            <div
              className="journey-tabs"
              role="group"
              aria-label="Journey view"
            >
              {["Experience", "Education"].map((t) => (
                <button
                  key={t}
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div aria-live="polite">
              {(tab === "Experience" ? experience : education).map(
                ([date, title, place, description]) => (
                  <article className="journey-item" key={title}>
                    <time>{date}</time>
                    <div>
                      <h3>{title}</h3>
                      <span>{place}</span>
                      {description && <p>{description}</p>}
                    </div>
                  </article>
                ),
              )}
            </div>
            <details className="additional">
              <summary>
                Additional experience <Plus size={16} />
              </summary>
              <p>
                <b>2026 · Almanac / Mercor</b> — Freelance subject-matter expert
                and AI evaluator, assessing scientific reasoning and biological
                systems.
              </p>
              <p>
                <b>May 2026 · Foodora</b> — Delivery logistics.
              </p>
              <p>
                <b>Aug 2026 · Livi_n_wall</b> — Marketing launch and order
                workflows for a handmade art store.
              </p>
            </details>
          </div>
        </section>
        <section className="section research-section" id="research">
          <div className="section-heading reveal">
            <div>
              <Label>06 / RESEARCH & PUBLICATIONS</Label>
              <h2>
                Evidence,
                <br />
                <em>in writing.</em>
              </h2>
            </div>
            <p>
              From molecular mechanisms to changing landscapes.
              <br />
              Read the work behind the perspective.
            </p>
          </div>
          <div className="publication-feature reveal">
            <div>
              <span className="publication-kind">
                PEER-REVIEWED ARTICLE / 2025
              </span>
              <div className="publication-symbol" aria-hidden="true">
                ✳
              </div>
              <span className="journal">Frontiers in Immunology</span>
            </div>
            <div>
              <h3>
                Beyond boundaries: exploring the role of extracellular vesicles
                in organ-specific metastasis in solid tumors
              </h3>
              <p>Nidhi G, Yadav V, Singh T, Sharma D, Bohot M, Satapathy SR.</p>
              <p>
                A co-authored review exploring how extracellular vesicles
                contribute to organ-specific metastasis.
              </p>
              <Ext href={reports.publication} className="text-link">
                Read publication
              </Ext>
            </div>
          </div>
          <div className="theses">
            {[
              [
                "2025",
                "MASTER’S · FOOD STUDIES",
                "Evolution of Foodscapes: A Case Study from Kerala",
                reports.foodscapes,
              ],
              [
                "2022",
                "MASTER’S · BIOTECHNOLOGY",
                "Effect of Exosomes from Obese Adipocytes on Growth, Development and Metastasis of Breast Cancer Cells",
                reports.msc,
              ],
              [
                "2020",
                "BACHELOR’S · BOTANY & BIOTECHNOLOGY",
                "Isolation, Screening and Application of Protease Producing Organism from Soil",
                reports.bsc,
              ],
            ].map(([year, kind, title, url]) => (
              <a href={url} {...external} className="thesis" key={year}>
                <time>{year}</time>
                <div>
                  <Label>{kind}</Label>
                  <h3>{title}</h3>
                </div>
                <ArrowUpRight size={24} />
              </a>
            ))}
          </div>
        </section>
        <section className="section skills-section" id="methods">
          <div className="section-heading reveal">
            <div>
              <Label>07 / METHODS & TOOLKIT</Label>
              <h2>
                Different disciplines.
                <br />
                <em>Shared rigour.</em>
              </h2>
            </div>
          </div>
          <div className="skills-grid">
            {[
              [
                "01",
                "Systems & sustainability",
                [
                  "Food system analysis & policy",
                  "Life cycle assessment",
                  "Scenario modelling",
                  "Systems thinking & SDGs",
                ],
              ],
              [
                "02",
                "Research & analysis",
                [
                  "Research design",
                  "Data analysis & synthesis",
                  "Scientific writing",
                  "Molecular biology & cell culture",
                ],
              ],
              [
                "03",
                "Practice & collaboration",
                [
                  "Interdisciplinary collaboration",
                  "Project management",
                  "Microsoft Office",
                  "Canva",
                ],
              ],
            ].map(([n, title, items]) => (
              <div className="skill-column" key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <ul>
                  {items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="recognition">
            <span className="award-symbol" aria-hidden="true">
              ✳
            </span>
            <div>
              <Label>RECOGNITION / 2024</Label>
              <h3>ISHS Young Mind Award</h3>
              <p>Urban Farm 2024 · The Lingonträdgård Project</p>
            </div>
            <p>
              A proposal bringing together food production, rehabilitation and
              circular economy principles.
            </p>
          </div>
          <details className="certifications">
            <summary>
              Continued learning & certifications <Plus size={18} />
            </summary>
            <div className="cert-grid">
              {[
                [
                  "2025",
                  "Research Data Management and Sharing",
                  "University of Edinburgh",
                ],
                [
                  "2025",
                  "The New Nordic Diet: from Gastronomy to Health",
                  "University of Copenhagen",
                ],
                [
                  "2023",
                  "Dairy Production and Management",
                  "Penn State University",
                ],
                [
                  "2023",
                  "Machine Learning: Introduction for Everyone; Introduction to AI",
                  "IBM",
                ],
                ["2023", "Food & Beverage Management", "Università Bocconi"],
                [
                  "2023",
                  "Introduction to Food and Health; Antibiotic Stewardship; Writing in the Sciences (with Honors)",
                  "Stanford Online",
                ],
              ].map(([date, title, school]) => (
                <p key={title}>
                  <small>
                    {date} / {school}
                  </small>
                  {title}
                </p>
              ))}
            </div>
          </details>
        </section>
        <section className="contact-section" id="contact">
          <Label>08 / THE NEXT CONNECTION</Label>
          <div className="contact-heading">
            <h2>
              Let’s grow
              <br />
              <em>something better.</em>
            </h2>
            <a
              href={`mailto:${email}`}
              className="contact-arrow"
              aria-label="Email Goutham Nidhi"
            >
              <ArrowUpRight size={55} strokeWidth={1} />
            </a>
          </div>
          <div className="contact-bottom">
            <p>
              Open to roles and collaborations in food systems,
              <br />
              sustainability, environmental analysis, LCA and ESG.
              <br />
              <span>Malmö, Sweden · Open to relocation</span>
            </p>
            <div className="contact-links">
              <a href={`mailto:${email}`}>
                {email} <ArrowUpRight size={18} />
              </a>
              <Ext href={linkedin}>LinkedIn</Ext>
              <a href="tel:+46793505822">
                (+46) 793 505 822 <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <a className="footer-brand" href="#top">
          gn.
        </a>
        <span>© {new Date().getFullYear()} Goutham Nidhi</span>
        <span>FOOD. PEOPLE. PLANET.</span>
        <a href="#top">Back to top ↑</a>
      </footer>
      <dialog
        ref={dialog}
        className="case-dialog"
        onCancel={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setSelected(null);
        }}
        aria-labelledby="case-title"
      >
        {selected && (
          <>
            <div className="dialog-top">
              <Label>CASE STUDY / {selected.number}</Label>
              <button
                className="close-dialog"
                onClick={() => setSelected(null)}
                aria-label="Close case study"
                autoFocus
              >
                <X size={23} />
              </button>
            </div>
            <div className="dialog-body">
              <ProjectArt type={selected.art} />
              <Label>{selected.meta}</Label>
              <h2 id="case-title">{selected.subtitle}</h2>
              <div className="case-sections">
                <div>
                  <h3>The question</h3>
                  <p>{selected.context}</p>
                </div>
                <div>
                  <h3>My contribution</h3>
                  <p>{selected.contribution}</p>
                </div>
                <div>
                  <h3>Approach & scope</h3>
                  <p>{selected.method}</p>
                </div>
              </div>
              <div className="case-resources">
                {selected.links.map(([label, url]) => (
                  <Ext key={url} href={url} className="button primary">
                    {label}
                  </Ext>
                ))}
              </div>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
const appRoot =
  import.meta.hot?.data.root ?? createRoot(document.getElementById("root"));
if (import.meta.hot) import.meta.hot.data.root = appRoot;
appRoot.render(<App />);
