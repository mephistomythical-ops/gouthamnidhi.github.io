import { useRef, useEffect, useId } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export default function ProjectArt({ type }) {
  const ref = useRef();
  const uid = useId().replace(/:/g, "");
  useEffect(() => {
    const el = ref.current;
    if (!["grain", "lca"].includes(type)) return;
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
      () => {
        const move = (e) => {
          const r = el.getBoundingClientRect(),
            x = (e.clientX - r.left) / r.width - 0.5,
            y = (e.clientY - r.top) / r.height - 0.5;
          el.style.setProperty("--tilt-x", `${-y * 4}deg`);
          el.style.setProperty("--tilt-y", `${x * 5}deg`);
          el.style.setProperty("--light-x", `${50 + x * 30}%`);
          el.style.setProperty("--light-y", `${40 + y * 30}%`);
        };
        const leave = () => {
          el.style.setProperty("--tilt-x", "0deg");
          el.style.setProperty("--tilt-y", "0deg");
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        if (!el.closest("dialog"))
          gsap.fromTo(
            el.querySelector(".art-depth"),
            { y: 12 },
            {
              y: -12,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.4,
              },
            },
          );
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
          leave();
        };
      },
    );
    return () => media.revert();
  }, [type]);
  return (
    <div ref={ref} className={`project-art art-${type}`} aria-hidden="true">
      <div className="art-depth">
        <svg viewBox="0 0 600 420" fill="none">
          <defs>
            <linearGradient
              id={`g-${uid}`}
              x1="100"
              y1="30"
              x2="470"
              y2="390"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={type === "lca" ? "#adc6cd" : "#c0c2a2"} />
              <stop
                offset="1"
                stopColor={type === "garden" ? "#697857" : "#7f8e72"}
              />
            </linearGradient>
            <radialGradient id={`s-${uid}`}>
              <stop stopColor="#476249" stopOpacity=".18" />
              <stop offset="1" stopColor="#476249" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="305" cy="338" rx="220" ry="46" fill={`url(#s-${uid})`} />
          {type === "grain" ? (
            <g transform="translate(300 220) rotate(-24)">
              {Array.from({ length: 9 }, (_, i) => (
                <g
                  key={i}
                  transform={`translate(${(i - 4) * 27} ${Math.abs(i - 4) * 10}) rotate(${(i - 4) * 6})`}
                >
                  <path
                    d="M0 140 Q-12 0 0 -130"
                    stroke="#777851"
                    strokeWidth="2"
                  />
                  {Array.from({ length: 6 }, (_, j) => (
                    <g key={j} transform={`translate(0 ${-110 + j * 28})`}>
                      <ellipse
                        cx="-12"
                        cy="0"
                        rx="10"
                        ry="23"
                        transform="rotate(-35 -12 0)"
                        fill={j % 2 ? "#b8b181" : "#c7bd8e"}
                      />
                      <ellipse
                        cx="11"
                        cy="13"
                        rx="9"
                        ry="23"
                        transform="rotate(35 11 13)"
                        fill="#aaa475"
                      />
                    </g>
                  ))}
                </g>
              ))}
            </g>
          ) : type === "garden" ? (
            <g transform="translate(300 215)">
              <path d="M-200 35 0-105 200 10 0 155Z" fill="#b4ac92" />
              {Array.from({ length: 5 }, (_, i) => (
                <g
                  key={i}
                  transform={`translate(${(i - 2) * 31} ${(i - 2) * 20 + 15})`}
                >
                  <path
                    d="M-105 5 40-85 65-70-80 20Z"
                    fill={i % 2 ? "#526f4e" : "#8d9c69"}
                  />
                  {Array.from({ length: 8 }, (_, j) => (
                    <ellipse
                      key={j}
                      cx={-88 + j * 19}
                      cy={4 - j * 11}
                      rx="7"
                      ry="10"
                      fill={j % 2 ? "#afbd89" : "#758e61"}
                    />
                  ))}
                </g>
              ))}
              <path d="M-200 35V55L0 176 200 31V10L0 155Z" fill="#95836c" />
            </g>
          ) : type === "lund" ? (
            <g>
              {[
                [180, 185],
                [320, 130],
                [420, 245],
                [275, 290],
                [130, 285],
              ].map(([x, y], i) => (
                <g key={i}>
                  <path
                    d={`M300 210 Q${x + 30} ${210} ${x} ${y}`}
                    stroke="#78886d"
                    strokeDasharray="3 7"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={i % 2 ? 38 : 28}
                    fill={i % 2 ? "#8f9c7c" : "#b5bf9e"}
                  />
                  <path
                    d={`M${x - 12} ${y + 6} v-16 l12-10 12 10v16z`}
                    fill="#e9e9da"
                  />
                </g>
              ))}
              <circle cx="300" cy="210" r="46" fill="#465d48" />
              <path
                d="M280 216v-23l20-13 20 13v23m-40-18h40"
                stroke="#e1e1c9"
                strokeWidth="2"
              />
            </g>
          ) : type === "lca" ? (
            <g transform="translate(300 210)">
              {Array.from({ length: 6 }, (_, i) => {
                let a = (i * Math.PI) / 3,
                  x = Math.cos(a) * 127,
                  y = Math.sin(a) * 112;
                return (
                  <g key={i}>
                    <path
                      d={`M${x} ${y} Q0 0 ${Math.cos(a + Math.PI / 3) * 127} ${Math.sin(a + Math.PI / 3) * 112}`}
                      stroke="#7695a0"
                      strokeWidth="1"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={25 + i * 2}
                      fill={i % 2 ? "#bdc9c1" : "#8faeb6"}
                      stroke="#e5e9e3"
                      strokeWidth="3"
                    />
                  </g>
                );
              })}
              <circle r="57" fill="#dce1d4" />
              <path
                d="M-18 0 0-25 18 0 0 25Z"
                stroke="#72918b"
                strokeWidth="2"
              />
            </g>
          ) : (
            <g transform="translate(300 220)">
              {Array.from({ length: 15 }, (_, i) => (
                <path
                  key={i}
                  d={`M${-225 + i * 3} ${70 - i * 9} Q-110 ${-100 - i * 4} 0 ${-20 - i * 8} T${210 - i * 4} ${-65 + i * 9}`}
                  stroke={i % 3 ? "#899b7b" : "#b8b689"}
                  strokeWidth={i % 3 ? 3 : 8}
                />
              ))}
              <circle cx="120" cy="-80" r="32" fill="#c5b57d" />
            </g>
          )}
        </svg>
      </div>
      <span className="art-caption">
        {
          {
            grain: "01 / AGRICULTURAL FUTURES",
            garden: "02 / PRODUCTIVE LANDSCAPES",
            lund: "03 / CONNECTED COMMUNITIES",
            lca: "04 / RESOURCE FLOWS",
            foodscapes: "05 / CHANGING FOODSCAPES",
          }[type]
        }
      </span>
    </div>
  );
}
