"""SQLite persistence for articles, analyses, publishes, and pipeline runs.

Used for Discord dedup and the operator dashboard. The database file lives
at DATABASE_PATH (default: backend/data/marketbrief.db).
"""

from __future__ import annotations

import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from threading import Lock
from typing import Any

from config import DATABASE_PATH
from models.schemas import Analysis, Article

_lock = Lock()

SCHEMA = """
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fingerprint TEXT NOT NULL UNIQUE,
    url TEXT,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    source TEXT,
    tickers_json TEXT NOT NULL DEFAULT '[]',
    keywords_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL REFERENCES articles(id),
    relevant INTEGER NOT NULL,
    importance REAL NOT NULL,
    sectors_json TEXT NOT NULL DEFAULT '[]',
    tickers_json TEXT NOT NULL DEFAULT '[]',
    impact TEXT NOT NULL,
    reason TEXT NOT NULL DEFAULT '',
    decision TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS publishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL UNIQUE REFERENCES articles(id),
    analysis_id INTEGER NOT NULL REFERENCES analyses(id),
    published_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT,
    topic TEXT,
    articles_fetched INTEGER NOT NULL,
    articles_analyzed INTEGER NOT NULL,
    articles_published INTEGER NOT NULL,
    articles_skipped INTEGER NOT NULL,
    articles_duplicate INTEGER NOT NULL DEFAULT 0,
    started_at TEXT NOT NULL,
    finished_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analyses_article ON analyses(article_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_decision ON analyses(decision);
"""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _dumps(value: list[str]) -> str:
    return json.dumps(value)


def _loads(raw: str | None) -> list[str]:
    if not raw:
        return []
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return []
    return [str(item) for item in data] if isinstance(data, list) else []


def article_fingerprint(article: Article) -> str:
    """Stable identity for dedup: URL when present, otherwise title."""
    key = (article.url or "").strip() or f"title:{(article.title or '').strip().lower()}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def connect() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """Create tables if they do not exist."""
    with _lock:
        conn = connect()
        try:
            conn.executescript(SCHEMA)
            conn.commit()
        finally:
            conn.close()


def upsert_article(article: Article) -> tuple[int, bool]:
    """Insert or return an existing article. Returns (id, created)."""
    fingerprint = article_fingerprint(article)
    now = _now()
    with _lock:
        conn = connect()
        try:
            existing = conn.execute(
                "SELECT id FROM articles WHERE fingerprint = ?",
                (fingerprint,),
            ).fetchone()
            if existing:
                return int(existing["id"]), False
            cursor = conn.execute(
                """
                INSERT INTO articles (
                    fingerprint, url, title, summary, source,
                    tickers_json, keywords_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    fingerprint,
                    article.url,
                    article.title,
                    article.summary,
                    article.source,
                    _dumps(article.tickers),
                    _dumps(article.keywords),
                    now,
                ),
            )
            conn.commit()
            return int(cursor.lastrowid), True
        finally:
            conn.close()


def save_analysis(article_id: int, analysis: Analysis, decision: str) -> int:
    now = _now()
    with _lock:
        conn = connect()
        try:
            cursor = conn.execute(
                """
                INSERT INTO analyses (
                    article_id, relevant, importance, sectors_json, tickers_json,
                    impact, reason, decision, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    article_id,
                    1 if analysis.relevant else 0,
                    analysis.importance,
                    _dumps(analysis.sectors),
                    _dumps(analysis.tickers),
                    analysis.impact,
                    analysis.reason,
                    decision,
                    now,
                ),
            )
            conn.commit()
            return int(cursor.lastrowid)
        finally:
            conn.close()


def is_published(article_id: int) -> bool:
    with _lock:
        conn = connect()
        try:
            row = conn.execute(
                "SELECT 1 FROM publishes WHERE article_id = ?",
                (article_id,),
            ).fetchone()
            return row is not None
        finally:
            conn.close()


def record_publish(article_id: int, analysis_id: int) -> None:
    now = _now()
    with _lock:
        conn = connect()
        try:
            conn.execute(
                """
                INSERT OR IGNORE INTO publishes (article_id, analysis_id, published_at)
                VALUES (?, ?, ?)
                """,
                (article_id, analysis_id, now),
            )
            conn.commit()
        finally:
            conn.close()


def record_run(
    *,
    ticker: str | None,
    topic: str | None,
    articles_fetched: int,
    articles_analyzed: int,
    articles_published: int,
    articles_skipped: int,
    articles_duplicate: int,
    started_at: str,
) -> None:
    finished_at = _now()
    with _lock:
        conn = connect()
        try:
            conn.execute(
                """
                INSERT INTO pipeline_runs (
                    ticker, topic, articles_fetched, articles_analyzed,
                    articles_published, articles_skipped, articles_duplicate,
                    started_at, finished_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    ticker,
                    topic,
                    articles_fetched,
                    articles_analyzed,
                    articles_published,
                    articles_skipped,
                    articles_duplicate,
                    started_at,
                    finished_at,
                ),
            )
            conn.commit()
        finally:
            conn.close()


