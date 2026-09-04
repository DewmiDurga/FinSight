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

    # Seed loans if empty
    cur.execute("SELECT COUNT(*) FROM loans")
    if cur.fetchone()[0] == 0:
        seed_loans = [
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "given", "Rahul", 2000.00, "Bank Transfer", "2026-08-01", "2026-09-15", "2026-10-01", 1.5, "Personal loan for travel", 0, 500.00),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "given", "Priya", 500.00, "Cash", "2026-08-20", "2026-09-05", "2026-09-20", 2.0, "Short-term help", 0, 0.00),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "given", "Kavinda", 1200.00, "Cash", "2026-08-25", "2026-09-25", "2026-11-25", 0.0, "Friend loan (no interest)", 0, 200.00),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "got", "Koko Finance", 5000.00, "Koko", "2026-07-15", "2026-09-15", "2026-12-15", 1.5, "Monthly installment via Koko", 0, 1500.00),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "got", "Ravi", 1500.00, "Cash", "2026-08-10", "2026-10-01", "2026-10-10", 0.0, "Cash loan from colleague", 0, 0.00),
            (str(uuid.uuid4()), "00000000-0000-0000-0000-000000000000", "got", "Dialog Finance", 3000.00, "Instant Pay", "2026-06-01", "2026-09-01", "2026-12-01", 2.5, "Instant cash advance", 0, 750.00),
        ]
        cur.executemany(
            "INSERT INTO loans (id, user_id, loan_direction, person, amount, type, date, next_settlement, return_date, interest_rate, notes, settled, settled_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            seed_loans,
        )

    conn.commit()
    conn.close()


# Initialize on import
init_db()


def clean_row_for_supabase(data: Dict[str, Any]) -> Dict[str, Any]:
    cleaned = {}
    for k, v in data.items():
        if isinstance(v, (datetime, date)):
            cleaned[k] = v.isoformat()
        else:
            cleaned[k] = v
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
            if res.data and len(res.data) > 0:
                return res.data
        except Exception:
            pass

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
        data = clean_row_for_supabase(data)
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())

        try:
            res = supabase.table(table).insert(data).execute()

            if res.data and len(res.data) > 0:
                return res.data[0]

            raise Exception("Supabase insert returned no data")

        except Exception as e:
            print(f"SUPABASE INSERT ERROR: {e}")
            raise

        # Fallback to SQLite
        conn = get_sqlite_conn()
        cur = conn.cursor()
        cols = list(data.keys())
        placeholders = ", ".join(["?"] * len(cols))
        col_names = ", ".join(cols)
        values = [data[c] for c in cols]
        cur.execute(f"INSERT OR REPLACE INTO {table} ({col_names}) VALUES ({placeholders})", values)
        conn.commit()
        cur.execute(f"SELECT * FROM {table} WHERE id = ?", (data["id"],))
        row = dict(cur.fetchone())
        conn.close()
        return row

    @staticmethod
    def update(table: str, item_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        data = clean_row_for_supabase(data)
        # Try Supabase first
        try:
            res = supabase.table(table).update(data).eq("id", item_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception:
            pass

        # Fallback to SQLite
        conn = get_sqlite_conn()
        cur = conn.cursor()
        set_clauses = ", ".join([f"{k} = ?" for k in data.keys()])
        values = list(data.values()) + [item_id]
        cur.execute(f"UPDATE {table} SET {set_clauses} WHERE id = ?", values)
        conn.commit()
        cur.execute(f"SELECT * FROM {table} WHERE id = ?", (item_id,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def delete(table: str, item_id: str) -> bool:
        # Try Supabase first
        try:
            supabase.table(table).delete().eq("id", item_id).execute()
        except Exception:
            pass

        # Delete in SQLite
        conn = get_sqlite_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {table} WHERE id = ?", (item_id,))
        conn.commit()
        conn.close()
        return True
