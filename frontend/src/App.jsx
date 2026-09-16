import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Database,
  Play,
  Radio,
  Send,
  Sparkles,
  Webhook,
} from "lucide-react";
import { getFeed, getRuns, getStats, previewPipeline, runPipeline } from "./api";

const SECTORS = [
  { value: "", label: "All desks" },
  { value: "tech", label: "Tech" },
  { value: "nuclear", label: "Nuclear" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "energy", label: "Energy" },
  { value: "industrials", label: "Industrials" },
  { value: "consumer", label: "Consumer" },
];

const DECISION_TABS = [
  { value: "", label: "All" },
  { value: "PUSH", label: "Push" },
  { value: "LOW", label: "Low" },
  { value: "SKIP", label: "Skip" },
];

function decisionTone(decision) {
  if (decision === "PUSH") {
    return {
      badge: "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/20",
      bar: "bg-emerald-400",
      rail: "from-emerald-400/80",
    };
  }
  if (decision === "LOW") {
    return {
      badge: "bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/20",
      bar: "bg-amber-400",
      rail: "from-amber-400/70",
    };
  }
  return {
    badge: "bg-zinc-500/20 text-zinc-400 ring-1 ring-white/10",
    bar: "bg-zinc-500",
    rail: "from-zinc-500/50",
  };
}

function impactLabel(impact) {
  if (impact === "positive") return { text: "Positive", className: "text-emerald-300" };
  if (impact === "negative") return { text: "Negative", className: "text-rose-300" };
  return { text: "Neutral", className: "text-zinc-400" };
}

