import { useState } from "react";
import {
  ArrowRight,
  Bot,
  Cpu,
  Filter,
  Flame,
  Newspaper,
  Radio,
  ShieldCheck,
  Sparkles,
  Webhook,
  Zap,
} from "lucide-react";
import { AnimatedGridPattern } from "./components/ui/animated-grid-pattern";
import { AnimatedList } from "./components/ui/animated-list";
import { AnimatedShinyText } from "./components/ui/animated-shiny-text";
import { BorderBeam } from "./components/ui/border-beam";
import { Marquee } from "./components/ui/marquee";
import { NumberTicker } from "./components/ui/number-ticker";
import { ShineBorder } from "./components/ui/shine-border";
import { ShimmerButton } from "./components/ui/shimmer-button";

const NAV = [
  { href: "#product", label: "Product" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#sectors", label: "Sectors" },
  { href: "#discord", label: "Discord" },
];

const SECTORS = [
  { name: "Semiconductors", tickers: "NVDA · TSM · AVGO" },
  { name: "Memory", tickers: "MU · WDC · SNDK" },
  { name: "Nuclear", tickers: "CCJ · SMR · OKLO" },
  { name: "Energy", tickers: "XOM · CVX · VST" },
  { name: "AI Infrastructure", tickers: "MSFT · AMZN · CRWV" },
];

const HEADLINES = [
  { sector: "AI", title: "TSMC lifts CoWoS capacity guidance after hyperscaler pull-in", score: 0.86, action: "PUSH" },
  { sector: "Nuclear", title: "Utility signs 20-year SMR offtake with data-center operator", score: 0.81, action: "PUSH" },
  { sector: "Memory", title: "HBM ASP spike as three customers lock 2027 supply", score: 0.74, action: "PUSH" },
  { sector: "Energy", title: "Grid interconnection backlog cited in ERCOT capacity auction", score: 0.68, action: "PUSH" },
  { sector: "Semis", title: "Foundry pricing commentary is generic; skip for now", score: 0.31, action: "SKIP" },
];

const STEPS = [
  {
    icon: Newspaper,
    title: "Fetch",
    copy: "Pull fresh market news from Alpha Vantage NEWS_SENTIMENT, optionally filtered by ticker or topic.",
  },
  {
    icon: Cpu,
    title: "Analyze",
    copy: "Classify sector, score importance, and tag sentiment so every article becomes structured intelligence.",
  },
  {
    icon: Filter,
    title: "Filter",
    copy: "Skip the noise. Only PUSH-tier, sector-relevant stories survive the 0.60 importance threshold.",
  },
  {
    icon: Webhook,
    title: "Publish",
    copy: "Format Discord embeds and fire a webhook. Your channel stays a live desk, not a firehose.",
  },
];

const FEATURES = [
  {
    icon: Flame,
    title: "Importance scoring",
    copy: "Earnings, M&A, capacity expansions, contracts, and regulation score high. Analyst notes do not.",
  },
  {
    icon: Radio,
    title: "Sector radar",
    copy: "Hardcoded coverage for semiconductors, memory, nuclear, energy, and AI infrastructure — expandable later.",
  },
  {
    icon: ShieldCheck,
    title: "Publish discipline",
    copy: "<0.40 skip · 0.40–0.59 low · ≥0.60 push. Only the last bucket hits Discord.",
  },
  {
    icon: Zap,
    title: "Lean pipeline",
    copy: "FastAPI, no database, no bot OAuth. One vertical slice: news in, signal out.",
  },
];

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10">
        <Sparkles className="h-4 w-4 text-emerald-300" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-white">
        WhatsUpMarket
      </span>
    </a>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <a href="#waitlist">
          <ShimmerButton className="px-4 py-2 text-sm font-medium">Get early access</ShimmerButton>
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden scroll-mt-24">
      <AnimatedGridPattern
        numSquares={36}
        maxOpacity={0.18}
        duration={3}
        className="[mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <AnimatedShinyText className="mx-0 text-xs">Lean POC · MarketBrief pipeline</AnimatedShinyText>
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Financial news in.
            <br />
            <span className="bg-gradient-to-r from-emerald-300 via-white to-violet-300 bg-clip-text text-transparent">
              Signal out to Discord.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            WhatsUpMarket fetches market headlines, scores what actually matters, and publishes only
            high-importance, sector-relevant stories as Discord embeds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#waitlist">
              <ShimmerButton className="gap-2 font-semibold">
                Join the waitlist
                <ArrowRight className="h-4 w-4" />
              </ShimmerButton>
            </a>
            <a
              href="#pipeline"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/5"
            >
              See the pipeline
            </a>
          </div>
          <p className="mt-6 font-mono text-xs text-zinc-500">
            Financial News → Analysis → Structured Intelligence → Discord
          </p>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-4 shadow-2xl shadow-emerald-950/40">
            <BorderBeam size={90} duration={8} borderWidth={1.5} />
            <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Bot className="h-4 w-4 text-violet-300" />
                #market-brief
              </div>
              <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                LIVE FILTER
              </span>
            </div>
            <AnimatedList delay={1600} className="min-h-[320px] items-stretch">
              {HEADLINES.map((item) => (
                <article
                  key={item.title}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-violet-300">
                      {item.sector}
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                        item.action === "PUSH"
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-zinc-700/60 text-zinc-400"
                      }`}
                    >
                      {item.action} · {item.score.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-snug text-zinc-100">{item.title}</p>
                </article>
              ))}
            </AnimatedList>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-y border-white/5 bg-white/[0.02]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 sm:grid-cols-4">
        {[
          { value: 5, suffix: "", label: "Tracked sectors" },
          { value: 60, suffix: "+", label: "Push threshold (score ×100)" },
          { value: 10, suffix: "s", label: "Typical pipeline run" },
          { value: 1, suffix: "", label: "Webhook. Zero noise." },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="font-display text-3xl font-bold text-white">
              <NumberTicker value={stat.value} />
              {stat.suffix}
            </div>
            <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Product() {
  return (
    <section id="product" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-300">Product</p>
      <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
        A desk that reads everything so you do not have to.
      </h2>
      <p className="mt-4 max-w-2xl text-zinc-400">
        Most feeds dump headlines. WhatsUpMarket decides what is worth a ping: sector match plus
        importance score, then a clean Discord embed.
      </p>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/50 p-6"
            >
              <ShineBorder shineColor={["#34d399", "#a78bfa", "#34d399"]} duration={12} />
              <Icon className="h-6 w-6 text-emerald-300" />
              <h3 className="mt-4 font-display text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feature.copy}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Pipeline() {
  return (
    <section id="pipeline" className="scroll-mt-24 border-y border-white/5 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-6xl px-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-300">Pipeline</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          Four steps. One vertical slice.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-ink p-5">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-violet-300" />
                  <span className="font-mono text-xs text-zinc-500">0{i + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Sectors() {
  return (
    <section id="sectors" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-300">Coverage</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          Built for the themes moving markets now.
        </h2>
      </div>
      <div className="relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink" />
        <Marquee pauseOnHover className="[--duration:32s]">
          {SECTORS.map((sector) => (
            <div
              key={sector.name}
              className="w-64 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
            >
              <p className="font-display text-lg font-semibold text-white">{sector.name}</p>
              <p className="mt-1 font-mono text-xs text-zinc-500">{sector.tickers}</p>
            </div>
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:38s]">
          {HEADLINES.map((item) => (
            <div
              key={item.title}
              className="max-w-sm rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3"
            >
              <p className="font-mono text-[10px] text-emerald-300">{item.action}</p>
              <p className="mt-1 text-sm text-zinc-200">{item.title}</p>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

function Discord() {
  return (
    <section id="discord" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-12">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/40 via-ink to-emerald-950/30 p-8 sm:p-12">
        <BorderBeam size={120} duration={10} colorFrom="#a78bfa" colorTo="#34d399" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-300">Delivery</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold text-white sm:text-4xl">
          Qualifying articles land as Discord embeds — not another inbox.
        </h2>
        <p className="mt-4 max-w-xl text-zinc-400">
          Drop a webhook URL. Hit the pipeline. Your channel becomes a filtered tape for AI
          infrastructure, energy, and the rest of the radar.
        </p>
        <pre className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-xs text-emerald-200/90">
{`POST /run?topic=technology&limit=10
{
  "articles_fetched": 10,
  "articles_analyzed": 10,
  "articles_published": 4,
  "articles_skipped": 6
}`}
        </pre>
      </div>
    </section>
  );
}

function Waitlist() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  }

  return (
    <section id="waitlist" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Get the brief before the crowd.
        </h2>
        <p className="mt-3 text-zinc-400">
          Early access for operators who want high-signal market news in Discord, not another
          terminal tab.
        </p>
        {done ? (
          <p className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-emerald-200">
            You are on the list. We will ping you when a slot opens.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@fund.com"
              className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400/50"
            />
            <ShimmerButton type="submit" className="font-semibold">
              Request access
            </ShimmerButton>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-sm text-zinc-500 sm:flex-row">
        <Logo />
        <p>WhatsUpMarket · MarketBrief V0 · Signal over volume</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div>
      <Nav />
      <Hero />
      <Stats />
      <Product />
      <Pipeline />
      <Sectors />
      <Discord />
      <Waitlist />
      <Footer />
    </div>
  );
}
