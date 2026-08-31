from dotenv import load_dotenv
import os
import psycopg2

load_dotenv()

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

print("\n==============================")
print("INCIDENTS COLUMNS")
print("==============================")

cur.execute("""
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'incidents'
    ORDER BY ordinal_position
""")

for column_name, data_type in cur.fetchall():
    print(f"{column_name} | {data_type}")


print("\n==============================")
print("INCIDENT ACTIVITIES COLUMNS")
print("==============================")

cur.execute("""
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'incident_activities'
    ORDER BY ordinal_position
""")

for column_name, data_type in cur.fetchall():
    print(f"{column_name} | {data_type}")


cur.close()
conn.close()

print("\nDatabase connection successful.")
