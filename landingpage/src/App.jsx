import { useState } from "react";
import {
  ArrowRight,
  Atom,
  Banknote,
  Cpu,
  Factory,
  Filter,
  HeartPulse,
  Layers,
  Minus,
  Plus,
  Users,
  Zap,
} from "lucide-react";

/** Swap this for your real Discord invite link. */
const DISCORD_INVITE = "https://discord.gg/whatsupmarket";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#coverage", label: "Coverage" },
  { href: "#faq", label: "FAQ" },
];

const BRIEF = [
  {
    sector: "Tech",
    title: "TSMC raises its outlook as demand for AI chips keeps climbing",
    why: "A useful read on how long the AI build-out can keep running.",
    source: "Reuters",
    time: "8 min ago",
  },
  {
    sector: "Nuclear",
    title: "Utility signs a 20-year power deal with a data center operator",
    why: "Another sign big tech is turning to nuclear for reliable power.",
    source: "Bloomberg",
    time: "32 min ago",
  },
  {
    sector: "Healthcare",
    title: "FDA clears a new obesity treatment ahead of schedule",
    why: "Competition in the weight-loss market is heating up fast.",
    source: "CNBC",
    time: "1 hr ago",
  },
];

const BENEFITS = [
  {
    icon: Filter,
    title: "Only what matters",
    copy: "Earnings, deals, major contracts and policy moves. Routine commentary and clickbait never make it in.",
  },
  {
    icon: Layers,
    title: "Organized by sector",
    copy: "Each story lands in its own channel, so you can follow tech, energy or healthcare without scrolling past the rest.",
  },
  {
    icon: Users,
    title: "A community to discuss it with",
    copy: "Talk through the news with 1,000+ members who follow the same stories you do.",
  },
];

const STEPS = [
  {
    title: "Join the server",
    copy: "One click from Discord. It's free, and there's nothing to install.",
  },
  {
    title: "Pick your sectors",
    copy: "Follow the channels you care about and mute the ones you don't.",
  },
  {
    title: "Stay informed",
    copy: "The day's important stories arrive as they break, each with a short note on why it matters.",
  },
];

const COVERAGE = [
  { icon: Cpu, name: "Tech", copy: "Chips, AI, cloud and the companies building them." },
  { icon: Atom, name: "Nuclear", copy: "Reactors, uranium and the new wave of nuclear power." },
  { icon: HeartPulse, name: "Healthcare", copy: "Drug approvals, biotech and major pharma deals." },
  { icon: Banknote, name: "Finance", copy: "Banks, rates, the Fed and the broader economy." },
  { icon: Zap, name: "Energy", copy: "Oil, gas, renewables and the power grid." },
  { icon: Factory, name: "Industrials", copy: "Aerospace, defense, manufacturing and logistics." },
];

const FAQS = [
  {
    q: "Is it really free?",
    a: "Yes. Joining the Discord and reading every channel costs nothing.",
  },
  {
    q: "How much news will I get?",
    a: "A handful of stories a day per sector — only the ones that meaningfully move a company or industry. Quiet days stay quiet.",
  },
  {
    q: "Where does the news come from?",
    a: "We monitor established financial news sources throughout the day and select the stories with real impact.",
  },
  {
    q: "Is this investment advice?",
    a: "No. WhatsUpMarket shares news and discussion only. Always do your own research before making investment decisions.",
  },
];

function DiscordIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function JoinButton({ children = "Join on Discord", size = "md", variant = "solid" }) {
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-[15px]",
  };
  const variants = {
    solid: "bg-forest-800 text-white hover:bg-forest-900",
    light: "bg-white text-forest-900 hover:bg-forest-50",
  };
  return (
    <a
      href={DISCORD_INVITE}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 rounded-full font-medium transition-colors ${sizes[size]} ${variants[variant]}`}
    >
      <DiscordIcon className="h-4 w-4" />
      {children}
    </a>
  );
}

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-forest-800 font-serif text-lg leading-none text-white">
        W
      </span>
      <span className="text-[15px] font-semibold tracking-tight">WhatsUpMarket</span>
    </a>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </a>
          ))}
        </nav>
        <JoinButton size="sm" />
      </div>
    </header>
  );
}

function BriefCard() {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-line bg-white p-2 shadow-[0_1px_2px_rgba(20,18,15,0.04),0_24px_48px_-24px_rgba(20,18,15,0.18)]">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-semibold">Today&apos;s brief</p>
        <p className="text-xs text-muted">Updated live</p>
      </div>
      <ul className="divide-y divide-line">
        {BRIEF.map((item) => (
          <li key={item.title} className="px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700">
              {item.sector}
            </p>
            <p className="mt-1.5 text-[15px] font-medium leading-snug">{item.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.why}</p>
            <p className="mt-2 text-xs text-muted/80">
              {item.source} · {item.time}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="scroll-mt-24">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-600" />
            Free Discord community · 1,000+ members
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            The market news
            <br />
            <span className="italic text-forest-800">worth your attention.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            WhatsUpMarket brings the day&apos;s most important financial stories into one Discord
            server — organized by sector, explained in a sentence, and free of noise.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <JoinButton>Join the community</JoinButton>
            <a
              href="#how"
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-ink transition-colors hover:text-forest-700"
            >
              How it works
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
        <BriefCard />
      </div>
    </section>
  );
}

function Proof() {
  const stats = [
    { value: "1,000+", label: "Members" },
    { value: "6", label: "Sector channels" },
    { value: "Daily", label: "Curated coverage" },
    { value: "Free", label: "Always" },
  ];
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-line px-6 md:grid-cols-4 md:divide-x">
        {stats.map((stat) => (
          <div key={stat.label} className="py-10 text-center">
            <p className="font-serif text-4xl tracking-tight">{stat.value}</p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, copy }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">{title}</h2>
      {copy ? <p className="mt-4 text-lg leading-relaxed text-muted">{copy}</p> : null}
    </div>
  );
}

function Benefits() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading
        eyebrow="Why members join"
        title="Less scrolling. Better informed."
        copy="Financial news moves fast and most of it doesn't matter. We do the filtering so your feed stays short and useful."
      />
      <div className="mt-16 grid gap-10 md:grid-cols-3">
        {BENEFITS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-50 text-forest-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{item.copy}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-y border-line bg-white py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="How it works" title="Up and running in a minute." />
        <ol className="mt-16 grid gap-12 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t border-line pt-6">
              <p className="font-serif text-3xl text-forest-700">0{i + 1}</p>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Coverage() {
  return (
    <section id="coverage" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-28">
      <SectionHeading
        eyebrow="Coverage"
        title="A channel for every corner of the market."
        copy="Follow everything, or just the sectors you invest in."
      />
      <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {COVERAGE.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="bg-paper p-8 transition-colors hover:bg-white">
              <Icon className="h-5 w-5 text-forest-700" />
              <h3 className="mt-5 font-serif text-2xl">{item.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.copy}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-20 border-t border-line bg-white py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading eyebrow="FAQ" title="Questions, answered." />
        <div className="divide-y divide-line border-y border-line">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-medium">{item.q}</span>
                  {isOpen ? (
                    <Minus className="h-4 w-4 shrink-0 text-muted" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-muted" />
                  )}
                </button>
                {isOpen ? <p className="-mt-2 pb-6 leading-relaxed text-muted">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-6 pb-24 pt-4">
      <div className="mx-auto max-w-6xl rounded-3xl bg-forest-900 px-8 py-20 text-center sm:px-16">
        <h2 className="mx-auto max-w-2xl font-serif text-4xl leading-tight tracking-tight text-white sm:text-5xl">
          Join 1,000+ investors who start their day here.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-white/70">
          Free to join. Leave any time.
        </p>
        <div className="mt-10 flex justify-center">
          <JoinButton variant="light">Join the community</JoinButton>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p className="max-w-md sm:text-right">
          © {new Date().getFullYear()} WhatsUpMarket. News and discussion only — not financial advice.
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div>
      <Nav />
      <Hero />
      <Proof />
      <Benefits />
      <HowItWorks />
      <Coverage />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}