function formatWhen(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSector(key) {
  return (
    {
      tech: "Tech",
      nuclear: "Nuclear",
      healthcare: "Healthcare",
      finance: "Finance",
      energy: "Energy",
      industrials: "Industrials",
      consumer: "Consumer",
      general: "General",
      semiconductors: "Semiconductors",
      memory: "Memory",
      ai_infrastructure: "AI infrastructure",
    }[key] || key
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight text-white">
            {value ?? "—"}
          </p>
          {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-300">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function MixBar({ push = 0, low = 0, skip = 0 }) {
  const total = Math.max(push + low + skip, 1);
  return (
    <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-white/10">
      <div className="bg-emerald-400" style={{ width: `${(push / total) * 100}%` }} />
      <div className="bg-amber-400" style={{ width: `${(low / total) * 100}%` }} />
      <div className="bg-zinc-500" style={{ width: `${(skip / total) * 100}%` }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

const fieldClass =
  "rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10";

export default function App() {
  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState([]);
  const [runs, setRuns] = useState([]);
  const [decision, setDecision] = useState("");
  const [sector, setSector] = useState("");
  const [ticker, setTicker] = useState("");
  const [pipelineTicker, setPipelineTicker] = useState("");
  const [topic, setTopic] = useState("technology");
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastAction, setLastAction] = useState("");

  const load = useCallback(async () => {
    const [nextStats, nextFeed, nextRuns] = await Promise.all([
      getStats(),
      getFeed({ decision, sector, ticker: ticker.trim() || undefined }),
      getRuns(),
    ]);
    setStats(nextStats);
    setFeed(nextFeed);
    setRuns(nextRuns);
  }, [decision, sector, ticker]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError("");
        await load();
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not reach the API. Is the backend running?");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function onPipeline(kind) {
    setBusy(true);
    setError("");
    setLastAction("");
    try {
      const payload = {
        ticker: pipelineTicker.trim() || undefined,
        topic: topic.trim() || undefined,
        limit,
      };
      if (kind === "run") {
        const summary = await runPipeline(payload);
        setLastAction(
          `Published ${summary.articles_published} of ${summary.articles_fetched} · ${summary.articles_duplicate} already on tape`
        );
      } else {
        const items = await previewPipeline(payload);
        setLastAction(`Scored ${items.length} headlines. Nothing sent to Discord.`);
      }
      await load();
    } catch (err) {
      setError(err.message || "Pipeline failed.");
    } finally {
      setBusy(false);
    }
  }

  const decisionCounts = useMemo(
    () => stats?.latest_by_decision ?? { PUSH: 0, LOW: 0, SKIP: 0 },
    [stats]
  );

  const mixTotal =
    decisionCounts.PUSH + decisionCounts.LOW + decisionCounts.SKIP || 0;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
              <Sparkles className="h-4 w-4 text-emerald-300" />
            </span>
            <div>
              <p className="font-display text-lg font-bold tracking-tight text-white">WhatsUpMarket</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Market brief · operator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-zinc-400 sm:inline-flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              API live
            </span>
            <p className="hidden text-zinc-500 md:block">
              Last run <span className="text-zinc-300">{formatWhen(stats?.last_run_at)}</span>
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}
        {lastAction ? (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {lastAction}
          </div>
        ) : null}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={Database}
            label="On tape"
            value={stats?.articles_stored}
            hint="Unique stories stored"
          />
          <StatCard
            icon={Webhook}
            label="Discord"
            value={stats?.published}
            hint="Sent once, never twice"
          />
          <StatCard
            icon={Activity}
            label="Runs"
            value={stats?.pipeline_runs}
            hint="Preview and publish"
          />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Signal mix</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight text-white">
              {decisionCounts.PUSH}
              <span className="text-lg font-semibold text-zinc-500"> / {mixTotal || 0}</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {decisionCounts.PUSH} push · {decisionCounts.LOW} low · {decisionCounts.SKIP} skip
            </p>
            <MixBar
              push={decisionCounts.PUSH}
              low={decisionCounts.LOW}
              skip={decisionCounts.SKIP}
            />
          </div>
        </section>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">Tape</p>
                <h2 className="font-display text-2xl font-bold text-white">Scored headlines</h2>
              </div>
              <p className="text-xs text-zinc-500">
                {loading ? "Loading…" : `${feed.length} on this view`}
              </p>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {DECISION_TABS.map((tab) => {
                const active = decision === tab.value;
                return (
                  <button
                    key={tab.value || "all"}
                    type="button"
                    onClick={() => setDecision(tab.value)}
                    className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                      active
                        ? "bg-white text-ink"
                        : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
              <div className="h-5 w-px bg-white/10" />
              {SECTORS.map((item) => {
                const active = sector === item.value;
                return (
                  <button
                    key={item.value || "all-sectors"}
                    type="button"
                    onClick={() => setSector(item.value)}
                    className={`rounded-full px-3 py-1.5 text-xs transition ${
                      active
                        ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : "border border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <Field label="Search ticker on tape">
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Filter stored stories · NVDA"
                className={`${fieldClass} mb-4 max-w-sm`}
              />
            </Field>

            <div className="space-y-3">
              {feed.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
                  <Radio className="mx-auto h-6 w-6 text-zinc-600" />
                  <p className="mt-3 text-sm text-zinc-400">
                    No stories on this view. Run a preview to populate the tape.
                  </p>
                </div>
              ) : (
                feed.map((item) => {
                  const tone = decisionTone(item.decision);
                  const impact = impactLabel(item.impact);
                  const score = Math.max(0, Math.min(1, Number(item.importance) || 0));
                  return (
                    <article
                      key={`${item.article_id}-${item.analyzed_at}`}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/50 p-5 transition hover:border-white/20"
                    >
                      <div className={`absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b ${tone.rail} to-transparent`} />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] ${tone.badge}`}>
                          {item.decision} · {score.toFixed(2)}
                        </span>
                        {item.published ? (
                          <span className="rounded-md bg-violet-400/15 px-2 py-0.5 font-mono text-[11px] text-violet-200 ring-1 ring-violet-400/20">
                            Discord
                          </span>
                        ) : null}
                        <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-zinc-300">
                          {formatSector(item.market_sector || "general")}
                        </span>
                        <span className={`text-xs ${impact.className}`}>{impact.text}</span>
                        <span className="ml-auto font-mono text-[11px] text-zinc-500">
                          {formatWhen(item.analyzed_at)}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-white">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-start gap-1.5 hover:text-emerald-200"
                          >
                            {item.title}
                            <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-zinc-500" />
                          </a>
                        ) : (
                          item.title
                        )}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                        {item.summary}
                      </p>
                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                          <span>Importance</span>
                          <span>{Math.round(score * 100)}%</span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full ${tone.bar}`} style={{ width: `${score * 100}%` }} />
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-zinc-300">{item.reason}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {item.market_sector ? (
                          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-emerald-200">
                            {formatSector(item.market_sector)}
                          </span>
                        ) : null}
                        {(item.sectors || []).map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-400"
                          >
                            {formatSector(s)}
                          </span>
                        ))}
                        {(item.tickers || []).slice(0, 6).map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-300"
                          >
                            ${t}
                          </span>
                        ))}
                        {item.source ? (
                          <span className="ml-auto text-xs text-zinc-600">{item.source}</span>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">Console</p>
              <h2 className="mt-1 font-display text-xl font-bold text-white">Run the desk</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Preview scores into SQLite. Publish sends only new PUSH stories to Discord.
              </p>
              <div className="mt-5 space-y-3">
                <Field label="Topic">
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className={fieldClass}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Ticker">
                    <input
                      value={pipelineTicker}
                      onChange={(e) => setPipelineTicker(e.target.value.toUpperCase())}
                      placeholder="Optional"
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Limit">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value) || 10)}
                      className={fieldClass}
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onPipeline("preview")}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 text-sm text-zinc-100 transition hover:bg-white/5 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  {busy ? "Running…" : "Preview tape"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onPipeline("run")}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(16,185,129,0.25)] transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Publish to Discord
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">History</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-white">Recent runs</h3>
              <ul className="mt-4 space-y-3">
                {runs.length === 0 ? (
                  <li className="text-sm text-zinc-500">No runs yet.</li>
                ) : (
                  runs.slice(0, 8).map((run) => (
                    <li
                      key={run.finished_at + run.started_at}
                      className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-zinc-400">
                          {formatWhen(run.finished_at)}
                        </span>
                        <span className="font-mono text-[11px] text-emerald-300">
                          {run.articles_published} sent
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-200">
                        {run.topic || run.ticker || "unfiltered"}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-zinc-500">
                        {run.articles_fetched} fetched · {run.articles_duplicate} dupes
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
