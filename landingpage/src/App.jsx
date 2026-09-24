import { useState } from "react";
import {
  ArrowRight,
  Atom,
  Banknote,
  Bell,
  Cpu,
  Factory,
  Filter,
  Hash,
  HeartPulse,
  Layers,
  Minus,
  Plus,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { AnimatedGridPattern } from "./components/ui/animated-grid-pattern";
import { AnimatedList } from "./components/ui/animated-list";
import { AnimatedShinyText } from "./components/ui/animated-shiny-text";
import { AuroraText } from "./components/ui/aurora-text";
import { AvatarCircles } from "./components/ui/avatar-circles";
import { BlurFade } from "./components/ui/blur-fade";
import { BorderBeam } from "./components/ui/border-beam";
import { MagicCard } from "./components/ui/magic-card";
import { Marquee } from "./components/ui/marquee";
import { Meteors } from "./components/ui/meteors";
import { NumberTicker } from "./components/ui/number-ticker";
import { ShimmerButton } from "./components/ui/shimmer-button";
import { WordRotate } from "./components/ui/word-rotate";
import { cn } from "./lib/utils";

/** Swap this for your real Discord invite link. */
const DISCORD_INVITE = "https://discord.gg/whatsupmarket";

const NAV = [
  { href: "#why", label: "Why join" },
  { href: "#how", label: "How it works" },
  { href: "#coverage", label: "Coverage" },
  { href: "#faq", label: "FAQ" },
];

const SECTOR_STYLE = {
  Tech: { color: "#22d3ee", icon: Cpu },
  Nuclear: { color: "#a3e635", icon: Atom },
  Healthcare: { color: "#fb7185", icon: HeartPulse },
  Finance: { color: "#fbbf24", icon: Banknote },
  Energy: { color: "#fb923c", icon: Zap },
  Industrials: { color: "#818cf8", icon: Factory },
};

const BRIEF = [
  {
    sector: "Tech",
    title: "TSMC raises its outlook as demand for AI chips keeps climbing",
    why: "A strong read on how long the AI build-out can keep running.",
    time: "8m",
  },
  {
    sector: "Nuclear",
    title: "Utility signs a 20-year power deal with a data center operator",
    why: "Big tech keeps turning to nuclear for reliable, round-the-clock power.",
    time: "32m",
  },
  {
    sector: "Healthcare",
    title: "FDA clears a new obesity treatment ahead of schedule",
    why: "Competition in the weight-loss market is heating up fast.",
    time: "1h",
  },
  {
    sector: "Finance",
    title: "Fed minutes point to a slower pace of rate cuts",
    why: "Borrowing costs may stay higher for longer than markets expected.",
    time: "2h",
  },
  {
    sector: "Energy",
    title: "Grid operator warns of tight summer supply as demand surges",
    why: "Power prices and utility stocks could move on this.",
    time: "3h",
  },
];

const AVATARS = [
  { initials: "JM", color: "linear-gradient(135deg,#34d399,#0ea5e9)" },
  { initials: "AK", color: "linear-gradient(135deg,#818cf8,#e879f9)" },
  { initials: "SR", color: "linear-gradient(135deg,#fbbf24,#fb7185)" },
  { initials: "DL", color: "linear-gradient(135deg,#22d3ee,#6366f1)" },
  { initials: "NP", color: "linear-gradient(135deg,#a3e635,#10b981)" },
];

const BENEFITS = [
  {
    icon: Filter,
    title: "Only what matters",
    copy: "Earnings, deals, major contracts and policy moves. Routine commentary and clickbait never make it in.",
    gradient: "from-emerald-400 to-cyan-400",
  },
  {
    icon: Layers,
    title: "Organized by sector",
    copy: "Every story lands in its own channel, so you follow tech, energy or healthcare without wading through the rest.",
    gradient: "from-cyan-400 to-indigo-400",
  },
  {
    icon: Bell,
    title: "As it happens",
    copy: "Important stories arrive through the day as they break, each with a one-line note on why it matters.",
    gradient: "from-indigo-400 to-fuchsia-400",
  },
  {
    icon: Users,
    title: "A community to discuss it with",
    copy: "Talk through the news with 1,000+ members who follow the same markets you do.",
    gradient: "from-fuchsia-400 to-rose-400",
  },
];

const STEPS = [
  { title: "Join the server", copy: "One click from Discord. It's free, and there's nothing to install." },
  { title: "Pick your sectors", copy: "Follow the channels you care about and mute the ones you don't." },
  { title: "Stay ahead", copy: "Get the day's important stories the moment they break, explained in plain English." },
];

const COVERAGE = [
  { name: "Tech", copy: "Chips, AI, cloud and the companies building them." },
  { name: "Nuclear", copy: "Reactors, uranium and the new wave of nuclear power." },
  { name: "Healthcare", copy: "Drug approvals, biotech and major pharma deals." },
  { name: "Finance", copy: "Banks, rates, the Fed and the broader economy." },
  { name: "Energy", copy: "Oil, gas, renewables and the power grid." },
  { name: "Industrials", copy: "Aerospace, defense, manufacturing and logistics." },
];

const FAQS = [
  { q: "Is it really free?", a: "Yes. Joining the Discord and reading every channel costs nothing." },
  {
    q: "How much news will I get?",
    a: "A handful of stories a day per sector — only the ones that meaningfully move a company or industry. Quiet days stay quiet.",
  },
  {
    q: "Where does the news come from?",
    a: "We monitor established financial news sources throughout the day and pick out the stories with real impact.",
  },
  {
    q: "Is this investment advice?",
    a: "No. WhatsUpMarket shares news and discussion only. Always do your own research before investing.",
  },
];

function DiscordIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function JoinButton({ children = "Join on Discord", className }) {
  return (
    <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="inline-block">
      <ShimmerButton
        background="linear-gradient(135deg, #059669 0%, #0891b2 55%, #4f46e5 100%)"
        className={cn("gap-2 font-semibold shadow-[0_0_40px_-8px_rgba(34,211,238,0.6)]", className)}
      >
        <DiscordIcon className="h-4 w-4" />
        {children}
      </ShimmerButton>
    </a>
  );
}

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5">
      <img src="/favicon.svg" alt="" className="h-8 w-8" />
      <span className="text-[15px] font-semibold tracking-tight text-white">WhatsUpMarket</span>
    </a>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
      <span className="h-px w-6 bg-gradient-to-r from-transparent to-emerald-300" />
      {children}
    </p>
  );
}

