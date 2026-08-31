// Run once to create tables and seed data: node seed-db.js
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
const { Client } = pg

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '.env')
const ENV = {}
for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
  const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
  if (m) ENV[m[1].trim()] = m[2].trim()
}

const client = new Client({
  connectionString: ENV.DATABASE_URL.replace(/[?&]channel_binding=[^&]*/g, ''),
  ssl: { rejectUnauthorized: false }
})
await client.connect()
console.log('Connected to NeonDB')

await client.query(`
  CREATE TABLE IF NOT EXISTS jobs (
    id          VARCHAR(10)  PRIMARY KEY,
    workflow    VARCHAR(100) NOT NULL,
    type        VARCHAR(100) NOT NULL,
    name        VARCHAR(100) NOT NULL,
    start_time  VARCHAR(20),
    end_time    VARCHAR(20),
    runtime     VARCHAR(50),
    status      VARCHAR(20)  NOT NULL,
    team        VARCHAR(100),
    environment VARCHAR(50),
    job_date    DATE,
    has_ai_fix  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
  )
`)
console.log('Created table: jobs')

const JOBS = [
  ['j1','ETL Pipelines','Kafka → Snowflake','payments-etl-daily',    '06:00:00',null,        '1h 24m',    'running','Data Engineering',     'Production','2024-05-20',false],
  ['j2','BigQuery Jobs', 'BigQuery ML',      'risk-score-batch',       '04:10:00','05:48:00', '38m 14s',   'success','Analytics',             'Production','2024-05-21',false],
  ['j3','ETL Pipelines','CRM → DW',          'customer-sync-api',      '08:14:00','08:14:32', '32s',       'failed', 'Customer Support',      'Production','2024-05-20',true ],
  ['j4','Batch Reports','PostgreSQL',         'inventory-recon-nightly','04:00:00',null,        '2h 14m',    'warning','Finance',               'Production','2024-05-22',false],
  ['j5','Kafka Streams','Real-time',          'fraud-detection-stream', '00:00:00',null,        'Continuous','running','Machine Learning',      'Production','2024-05-23',false],
  ['j6','BigQuery Jobs','BigQuery SQL',        'bq-revenue-report',      '08:14:00','08:14:32', '32s',       'failed', 'Product',               'Production','2024-05-24',true ],
  ['j7','Airflow DAGs', 'Airflow',            'airflow-dag-reports',    '07:00:00',null,        '48m',       'warning','Operations',            'Production','2024-05-25',false],
  ['j8','Batch Reports','Airflow DAG',        'report-gen-monthly',     null,       null,        null,        'queued', 'Marketing',             'UAT',        '2024-05-26',false],
  ['j9','ETL Pipelines','REST API → BQ',      'supplier-data-sync',     '05:30:00','06:14:00', '44m 12s',   'success','Platform Engineering',  'Production','2024-05-27',false],
]

for (const [id,workflow,type,name,start_time,end_time,runtime,status,team,environment,job_date,has_ai_fix] of JOBS) {
  await client.query(
    `INSERT INTO jobs (id,workflow,type,name,start_time,end_time,runtime,status,team,environment,job_date,has_ai_fix)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (id) DO UPDATE SET
       workflow=EXCLUDED.workflow, type=EXCLUDED.type, name=EXCLUDED.name,
       start_time=EXCLUDED.start_time, end_time=EXCLUDED.end_time, runtime=EXCLUDED.runtime,
       status=EXCLUDED.status, team=EXCLUDED.team, environment=EXCLUDED.environment,
       job_date=EXCLUDED.job_date, has_ai_fix=EXCLUDED.has_ai_fix`,
    [id,workflow,type,name,start_time,end_time,runtime,status,team,environment,job_date,has_ai_fix]
  )
}
console.log(`Inserted ${JOBS.length} jobs`)

await client.end()
console.log('✅ Database seeded successfully! Run: npm run dev')
