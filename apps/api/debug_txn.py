# debug_txn.py
import os
import traceback

from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise SystemExit("Set DATABASE_URL env var first, e.g. export DATABASE_URL='postgresql+psycopg://...'")

engine = create_engine(DATABASE_URL, future=True)

# Print a stack trace whenever the DB connection begins a transaction.
@event.listens_for(Engine, "begin")
def on_begin(conn):
    print("\n=== ENGINE BEGIN (transaction started) ===")
    print("Connection:", conn)
    traceback.print_stack(limit=25)

# Print commits/rollbacks too, to see lifecycle.
@event.listens_for(Engine, "commit")
def on_commit(conn):
    print("\n=== ENGINE COMMIT ===")
    print("Connection:", conn)

@event.listens_for(Engine, "rollback")
def on_rollback(conn):
    print("\n=== ENGINE ROLLBACK ===")
    print("Connection:", conn)

SessionLocal = sessionmaker(bind=engine, future=True)

def dump_session_state(db, label: str):
    print(f"\n--- {label} ---")
    print("Session object:", db)
    print("Session id:", id(db))
    print("in_transaction:", db.in_transaction())
    print("in_nested_transaction:", db.in_nested_transaction())
    print("get_transaction:", db.get_transaction())
    print("get_nested_transaction:", db.get_nested_transaction())
    print("dirty/new/deleted:", len(db.dirty), len(db.new), len(db.deleted))

def main():
    db = SessionLocal()

    dump_session_state(db, "fresh session (before any SQL)")

    # Any SQL often triggers "BEGIN (implicit)" in SQLAlchemy 2.0
    print("\nRunning a SELECT 1 ...")
    db.execute(text("SELECT 1"))

    dump_session_state(db, "after SELECT 1")

    print("\nNow trying db.begin() inside an already-started transaction ...")
    try:
        with db.begin():
            db.execute(text("SELECT 2"))
    except Exception as e:
        print("\nExpected error:", repr(e))

    print("\nNow trying db.begin_nested() (should work) ...")
    with db.begin_nested():
        db.execute(text("SELECT 3"))
    dump_session_state(db, "after begin_nested")

    db.close()
    print("\nSession closed.")

if __name__ == "__main__":
    main()