def list_feed(
    *,
    decision: str | None = None,
    sector: str | None = None,
    ticker: str | None = None,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """Latest analysis per article, newest first."""
    query = """
        SELECT
            a.id AS article_id,
            a.title,
            a.summary,
            a.url,
            a.source,
            a.tickers_json AS article_tickers_json,
            n.relevant,
            n.importance,
            n.sectors_json,
            n.tickers_json,
            n.impact,
            n.reason,
            n.decision,
            n.created_at AS analyzed_at,
            CASE WHEN p.id IS NULL THEN 0 ELSE 1 END AS published
        FROM articles a
        JOIN analyses n ON n.id = (
            SELECT n2.id FROM analyses n2
            WHERE n2.article_id = a.id
            ORDER BY n2.created_at DESC, n2.id DESC
            LIMIT 1
        )
        LEFT JOIN publishes p ON p.article_id = a.id
        WHERE 1 = 1
    """
    params: list[Any] = []
    if decision:
        query += " AND n.decision = ?"
        params.append(decision.upper())
    if sector:
        query += " AND n.sectors_json LIKE ?"
        params.append(f"%{sector}%")
    if ticker:
        query += " AND (n.tickers_json LIKE ? OR a.tickers_json LIKE ?)"
        needle = f"%{ticker.upper()}%"
        params.extend([needle, needle])
    query += " ORDER BY n.created_at DESC, a.id DESC LIMIT ?"
    params.append(limit)

    with _lock:
        conn = connect()
        try:
            rows = conn.execute(query, params).fetchall()
        finally:
            conn.close()

    items: list[dict[str, Any]] = []
    for row in rows:
        items.append(
            {
                "article_id": row["article_id"],
                "title": row["title"],
                "summary": row["summary"],
                "url": row["url"],
                "source": row["source"],
                "tickers": _loads(row["tickers_json"]) or _loads(row["article_tickers_json"]),
                "sectors": _loads(row["sectors_json"]),
                "importance": row["importance"],
                "impact": row["impact"],
                "relevant": bool(row["relevant"]),
                "decision": row["decision"],
                "reason": row["reason"],
                "published": bool(row["published"]),
                "analyzed_at": row["analyzed_at"],
            }
        )
    return items


def get_stats() -> dict[str, Any]:
    with _lock:
        conn = connect()
        try:
            articles_stored = conn.execute("SELECT COUNT(*) FROM articles").fetchone()[0]
            analyses_stored = conn.execute("SELECT COUNT(*) FROM analyses").fetchone()[0]
            published = conn.execute("SELECT COUNT(*) FROM publishes").fetchone()[0]
            pipeline_runs = conn.execute("SELECT COUNT(*) FROM pipeline_runs").fetchone()[0]
            last_run = conn.execute(
                "SELECT finished_at FROM pipeline_runs ORDER BY id DESC LIMIT 1"
            ).fetchone()
            decision_rows = conn.execute(
                """
                SELECT decision, COUNT(*) AS n
                FROM analyses
                WHERE id IN (
                    SELECT MAX(id) FROM analyses GROUP BY article_id
                )
                GROUP BY decision
                """
            ).fetchall()
        finally:
            conn.close()

    by_decision = {row["decision"]: row["n"] for row in decision_rows}
    return {
        "articles_stored": int(articles_stored),
        "analyses_stored": int(analyses_stored),
        "published": int(published),
        "pipeline_runs": int(pipeline_runs),
        "last_run_at": last_run["finished_at"] if last_run else None,
        "latest_by_decision": {
            "PUSH": int(by_decision.get("PUSH", 0)),
            "LOW": int(by_decision.get("LOW", 0)),
            "SKIP": int(by_decision.get("SKIP", 0)),
        },
    }


def list_runs(limit: int = 20) -> list[dict[str, Any]]:
    with _lock:
        conn = connect()
        try:
            rows = conn.execute(
                """
                SELECT ticker, topic, articles_fetched, articles_analyzed,
                       articles_published, articles_skipped, articles_duplicate,
                       started_at, finished_at
                FROM pipeline_runs
                ORDER BY id DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
        finally:
            conn.close()
    return [dict(row) for row in rows]
