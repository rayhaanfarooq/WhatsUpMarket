import { useCallback, useEffect, useMemo, useState } from "react";
import { getFeed, getRuns, getStats, previewPipeline, runPipeline } from "./api";

const SECTORS = [
  { value: "", label: "All sectors" },
  { value: "semiconductors", label: "Semiconductors" },
  { value: "memory", label: "Memory" },
  { value: "nuclear", label: "Nuclear" },
  { value: "energy", label: "Energy" },
  { value: "ai_infrastructure", label: "AI infrastructure" },
];

const DECISIONS = ["", "PUSH", "LOW", "SKIP"];

function decisionStyle(decision) {
  if (decision === "PUSH") return "bg-emerald-400/15 text-emerald-300";
  if (decision === "LOW") return "bg-amber-400/15 text-amber-200";
  return "bg-zinc-700/70 text-zinc-400";
}

function impactStyle(impact) {
  if (impact === "positive") return "text-emerald-300";
  if (impact === "negative") return "text-rose-300";
  return "text-zinc-400";
}

function formatWhen(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{value ?? "—"}</p>
    </div>
  );
}

export default function App() {
  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState([]);
  const [runs, setRuns] = useState([]);
  const [decision, setDecision] = useState("");
  const [sector, setSector] = useState("");
  const [ticker, setTicker] = useState("");
  const [topic, setTopic] = useState("technology");
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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
        ticker: ticker.trim() || undefined,
        topic: topic.trim() || undefined,
        limit,
      };
      if (kind === "run") {
        const summary = await runPipeline(payload);
        setLastAction(
          `Published ${summary.articles_published} of ${summary.articles_fetched} (${summary.articles_duplicate} already seen).`
        );
      } else {
        const items = await previewPipeline(payload);
        setLastAction(`Previewed ${items.length} articles without posting to Discord.`);
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

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Operator</p>
            <h1 className="text-xl font-semibold text-white">WhatsUpMarket dashboard</h1>
          </div>
          <p className="hidden text-sm text-zinc-500 sm:block">
            Last run {formatWhen(stats?.last_run_at)}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-8">
        {error ? (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
        {lastAction ? (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {lastAction}
          </div>
        ) : null}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Articles stored" value={stats?.articles_stored} />
          <StatCard label="Published to Discord" value={stats?.published} />
          <StatCard label="Pipeline runs" value={stats?.pipeline_runs} />
          <StatCard
            label="Latest PUSH / LOW / SKIP"
            value={`${decisionCounts.PUSH} / ${decisionCounts.LOW} / ${decisionCounts.SKIP}`}
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-zinc-400">
              Topic
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-400">
              Ticker filter
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="NVDA"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-400">
              Limit
              <input
                type="number"
                min={1}
                max={50}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value) || 10)}
                className="w-20 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => onPipeline("preview")}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5 disabled:opacity-50"
            >
              {busy ? "Running…" : "Preview"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onPipeline("run")}
              className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              Run + publish
            </button>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Preview analyzes and stores history without Discord. Run publishes only new PUSH stories.
          </p>
        </section>

        <section className="flex flex-wrap gap-3">
          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            {DECISIONS.map((item) => (
              <option key={item || "all"} value={item}>
                {item ? item : "All decisions"}
              </option>
            ))}
          </select>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            {SECTORS.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">Feed</h2>
          {feed.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
              No stored analyses yet. Hit Preview or Run to populate the tape.
            </p>
          ) : (
            feed.map((item) => (
              <article
                key={`${item.article_id}-${item.analyzed_at}`}
                className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] ${decisionStyle(item.decision)}`}>
                    {item.decision} · {Number(item.importance).toFixed(2)}
                  </span>
                  {item.published ? (
                    <span className="rounded-md bg-violet-400/15 px-2 py-0.5 font-mono text-[11px] text-violet-200">
                      DISCORD
                    </span>
                  ) : null}
                  <span className={`text-xs ${impactStyle(item.impact)}`}>{item.impact}</span>
                  <span className="ml-auto text-xs text-zinc-500">{formatWhen(item.analyzed_at)}</span>
                </div>
                <h3 className="mt-2 text-base font-medium text-white">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className="hover:underline">
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{item.summary}</p>
                <p className="mt-3 text-sm text-zinc-300">{item.reason}</p>
                <p className="mt-2 font-mono text-[11px] text-zinc-500">
                  {(item.sectors || []).join(" · ") || "no sector"}
                  {" · "}
                  {(item.tickers || []).map((t) => `$${t}`).join(" ") || "no tickers"}
                  {item.source ? ` · ${item.source}` : ""}
                </p>
              </article>
            ))
          )}
        </section>

        <section className="pb-10">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
            Recent runs
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Finished</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Fetched</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3">Duplicates</th>
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-zinc-500" colSpan={5}>
                      No pipeline runs stored yet.
                    </td>
                  </tr>
                ) : (
                  runs.map((run) => (
                    <tr key={run.finished_at + run.started_at} className="border-t border-white/5">
                      <td className="px-4 py-3 text-zinc-300">{formatWhen(run.finished_at)}</td>
                      <td className="px-4 py-3 text-zinc-400">{run.topic || run.ticker || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{run.articles_fetched}</td>
                      <td className="px-4 py-3 tabular-nums text-emerald-300">{run.articles_published}</td>
                      <td className="px-4 py-3 tabular-nums text-zinc-400">{run.articles_duplicate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
