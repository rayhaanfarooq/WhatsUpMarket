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
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatedList } from "./components/ui/animated-list";
import { AnimatedShinyText } from "./components/ui/animated-shiny-text";
import { AuroraText } from "./components/ui/aurora-text";
import { AvatarCircles } from "./components/ui/avatar-circles";
import { BlurFade } from "./components/ui/blur-fade";
import { BorderBeam } from "./components/ui/border-beam";
import { MagicCard } from "./components/ui/magic-card";
import { Marquee } from "./components/ui/marquee";
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

const TICKERS = [
  { symbol: "NVDA", price: 142.18, change: 2.41 },
  { symbol: "AAPL", price: 227.52, change: 0.38 },
  { symbol: "MSFT", price: 438.11, change: 0.92 },
  { symbol: "TSM", price: 191.07, change: 3.12 },
  { symbol: "AMZN", price: 186.4, change: -0.54 },
  { symbol: "GOOGL", price: 167.83, change: 0.27 },
  { symbol: "META", price: 571.24, change: -1.08 },
  { symbol: "CCJ", price: 52.66, change: 4.05 },
  { symbol: "OKLO", price: 24.18, change: 6.72 },
  { symbol: "LLY", price: 912.35, change: -0.83 },
  { symbol: "NVO", price: 118.44, change: 1.16 },
  { symbol: "JPM", price: 214.9, change: 0.41 },
  { symbol: "GS", price: 512.73, change: -0.29 },
  { symbol: "XOM", price: 118.02, change: -0.61 },
  { symbol: "VST", price: 124.55, change: 2.87 },
  { symbol: "GE", price: 181.4, change: 0.66 },
];

const SECTOR_STYLE = {
  Tech: { color: "#0891b2", icon: Cpu },
  Nuclear: { color: "#65a30d", icon: Atom },
  Healthcare: { color: "#e11d48", icon: HeartPulse },
  Finance: { color: "#d97706", icon: Banknote },
  Energy: { color: "#ea580c", icon: Zap },
  Industrials: { color: "#4f46e5", icon: Factory },
};

const BRIEF = [
  {
    sector: "Tech",
    ticker: "TSM",
    change: 3.12,
    title: "TSMC raises its outlook as demand for AI chips keeps climbing",
    why: "A strong read on how long the AI build-out can keep running.",
    time: "8m",
  },
  {
    sector: "Nuclear",
    ticker: "OKLO",
    change: 6.72,
    title: "Utility signs a 20-year power deal with a data center operator",
    why: "Big tech keeps turning to nuclear for reliable, round-the-clock power.",
    time: "32m",
  },
  {
    sector: "Healthcare",
    ticker: "LLY",
    change: -0.83,
    title: "FDA clears a rival obesity treatment ahead of schedule",
    why: "Competition in the weight-loss market is heating up fast.",
    time: "1h",
  },
  {
    sector: "Finance",
    ticker: "JPM",
    change: 0.41,
    title: "Fed minutes point to a slower pace of rate cuts",
    why: "Borrowing costs may stay higher for longer than markets expected.",
    time: "2h",
  },
  {
    sector: "Energy",
    ticker: "VST",
    change: 2.87,
    title: "Grid operator warns of tight summer supply as demand surges",
    why: "Power prices and utility stocks could move on this.",
    time: "3h",
  },
];

const AVATARS = [
  { initials: "JM", color: "linear-gradient(135deg,#10b981,#0ea5e9)" },
  { initials: "AK", color: "linear-gradient(135deg,#6366f1,#d946ef)" },
  { initials: "SR", color: "linear-gradient(135deg,#f59e0b,#f43f5e)" },
  { initials: "DL", color: "linear-gradient(135deg,#06b6d4,#6366f1)" },
  { initials: "NP", color: "linear-gradient(135deg,#84cc16,#10b981)" },
];

const BENEFITS = [
  {
    icon: Filter,
    title: "Only what matters",
    copy: "Earnings, deals, major contracts and policy moves. Routine commentary and clickbait never make it in.",
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Layers,
    title: "Organized by sector",
    copy: "Every story lands in its own channel, so you follow tech, energy or healthcare without wading through the rest.",
    tone: "bg-cyan-50 text-cyan-600",
  },
  {
    icon: Bell,
    title: "As it happens",
    copy: "Important stories arrive through the day as they break, each with a one-line note on why it matters.",
    tone: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Users,
    title: "A community to discuss it with",
    copy: "Talk through the news with 1,000+ members who follow the same markets you do.",
    tone: "bg-fuchsia-50 text-fuchsia-600",
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

function formatChange(change) {
  return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
}

function DiscordIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function JoinButton({ children = "Join the community", className }) {
  return (
    <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="inline-block">
      <ShimmerButton
        background="linear-gradient(135deg, #059669 0%, #0891b2 55%, #4f46e5 100%)"
        className={cn("gap-2 font-semibold shadow-lg shadow-cyan-600/20", className)}
      >
        <DiscordIcon className="h-4 w-4" />
        {children}
      </ShimmerButton>
    </a>
  );
}

function NavJoinButton() {
  return (
    <a
      href={DISCORD_INVITE}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
    >
      <DiscordIcon className="h-4 w-4" />
      Join on Discord
    </a>
  );
}

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5">
      <img src="/favicon.svg" alt="" className="h-8 w-8" />
      <span className="text-[15px] font-semibold tracking-tight text-ink">WhatsUpMarket</span>
    </a>
  );
}

