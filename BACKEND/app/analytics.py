# app/analytics.py
import json, os, datetime, time
from typing import Dict, Any, List
from threading import RLock
from app.config import settings

LOG_PATH = os.path.join(settings.FILES_DIR, "analytics.jsonl")
_lock = RLock()

def _ensure_parent():
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    if not os.path.exists(LOG_PATH):
        with open(LOG_PATH, "a", encoding="utf-8") as _:
            pass

def log_event(event: Dict[str, Any]) -> None:
    _ensure_parent()
    with _lock:
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(event, ensure_ascii=False) + "\n")

def read_events(limit: int | None = None) -> List[Dict[str, Any]]:
    _ensure_parent()
    with _lock:
        with open(LOG_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()
    items = [json.loads(x) for x in lines if x.strip()]
    items.reverse()  # newest first
    return items[:limit] if limit else items


# ====================================================================
# FIXED: Safe timestamp parser that ALWAYS returns timezone-aware UTC
# ====================================================================
def parse_ts(ts: str):
    try:
        dt = datetime.datetime.fromisoformat(ts)
        if dt.tzinfo is None:           # naive → make UTC
            dt = dt.replace(tzinfo=datetime.timezone.utc)
        return dt
    except Exception:
        return None


# ====================================================================
# MAIN STATS FUNCTION (FIXED)
# ====================================================================
def compute_stats() -> Dict[str, Any]:
    items = read_events(limit=None)
    total = len(items)

    if total == 0:
        return {
            "totalImages": 0,
            "successRate": 0.0,
            "avgConfidence": 0.0,
            "totalProcessingTime": "0ms",
            "avgProcessingMs": 0,
            "todayAnalyses": 0,
            "weekGrowth": "0%",
            "distribution": {"homogeneous": 0, "inhomogeneous": 0, "dark": 0, "sky": 0},
            "recent": [],
        }

    # success rate (all entries count as valid)
    success_rate = 100.0

    avg_conf = sum(x.get("confidence", 0.0) for x in items) / total * 100.0

    proc_ms = sum(x.get("processing_ms", 0) for x in items)
    avg_ms = int(proc_ms / total)
    total_proc_str = _format_duration(proc_ms)

    # today’s count
    today = datetime.datetime.now(datetime.timezone.utc).date()

    def is_today(ts: str) -> bool:
        dt = parse_ts(ts)
        return dt is not None and dt.date() == today

    today_count = sum(1 for x in items if is_today(x.get("ts", "")))

    # ====================================================================
    # FIXED: Week and previous-week comparisons (timezone aware)
    # ====================================================================
    now = datetime.datetime.now(datetime.timezone.utc)
    seven = now - datetime.timedelta(days=7)
    fourteen = now - datetime.timedelta(days=14)

    week = [
        x for x in items
        if (dt := parse_ts(x.get("ts", ""))) and dt >= seven
    ]

    prev = [
        x for x in items
        if (dt := parse_ts(x.get("ts", ""))) and fourteen <= dt < seven
    ]

    week_growth = _growth_percent(len(week), len(prev))

    # distribution
    dist = {"homogeneous": 0, "inhomogeneous": 0, "dark": 0, "sky": 0}
    for x in items:
        c = x.get("fog_class")
        if c in dist:
            dist[c] += 1

    return {
        "totalImages": total,
        "successRate": round(success_rate, 1),
        "avgConfidence": round(avg_conf, 1),
        "totalProcessingTime": total_proc_str,
        "avgProcessingMs": avg_ms,
        "todayAnalyses": today_count,
        "weekGrowth": week_growth,
        "distribution": dist,
        "recent": items[:10],   # optional, remove if unused
    }


# ====================================================================
# Helpers
# ====================================================================
def _format_duration(ms: int) -> str:
    if ms < 1000:
        return f"{ms}ms"
    s = ms / 1000.0
    if s < 60:
        return f"{s:.1f}s"
    m = int(s // 60)
    if m < 60:
        rem_s = int(s - m * 60)
        return f"{m}m {rem_s}s"
    h = int(m // 60)
    rem_m = m - h * 60
    return f"{h}h {rem_m}m"


def _growth_percent(cur: int, prev: int) -> str:
    if prev == 0:
        return f"+{100 if cur > 0 else 0}%"
    pct = (cur - prev) / prev * 100.0
    sign = "+" if pct >= 0 else ""
    return f"{sign}{pct:.1f}%"
