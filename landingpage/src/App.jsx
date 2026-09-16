import {
  ArrowRight,
  Bot,
  Cpu,
  Filter,
  Flame,
  MessageCircle,
  Newspaper,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatedGridPattern } from "./components/ui/animated-grid-pattern";
import { AnimatedList } from "./components/ui/animated-list";
import { AnimatedShinyText } from "./components/ui/animated-shiny-text";
import { BorderBeam } from "./components/ui/border-beam";
import { Marquee } from "./components/ui/marquee";
import { NumberTicker } from "./components/ui/number-ticker";
import { ShineBorder } from "./components/ui/shine-border";
import { ShimmerButton } from "./components/ui/shimmer-button";

/** Swap this for your real Discord invite link. */
const DISCORD_INVITE = "https://discord.gg/whatsupmarket";

const NAV = [
  { href: "#why", label: "Why join" },
  { href: "#feed", label: "The feed" },
  { href: "#sectors", label: "Sectors" },
  { href: "#join", label: "Join Discord" },
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
    title: "We scan the tape",
    copy: "Market headlines get pulled in continuously so you do not have to live in five news tabs.",
  },
  {
    icon: Cpu,
    title: "We score what matters",
    copy: "Each story is tagged by sector, importance, and sentiment — earnings and contracts beat generic chatter.",
  },
  {
    icon: Filter,
    title: "We drop the noise",
    copy: "Only high-signal, sector-relevant stories make the cut. Skip the analyst-note spam.",
  },
  {
    icon: MessageCircle,
    title: "It lands in Discord",
    copy: "Clean embeds hit the WhatsUpMarket server so 1,000+ members see the same brief, together.",
  },
];

const FEATURES = [
  {
    icon: Flame,
    title: "High-signal news only",
    copy: "Earnings, M&A, capacity expansions, contracts, and regulation get posted. Routine commentary stays out.",
  },
  {
    icon: Radio,
    title: "Themes that actually move",
    copy: "Coverage locked on semiconductors, memory, nuclear, energy, and AI infrastructure.",
  },
  {
    icon: ShieldCheck,
    title: "A channel that stays readable",
    copy: "If it is not important enough, it never pings the server. Your feed stays a desk, not a firehose.",
  },
  {
    icon: Users,
    title: "1,000+ members already inside",
    copy: "Join a community that watches the same filtered tape — talk the news, not the noise.",
  },
];

function JoinDiscordButton({ children, className }) {
  return (
    <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">
      <ShimmerButton className={className}>
        {children}
      </ShimmerButton>
    </a>
  );
}

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
        <JoinDiscordButton className="px-4 py-2 text-sm font-medium">
          Join the Discord
        </JoinDiscordButton>
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
            <AnimatedShinyText className="mx-0 text-xs">
              1,000+ members · live market brief in Discord
            </AnimatedShinyText>
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Hey — join the Discord.
            <br />
            <span className="bg-gradient-to-r from-emerald-300 via-white to-violet-300 bg-clip-text text-transparent">
              Get the news that actually matters.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            WhatsUpMarket is a Discord community for filtered financial news. We scan headlines,
            score importance, and post only the high-signal stories so you can trade the tape with
            1,000+ other members — not another inbox.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <JoinDiscordButton className="gap-2 font-semibold">
              Join my Discord server
              <ArrowRight className="h-4 w-4" />
            </JoinDiscordButton>
            <a
              href="#feed"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/5"
            >
              See what gets posted
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
                1,000+ IN SERVER
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
          { value: 1000, suffix: "+", label: "Discord members" },
          { value: 5, suffix: "", label: "Sectors we watch" },
          { value: 24, suffix: "/7", label: "Filtered news feed" },
          { value: 0, suffix: "", label: "Price to join" },
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

function WhyJoin() {
  return (
    <section id="why" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-300">Why join</p>
      <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
        A market desk in Discord — already 1,000+ deep.
      </h2>
      <p className="mt-4 max-w-2xl text-zinc-400">
        This is not software you buy. It is a server you hop into. Come for the filtered news,
        stay for the people watching the same tape.
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

function Feed() {
  return (
    <section id="feed" className="scroll-mt-24 border-y border-white/5 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-6xl px-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-300">The feed</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          How stories make it into the server.
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

function Join() {
  return (
    <section id="join" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-12 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/40 via-ink to-emerald-950/30 p-8 sm:p-12">
        <BorderBeam size={120} duration={10} colorFrom="#a78bfa" colorTo="#34d399" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-300">Join the server</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold text-white sm:text-4xl">
          1,000+ people are already in. Come through.
        </h2>
        <p className="mt-4 max-w-xl text-zinc-400">
          Hop into WhatsUpMarket on Discord. Get the filtered market brief, talk the names that
          matter, and skip the rest. Free to join — just hit the invite.
        </p>
        <div className="mt-8">
          <JoinDiscordButton className="gap-2 font-semibold">
            Join my Discord server
            <ArrowRight className="h-4 w-4" />
          </JoinDiscordButton>
        </div>
        <p className="mt-6 font-mono text-xs text-zinc-500">
          discord.gg · WhatsUpMarket · 1,000+ members
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-sm text-zinc-500 sm:flex-row">
        <Logo />
        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noreferrer"
          className="transition hover:text-white"
        >
          Join the Discord · 1,000+ members
        </a>
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
      <WhyJoin />
      <Feed />
      <Sectors />
      <Join />
      <Footer />
    </div>
  );
}