function ChangeChip({ symbol, change }) {
  const up = change >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      )}
    >
      <Icon className="h-3 w-3" />
      {symbol} {formatChange(change)}
    </span>
  );
}

function TickerBar() {
  return (
    <div className="relative border-b border-zinc-200 bg-white">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white" />
      <Marquee pauseOnHover repeat={3} className="p-0 py-2 [--duration:60s] [--gap:2rem]">
        {TICKERS.map((t) => {
          const up = t.change >= 0;
          return (
            <span key={t.symbol} className="flex items-center gap-2 whitespace-nowrap text-xs tabular-nums">
              <span className="font-semibold text-ink">{t.symbol}</span>
              <span className="text-zinc-500">{t.price.toFixed(2)}</span>
              <span className={cn("font-semibold", up ? "text-emerald-600" : "text-rose-600")}>
                {up ? "▲" : "▼"} {formatChange(t.change)}
              </span>
            </span>
          );
        })}
      </Marquee>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50">
      <TickerBar />
      <div className="border-b border-zinc-200/80 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-ink">
                {item.label}
              </a>
            ))}
          </nav>
          <NavJoinButton />
        </div>
      </div>
    </header>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">{children}</p>
  );
}

function SectionHeading({ eyebrow, title, accent, copy, center }) {
  return (
    <BlurFade className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
        {title}{" "}
        {accent ? (
          <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 bg-clip-text font-serif font-normal italic text-transparent">
            {accent}
          </span>
        ) : null}
      </h2>
      {copy ? <p className="mt-5 text-lg leading-relaxed text-zinc-600">{copy}</p> : null}
    </BlurFade>
  );
}

function SectorPill({ sector }) {
  const { color, icon: Icon } = SECTOR_STYLE[sector];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ color, background: `${color}14` }}
    >
      <Icon className="h-3 w-3" />
      {sector}
    </span>
  );
}

