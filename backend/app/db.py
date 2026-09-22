import os
import sqlite3
import uuid
from datetime import datetime, date
from typing import Any, Dict, List, Optional
from app.supabase_client import supabase

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "finsight.db")


def get_sqlite_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes local SQLite tables and seeds initial data if empty."""
    conn = get_sqlite_conn()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT '00000000-0000-0000-0000-000000000000',
        description TEXT,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        account TEXT DEFAULT 'Main Checking',
        transaction_date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT '00000000-0000-0000-0000-000000000000',
        category TEXT NOT NULL,
        limit_amount REAL NOT NULL,
        spent_amount REAL DEFAULT 0,
        icon TEXT DEFAULT '📦',
        color TEXT DEFAULT '#6366f1',
        bg_color TEXT DEFAULT '#ede9fe',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT '00000000-0000-0000-0000-000000000000',
        name TEXT NOT NULL,
        target REAL NOT NULL,
        saved REAL DEFAULT 0,
        icon TEXT DEFAULT '🎯',
        color TEXT DEFAULT '#6366f1',
        bg_color TEXT DEFAULT '#ede9fe',
        deadline TEXT DEFAULT 'No deadline',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS loans (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT '00000000-0000-0000-0000-000000000000',
        loan_direction TEXT NOT NULL,
        person TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT DEFAULT 'Cash',
        date TEXT NOT NULL,
        next_settlement TEXT,
        return_date TEXT,
        interest_rate REAL DEFAULT 0.0,
        notes TEXT DEFAULT '',
        settled INTEGER DEFAULT 0,
        settled_amount REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS assistant_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT '00000000-0000-0000-0000-000000000000',
        role TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()

    # Seed transactions if empty
    cur.execute("SELECT COUNT(*) FROM transactions")
    if cur.fetchone()[0] == 0:
        seed_transactions = [
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Grocery Store", 62.50, "expense", "Food & Dining", "Main Checking", "2026-09-03"),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Monthly Salary", 3500.00, "income", "Salary", "Main Checking", "2026-09-02"),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Netflix", 15.99, "expense", "Entertainment", "Platinum Card", "2026-09-02"),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Bus Pass", 45.00, "expense", "Transport", "Main Checking", "2026-09-01"),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Electric Bill", 120.00, "expense", "Bills", "Main Checking", "2026-08-28"),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Freelance Design", 850.00, "income", "Salary", "Main Checking", "2026-08-20"),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Zara Clothing", 145.00, "expense", "Shopping", "Platinum Card", "2026-08-15"),
        ]
        cur.executemany(
            "INSERT INTO transactions (id, user_id, description, amount, type, category, account, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            seed_transactions,
        )

    # Seed budgets if empty
    cur.execute("SELECT COUNT(*) FROM budgets")
    if cur.fetchone()[0] == 0:
        seed_budgets = [
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Food & Dining", 500.00, 320.00, "🍔", "#6366f1", "#ede9fe"),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Transport", 200.00, 145.00, "🚌", "#10b981", "#ecfdf5"),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Shopping", 400.00, 390.00, "🛍️", "#f59e0b", "#fffbeb"),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Bills", 300.00, 300.00, "📄", "#f43f5e", "#fff1f2"),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Entertainment", 150.00, 60.00, "🎬", "#8b5cf6", "#f5f3ff"),
        ]
        cur.executemany(
            "INSERT INTO budgets (id, user_id, category, limit_amount, spent_amount, icon, color, bg_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            seed_budgets,
        )

    # Seed goals if empty
    cur.execute("SELECT COUNT(*) FROM goals")
    if cur.fetchone()[0] == 0:
        seed_goals = [
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Emergency Fund", 5000.00, 3200.00, "🛡️", "#6366f1", "#ede9fe", "Dec 2026"),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "Vacation", 2000.00, 850.00, "✈️", "#10b981", "#ecfdf5", "Jun 2027"),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "New Laptop", 1200.00, 1200.00, "💻", "#059669", "#ecfdf5", "Completed"),
        ]
        cur.executemany(
            "INSERT INTO goals (id, user_id, name, target, saved, icon, color, bg_color, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            seed_goals,
        )

    conn.commit()
    conn.close()


# Initialize on import
init_db()


def clean_row_for_supabase(table: str, data: Dict[str, Any]) -> Dict[str, Any]:
    cleaned = {}
    for k, v in data.items():
        if isinstance(v, (datetime, date)):
            cleaned[k] = v.isoformat()
        elif (v == "" or v == "No deadline") and any(substr in k for substr in ("date", "settlement", "deadline", "time")):
            cleaned[k] = None
        else:
            cleaned[k] = v

    # Ensure schema compatibility for Supabase Postgres constraints
    if table == "budgets":
        amt = cleaned.get("limit_amount") if cleaned.get("limit_amount") is not None else cleaned.get("amount")
        if amt is not None:
            cleaned["amount"] = float(amt)
            cleaned["limit_amount"] = float(amt)
        if not cleaned.get("period"):
            cleaned["period"] = "monthly"
        if not cleaned.get("start_date"):
            cleaned["start_date"] = datetime.now().strftime("%Y-%m-01")
        if not cleaned.get("end_date"):
            cleaned["end_date"] = datetime.now().strftime("%Y-%m-30")

    elif table == "goals":
        target = cleaned.get("target") if cleaned.get("target") is not None else cleaned.get("target_amount")
        if target is not None:
            cleaned["target"] = float(target)
            cleaned["target_amount"] = float(target)
        saved = cleaned.get("saved") if cleaned.get("saved") is not None else cleaned.get("current_amount")
        if saved is not None:
            cleaned["saved"] = float(saved)
            cleaned["current_amount"] = float(saved)

    return cleaned


class ResilientDB:
    """Provides resilient database operations with Supabase primary + SQLite fallback."""

    @staticmethod
    def select(table: str, user_id: str, order_col: str = "created_at", desc: bool = True) -> List[Dict[str, Any]]:
        try:
            query = supabase.table(table).select("*").eq("user_id", user_id)
            if order_col:
                query = query.order(order_col, desc=desc)
            res = query.execute()
            if res.data is not None:
                return res.data
        except Exception as e:
            err_msg = str(e).encode("ascii", "backslashreplace").decode("ascii")
            print(f"SUPABASE SELECT ERROR on {table} (falling back to SQLite): {err_msg}")

        # Fallback to SQLite
        conn = get_sqlite_conn()
        cur = conn.cursor()
        order_clause = f"ORDER BY {order_col} {'DESC' if desc else 'ASC'}" if order_col else ""
        cur.execute(f"SELECT * FROM {table} WHERE user_id = ? {order_clause}", (user_id,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

    @staticmethod
    def insert(table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        data = clean_row_for_supabase(table, data)
        # Ensure id is a valid UUID string
        raw_id = data.get("id")
        try:
            if raw_id:
                uuid.UUID(str(raw_id))
                data["id"] = str(raw_id)
            else:
                data["id"] = str(uuid.uuid4())
        except (ValueError, AttributeError):
            data["id"] = str(uuid.uuid4())

        try:
            res = supabase.table(table).insert(data).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            err_msg = str(e).encode("ascii", "backslashreplace").decode("ascii")
            print(f"SUPABASE INSERT ERROR on {table} (falling back to SQLite): {err_msg}")

        # Fallback to SQLite
        conn = get_sqlite_conn()
        cur = conn.cursor()
        cur.execute(f"PRAGMA table_info({table})")
        sqlite_cols = {col[1] for col in cur.fetchall()}
        filtered_data = {k: v for k, v in data.items() if k in sqlite_cols}

        cols = list(filtered_data.keys())
        placeholders = ", ".join(["?"] * len(cols))
        col_names = ", ".join(cols)
        values = [filtered_data[c] for c in cols]
        cur.execute(f"INSERT OR REPLACE INTO {table} ({col_names}) VALUES ({placeholders})", values)
        conn.commit()
        cur.execute(f"SELECT * FROM {table} WHERE id = ?", (data["id"],))
        row = dict(cur.fetchone())
        conn.close()
        return row

    @staticmethod
    def update(table: str, item_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        data = clean_row_for_supabase(table, data)
        str_id = str(item_id)
        # Try Supabase first
        try:
            res = supabase.table(table).update(data).eq("id", str_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            err_msg = str(e).encode("ascii", "backslashreplace").decode("ascii")
            print(f"SUPABASE UPDATE ERROR on {table}: {err_msg}")

        # Fallback to SQLite
        conn = get_sqlite_conn()
        cur = conn.cursor()
        cur.execute(f"PRAGMA table_info({table})")
        sqlite_cols = {col[1] for col in cur.fetchall()}
        filtered_data = {k: v for k, v in data.items() if k in sqlite_cols}

        set_clauses = ", ".join([f"{k} = ?" for k in filtered_data.keys()])
        values = list(filtered_data.values()) + [str_id]
        cur.execute(f"UPDATE {table} SET {set_clauses} WHERE id = ?", values)
        conn.commit()
        cur.execute(f"SELECT * FROM {table} WHERE id = ?", (str_id,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def delete(table: str, item_id: str) -> bool:
        str_id = str(item_id)
        # Try Supabase first
        try:
            supabase.table(table).delete().eq("id", str_id).execute()
        except Exception as e:
            err_msg = str(e).encode("ascii", "backslashreplace").decode("ascii")
            print(f"SUPABASE DELETE ERROR on {table}: {err_msg}")

        # Delete in SQLite
        conn = get_sqlite_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {table} WHERE id = ?", (str_id,))
        conn.commit()
        conn.close()
        return True
