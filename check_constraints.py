import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

cur.execute("""
    SELECT
        tc.table_name,
        tc.constraint_type,
        tc.constraint_name,
        kcu.column_name
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
        AND tc.table_name = kcu.table_name
    WHERE tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;
""")

current = None

for table, constraint_type, constraint_name, column in cur.fetchall():
    if table != current:
        print()
        print("=" * 60)
        print(f"TABLE: {table}")
        print("=" * 60)
        current = table

    print(
        f"{constraint_type:<20} "
        f"{constraint_name:<40} "
        f"{column or ''}"
    )

cur.close()
conn.close()