function DiscordWindow() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/[0.06]">
        <BorderBeam size={120} duration={10} colorFrom="#10b981" colorTo="#6366f1" borderWidth={1.5} />
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <Hash className="h-4 w-4 text-zinc-400" />
            market-news
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
        <div className="h-[440px] overflow-hidden bg-zinc-50/60 p-3">
          <AnimatedList delay={3000} className="items-stretch">
            {BRIEF.map((item) => (
              <article key={item.title} className="w-full rounded-xl border border-zinc-200/70 bg-white p-3.5">
                <div className="flex gap-3">
                  <img src="/favicon.svg" alt="" className="mt-0.5 h-8 w-8 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink">WhatsUpMarket</span>
                      <span className="rounded bg-indigo-500 px-1 text-[10px] font-semibold text-white">BOT</span>
                      <span className="text-xs text-zinc-400">{item.time} ago</span>
                    </div>
                    <div
                      className="mt-2 rounded-lg border-l-[3px] bg-zinc-50 p-3"
                      style={{ borderColor: SECTOR_STYLE[item.sector].color }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <SectorPill sector={item.sector} />
                        <ChangeChip symbol={item.ticker} change={item.change} />
                      </div>
                      <p className="mt-2 text-sm font-medium leading-snug text-ink">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.why}</p>
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
    <section
      id="top"
      className="relative bg-[radial-gradient(900px_500px_at_15%_0%,rgba(16,185,129,0.10),transparent_60%),radial-gradient(800px_500px_at_90%_10%,rgba(99,102,241,0.10),transparent_60%)]"
    >
      <div className="mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
        <BlurFade inView={false}>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <AnimatedShinyText className="mx-0 text-xs">Free Discord community · 1,000+ members</AnimatedShinyText>
          </div>

          <h1 className="mt-7 text-5xl font-semibold leading-[1.03] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Market news
            <br />
            that{" "}
            <AuroraText
              className="font-serif font-normal italic"
              colors={["#059669", "#0891b2", "#4f46e5", "#c026d3"]}
            >
              actually matters.
            </AuroraText>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
            The day&apos;s most important stories for{" "}
            <WordRotate
              words={["tech", "nuclear", "healthcare", "finance", "energy", "industrials"]}
              duration={2800}
              className="font-semibold text-ink"
            />{" "}
            investors — curated, explained in a sentence, and delivered straight to Discord.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <JoinButton />
            <a
              href="#how"
              className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-zinc-400"
            >
              How it works
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <AvatarCircles avatars={AVATARS} numPeople={995} />
            <p className="text-sm text-zinc-600">
              <span className="font-semibold text-ink">1,000+ members</span> already inside
            </p>
          </div>
        </BlurFade>

        <BlurFade inView={false} delay={0.15}>
          <DiscordWindow />
        </BlurFade>
      </div>
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
    <section className="border-y border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 px-6 md:grid-cols-4 md:divide-x md:divide-zinc-200">
        {stats.map((stat) => (
          <div key={stat.label} className="py-10 text-center">
            <p className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {stat.prefix}
              <NumberTicker value={stat.value} />
              {stat.suffix}
            </p>
            <p className="mt-2 text-sm text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section id="why" className="mx-auto max-w-6xl scroll-mt-32 px-6 py-24">
      <SectionHeading
        eyebrow="Why members join"
        title="Less scrolling."
        accent="Better informed."
        copy="Financial news moves fast and most of it doesn't matter. We do the filtering so your feed stays short, sharp and useful."
      />
      <BlurFade className="mt-14 grid gap-4 md:grid-cols-2" delay={0.05}>
        {BENEFITS.map((item) => {
          const Icon = item.icon;
          return (
            <MagicCard key={item.title} className="h-full rounded-2xl shadow-sm">
              <div className="p-7">
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", item.tone)}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-zinc-600">{item.copy}</p>
              </div>
            </MagicCard>
          );
        })}
      </BlurFade>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-32 border-y border-zinc-200 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="How it works" title="Up and running" accent="in a minute." center />
        <BlurFade className="relative mt-16 grid gap-10 md:grid-cols-3" delay={0.05}>
          <div className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-emerald-300 via-cyan-300 to-indigo-300 md:block" />
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative text-center">
              <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg font-semibold text-emerald-600 shadow-sm">
                {i + 1}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs leading-relaxed text-zinc-600">{step.copy}</p>
            </div>
          ))}
        </BlurFade>
      </div>
    </section>
  );
}

function Coverage() {
  return (
    <section id="coverage" className="mx-auto max-w-6xl scroll-mt-32 px-6 py-24">
      <SectionHeading
        eyebrow="Coverage"
        title="A channel for every"
        accent="corner of the market."
        copy="Follow everything, or just the sectors you invest in."
      />
      <BlurFade className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" delay={0.05}>
        {COVERAGE.map((item) => {
          const { color, icon: Icon } = SECTOR_STYLE[item.name];
          return (
            <MagicCard
              key={item.name}
              className="h-full rounded-2xl shadow-sm"
              gradientFrom={color}
              gradientTo="#6366f1"
              gradientColor={`${color}0f`}
            >
              <div className="p-7">
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: `${color}14`, color }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-400">
                    <Hash className="h-3 w-3" />
                    {item.name.toLowerCase()}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-ink">{item.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.copy}</p>
              </div>
            </MagicCard>
          );
        })}
      </BlurFade>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-32 border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading eyebrow="FAQ" title="Questions," accent="answered." />
        <BlurFade className="space-y-3" delay={0.05}>
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={cn(
                  "rounded-2xl border transition-colors",
                  isOpen ? "border-emerald-200 bg-emerald-50/50" : "border-zinc-200 bg-white"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium text-ink">{item.q}</span>
                  {isOpen ? (
                    <Minus className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-zinc-400" />
                  )}
                </button>
                {isOpen ? <p className="-mt-1 px-6 pb-5 leading-relaxed text-zinc-600">{item.a}</p> : null}
              </div>
            );
          })}
        </BlurFade>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-6 py-24">
      <BlurFade className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-cyan-50 to-indigo-100 px-8 py-20 text-center ring-1 ring-zinc-200 sm:px-16">
          <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
            Join 1,000+ investors who{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 bg-clip-text font-serif font-normal italic text-transparent">
              start their day here.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg text-zinc-600">Free to join. Leave any time.</p>
          <div className="mt-10 flex justify-center">
            <JoinButton className="px-8 py-4 text-base" />
          </div>
        </div>
      </BlurFade>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p className="max-w-md sm:text-right">
          © {new Date().getFullYear()} WhatsUpMarket. Prices shown are illustrative. News and discussion only — not
          financial advice.
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="overflow-x-clip">
      <Header />
      <Hero />
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
