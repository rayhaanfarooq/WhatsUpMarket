"""Persistence for articles, analyses, publishes, and pipeline runs.

Uses Supabase/Postgres when DATABASE_URL is set (required on Render).
Falls back to local SQLite for development without Postgres.
"""

from __future__ import annotations

import hashlib
import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from threading import Lock
from typing import Any, Iterator

from config import DATABASE_PATH, DATABASE_URL
from models.schemas import Analysis, Article

_lock = Lock()
_pg_module = None

SQLITE_SCHEMA = """
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

POSTGRES_SCHEMA = """
CREATE TABLE IF NOT EXISTS articles (
    id BIGSERIAL PRIMARY KEY,
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
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES articles(id),
    relevant INTEGER NOT NULL,
    importance DOUBLE PRECISION NOT NULL,
    sectors_json TEXT NOT NULL DEFAULT '[]',
    tickers_json TEXT NOT NULL DEFAULT '[]',
    impact TEXT NOT NULL,
    reason TEXT NOT NULL DEFAULT '',
    decision TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS publishes (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL UNIQUE REFERENCES articles(id),
    analysis_id BIGINT NOT NULL REFERENCES analyses(id),
    published_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
    id BIGSERIAL PRIMARY KEY,
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


def uses_postgres() -> bool:
    url = (DATABASE_URL or "").strip()
    return url.startswith("postgres://") or url.startswith("postgresql://")


def backend_name() -> str:
    return "postgres" if uses_postgres() else "sqlite"


def _pg_dsn() -> str:
    url = (DATABASE_URL or "").strip()
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://") :]
    if "sslmode=" not in url:
        joiner = "&" if "?" in url else "?"
        url = f"{url}{joiner}sslmode=require"
    return url


def _psycopg():
    global _pg_module
    if _pg_module is None:
        import psycopg
        from psycopg.rows import dict_row

        _pg_module = (psycopg, dict_row)
    return _pg_module


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _dumps(value: list[str]) -> str:
    return json.dumps(value)


def _loads(raw: str | None) -> list[str]:
    if not raw:
        return []
    if isinstance(raw, list):
        return [str(item) for item in raw]
    try:
        data = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return []
    return [str(item) for item in data] if isinstance(data, list) else []


def _as_dict(row: Any) -> dict[str, Any]:
    if row is None:
        return {}
    if isinstance(row, dict):
        return row
    return dict(row)


def _count(row: Any) -> int:
    data = _as_dict(row)
    if "n" in data:
        return int(data["n"])
    return int(row[0])


def article_fingerprint(article: Article) -> str:
    """Stable identity for dedup: URL when present, otherwise title."""
    key = (article.url or "").strip() or f"title:{(article.title or '').strip().lower()}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


@contextmanager
def _connect() -> Iterator[Any]:
    if uses_postgres():
        psycopg, dict_row = _psycopg()
        conn = psycopg.connect(_pg_dsn(), row_factory=dict_row)
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
        return

    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def _prepare(sql: str) -> str:
    if uses_postgres():
        return sql.replace("?", "%s")
    return sql


def _execute(conn: Any, sql: str, params: tuple[Any, ...] | list[Any] = ()) -> Any:
    return conn.execute(_prepare(sql), params)


def _insert_returning_id(conn: Any, sql: str, params: tuple[Any, ...]) -> int:
    if uses_postgres():
        row = conn.execute(_prepare(sql.rstrip().rstrip(";") + " RETURNING id"), params).fetchone()
        return int(_as_dict(row)["id"])
    cursor = conn.execute(sql, params)
    return int(cursor.lastrowid)


def init_db() -> None:
    """Create tables if they do not exist."""
    schema = POSTGRES_SCHEMA if uses_postgres() else SQLITE_SCHEMA
    with _lock:
        with _connect() as conn:
            if uses_postgres():
                for statement in schema.split(";"):
                    statement = statement.strip()
                    if statement:
                        conn.execute(statement)
            else:
                conn.executescript(schema)


def upsert_article(article: Article) -> tuple[int, bool]:
    """Insert or return an existing article. Returns (id, created)."""
    fingerprint = article_fingerprint(article)
    now = _now()
    with _lock:
        with _connect() as conn:
            existing = _execute(
                conn,
                "SELECT id FROM articles WHERE fingerprint = ?",
                (fingerprint,),
            ).fetchone()
            if existing:
                return int(_as_dict(existing)["id"]), False
            article_id = _insert_returning_id(
                conn,
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
            return article_id, True


def save_analysis(article_id: int, analysis: Analysis, decision: str) -> int:
    now = _now()
    with _lock:
        with _connect() as conn:
            return _insert_returning_id(
                conn,
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


def is_published(article_id: int) -> bool:
    with _lock:
        with _connect() as conn:
            row = _execute(
                conn,
                "SELECT 1 AS n FROM publishes WHERE article_id = ?",
                (article_id,),
            ).fetchone()
            return row is not None


def record_publish(article_id: int, analysis_id: int) -> None:
    now = _now()
    with _lock:
        with _connect() as conn:
            if uses_postgres():
                conn.execute(
                    """
                    INSERT INTO publishes (article_id, analysis_id, published_at)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (article_id) DO NOTHING
                    """,
                    (article_id, analysis_id, now),
                )
            else:
                conn.execute(
                    """
                    INSERT OR IGNORE INTO publishes (article_id, analysis_id, published_at)
                    VALUES (?, ?, ?)
                    """,
                    (article_id, analysis_id, now),
                )


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
        with _connect() as conn:
            _execute(
                conn,
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
        with _connect() as conn:
            rows = _execute(conn, query, params).fetchall()

    items: list[dict[str, Any]] = []
    for row in rows:
        data = _as_dict(row)
        items.append(
            {
                "article_id": data["article_id"],
                "title": data["title"],
                "summary": data["summary"],
                "url": data["url"],
                "source": data["source"],
                "tickers": _loads(data["tickers_json"]) or _loads(data["article_tickers_json"]),
                "sectors": _loads(data["sectors_json"]),
                "importance": data["importance"],
                "impact": data["impact"],
                "relevant": bool(data["relevant"]),
                "decision": data["decision"],
                "reason": data["reason"],
                "published": bool(data["published"]),
                "analyzed_at": data["analyzed_at"],
            }
        )
    return items


def get_stats() -> dict[str, Any]:
    with _lock:
        with _connect() as conn:
            articles_stored = _count(_execute(conn, "SELECT COUNT(*) AS n FROM articles").fetchone())
            analyses_stored = _count(_execute(conn, "SELECT COUNT(*) AS n FROM analyses").fetchone())
            published = _count(_execute(conn, "SELECT COUNT(*) AS n FROM publishes").fetchone())
            pipeline_runs = _count(_execute(conn, "SELECT COUNT(*) AS n FROM pipeline_runs").fetchone())
            last_run = _execute(
                conn,
                "SELECT finished_at FROM pipeline_runs ORDER BY id DESC LIMIT 1",
            ).fetchone()
            decision_rows = _execute(
                conn,
                """
                SELECT decision, COUNT(*) AS n
                FROM analyses
                WHERE id IN (
                    SELECT MAX(id) FROM analyses GROUP BY article_id
                )
                GROUP BY decision
                """,
            ).fetchall()

    last = _as_dict(last_run)
    by_decision = {_as_dict(row)["decision"]: _as_dict(row)["n"] for row in decision_rows}
    return {
        "articles_stored": int(articles_stored),
        "analyses_stored": int(analyses_stored),
        "published": int(published),
        "pipeline_runs": int(pipeline_runs),
        "last_run_at": last.get("finished_at") if last else None,
        "latest_by_decision": {
            "PUSH": int(by_decision.get("PUSH", 0)),
            "LOW": int(by_decision.get("LOW", 0)),
            "SKIP": int(by_decision.get("SKIP", 0)),
        },
    }


def list_runs(limit: int = 20) -> list[dict[str, Any]]:
    with _lock:
        with _connect() as conn:
            rows = _execute(
                conn,
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
    return [_as_dict(row) for row in rows]