function SectionHeading({ eyebrow, title, accent, copy, center }) {
  return (
    <BlurFade className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
        {title}{" "}
        {accent ? <AuroraText className="font-serif font-normal italic">{accent}</AuroraText> : null}
      </h2>
      {copy ? <p className="mt-5 text-lg leading-relaxed text-zinc-400">{copy}</p> : null}
    </BlurFade>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <JoinButton className="px-4 py-2 text-sm" />
      </div>
    </header>
  );
}

function SectorPill({ sector }) {
  const { color, icon: Icon } = SECTOR_STYLE[sector];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ color, background: `${color}1a`, boxShadow: `inset 0 0 0 1px ${color}33` }}
    >
      <Icon className="h-3 w-3" />
      {sector}
    </span>
  );
}

function DiscordWindow() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-tr from-emerald-500/25 via-cyan-500/20 to-indigo-500/25 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-panel/90 shadow-2xl backdrop-blur">
        <BorderBeam size={120} duration={9} colorFrom="#34d399" colorTo="#818cf8" borderWidth={1.5} />
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Hash className="h-4 w-4 text-zinc-500" />
            market-news
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live
          </span>
        </div>
        <div className="h-[430px] overflow-hidden p-3">
          <AnimatedList delay={2200} className="items-stretch">
            {BRIEF.map((item) => (
              <article key={item.title} className="w-full rounded-xl border border-white/5 bg-white/[0.03] p-3.5">
                <div className="flex gap-3">
                  <img src="/favicon.svg" alt="" className="mt-0.5 h-8 w-8 shrink-0 rounded-full" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">WhatsUpMarket</span>
                      <span className="rounded bg-indigo-500 px-1 text-[10px] font-semibold text-white">BOT</span>
                      <span className="text-xs text-zinc-500">{item.time} ago</span>
                    </div>
                    <div
                      className="mt-2 rounded-lg border-l-[3px] bg-black/30 p-3"
                      style={{ borderColor: SECTOR_STYLE[item.sector].color }}
                    >
                      <SectorPill sector={item.sector} />
                      <p className="mt-2 text-sm font-medium leading-snug text-white">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">{item.why}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </AnimatedList>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.18}
        duration={3}
        className="stroke-white/[0.06] text-emerald-400 [mask-image:radial-gradient(800px_circle_at_30%_20%,white,transparent)]"
      />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-indigo-500/20 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
        <div>
          <BlurFade delay={0.05}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <AnimatedShinyText className="mx-0 text-xs">
                Free Discord community · 1,000+ members
              </AnimatedShinyText>
            </div>
          </BlurFade>

          <BlurFade delay={0.15}>
            <h1 className="mt-7 text-5xl font-semibold leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Market news
              <br />
              that{" "}
              <AuroraText className="font-serif font-normal italic">actually matters.</AuroraText>
            </h1>
          </BlurFade>

          <BlurFade delay={0.25}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
              The day&apos;s most important stories for{" "}
              <WordRotate
                words={["tech", "nuclear", "healthcare", "finance", "energy", "industrials"]}
                className="font-semibold text-white"
              />{" "}
              investors — curated, explained in a sentence, and delivered straight to Discord.
            </p>
          </BlurFade>

          <BlurFade delay={0.35}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <JoinButton>Join the community</JoinButton>
              <a
                href="#how"
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/25 hover:bg-white/5"
              >
                How it works
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </BlurFade>

          <BlurFade delay={0.45}>
            <div className="mt-10 flex items-center gap-4">
              <AvatarCircles avatars={AVATARS} numPeople={995} />
              <p className="text-sm text-zinc-400">
                <span className="font-semibold text-white">1,000+ members</span> already inside
              </p>
            </div>
          </BlurFade>
        </div>

        <BlurFade delay={0.3} direction="left">
          <DiscordWindow />
        </BlurFade>
      </div>
    </section>
  );
}

function SectorStrip() {
  return (
    <section className="relative border-y border-white/5 bg-white/[0.015] py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-ink" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-ink" />
      <Marquee pauseOnHover className="[--duration:30s] [--gap:3rem]">
        {Object.entries(SECTOR_STYLE).map(([name, { color, icon: Icon }]) => (
          <span key={name} className="flex items-center gap-2.5 text-lg font-medium text-zinc-300">
            <Icon className="h-5 w-5" style={{ color }} />
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: 1000, suffix: "+", label: "Community members" },
    { value: 6, suffix: "", label: "Sector channels" },
    { value: 24, suffix: "/7", label: "News coverage" },
    { value: 0, prefix: "$", suffix: "", label: "To join, forever" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, i) => (
          <BlurFade key={stat.label} delay={i * 0.08}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
              <p className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {stat.prefix}
                <NumberTicker value={stat.value} />
                {stat.suffix}
              </p>
              <p className="mt-2 text-sm text-zinc-500">{stat.label}</p>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section id="why" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
      <SectionHeading
        eyebrow="Why members join"
        title="Less scrolling."
        accent="Better informed."
        copy="Financial news moves fast and most of it doesn't matter. We do the filtering so your feed stays short, sharp and useful."
      />
      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {BENEFITS.map((item, i) => {
          const Icon = item.icon;
          return (
            <BlurFade key={item.title} delay={i * 0.08}>
              <MagicCard className="h-full rounded-2xl">
                <div className="p-7">
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-ink shadow-lg",
                      item.gradient
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-zinc-400">{item.copy}</p>
                </div>
              </MagicCard>
            </BlurFade>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-20 py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="How it works" title="Up and running" accent="in a minute." center />
        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-emerald-400/0 via-cyan-400/60 to-indigo-400/0 md:block" />
          {STEPS.map((step, i) => (
            <BlurFade key={step.title} delay={i * 0.12} className="relative text-center">
              <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-panel text-lg font-semibold text-white shadow-[0_0_30px_-6px_rgba(34,211,238,0.5)]">
                <AuroraText>{i + 1}</AuroraText>
              </span>
              <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs leading-relaxed text-zinc-400">{step.copy}</p>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

function Coverage() {
  return (
    <section id="coverage" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
      <SectionHeading
        eyebrow="Coverage"
        title="A channel for every"
        accent="corner of the market."
        copy="Follow everything, or just the sectors you invest in."
      />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COVERAGE.map((item, i) => {
          const { color, icon: Icon } = SECTOR_STYLE[item.name];
          return (
            <BlurFade key={item.name} delay={i * 0.06}>
              <MagicCard
                className="h-full rounded-2xl"
                gradientFrom={color}
                gradientTo="#818cf8"
                gradientColor={`${color}1f`}
              >
                <div className="p-7">
                  <div className="flex items-center justify-between">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: `${color}1a`, color, boxShadow: `inset 0 0 0 1px ${color}40` }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Hash className="h-3 w-3" />
                      {item.name.toLowerCase()}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{item.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.copy}</p>
                </div>
              </MagicCard>
            </BlurFade>
          );
        })}
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto grid max-w-6xl scroll-mt-20 gap-12 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr]">
      <SectionHeading eyebrow="FAQ" title="Questions," accent="answered." />
      <BlurFade className="space-y-3" delay={0.1}>
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className={cn(
                "rounded-2xl border transition-colors",
                isOpen ? "border-emerald-400/30 bg-emerald-400/[0.04]" : "border-white/5 bg-white/[0.02]"
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-base font-medium text-white">{item.q}</span>
                {isOpen ? (
                  <Minus className="h-4 w-4 shrink-0 text-emerald-300" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0 text-zinc-500" />
                )}
              </button>
              {isOpen ? <p className="-mt-1 px-6 pb-5 leading-relaxed text-zinc-400">{item.a}</p> : null}
            </div>
          );
        })}
      </BlurFade>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-6 pb-24">
      <BlurFade className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-950 via-ink to-indigo-950 px-8 py-24 text-center sm:px-16">
          <Meteors number={24} />
          <BorderBeam size={200} duration={12} colorFrom="#34d399" colorTo="#e879f9" borderWidth={1.5} />
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[100px]" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
              Join 1,000+ investors who{" "}
              <AuroraText className="font-serif font-normal italic">start their day here.</AuroraText>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg text-zinc-400">Free to join. Leave any time.</p>
            <div className="mt-10 flex justify-center">
              <JoinButton className="px-8 py-4 text-base">Join the community</JoinButton>
            </div>
          </div>
        </div>
      </BlurFade>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
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
    <div className="overflow-x-clip">
      <Nav />
      <Hero />
      <SectorStrip />
      <Stats />
      <Benefits />
      <HowItWorks />
      <Coverage />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}
