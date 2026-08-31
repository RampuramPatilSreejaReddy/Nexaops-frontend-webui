import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

cur.execute("""
    SELECT
        table_name,
        column_name,
        data_type,
        is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
""")

current_table = None

for table, column, data_type, nullable in cur.fetchall():

    if table != current_table:
        print()
        print("=" * 60)
        print(f"TABLE: {table}")
        print("=" * 60)
        current_table = table

    print(
        f"  {column:<35} "
        f"{data_type:<20} "
        f"nullable={nullable}"
    )

cur.close()
conn.close()