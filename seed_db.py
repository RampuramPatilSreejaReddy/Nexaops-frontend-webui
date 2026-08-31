import os
import uuid
from datetime import datetime, timedelta, timezone

import psycopg2
from dotenv import load_dotenv
from passlib.context import CryptContext


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing from .env")


# ============================================================
# PASSWORD
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ============================================================
# UUID HELPER
# ============================================================

def new_id():
    """
    Return UUID as string so psycopg2 can insert it safely.
    """
    return str(uuid.uuid4())


# ============================================================
# MAIN
# ============================================================

def seed_database():

    print("Connecting to Neon...")

    conn = psycopg2.connect(DATABASE_URL)

    print("Connected successfully.")

    try:

        cur = conn.cursor()

        # ----------------------------------------------------
        # Prevent accidental duplicate seed
        # ----------------------------------------------------

        cur.execute(
            """
            SELECT id
            FROM public.users
            WHERE email = %s
            """,
            ("admin@nexaops.com",),
        )

        if cur.fetchone():

            print()
            print("Demo data already exists.")
            print("admin@nexaops.com already exists.")
            print("Nothing was inserted.")

            cur.close()
            return

        # ----------------------------------------------------
        # IDs
        # ----------------------------------------------------

        workspace_id = new_id()
        user_id = new_id()
        workflow_id = new_id()

        job_ids = [
            new_id(),
            new_id(),
            new_id(),
            new_id(),
            new_id(),
        ]

        incident_ids = [
            "INC-" + uuid.uuid4().hex[:8].upper(),
            "INC-" + uuid.uuid4().hex[:8].upper(),
        ]

        now = datetime.now(timezone.utc)

        # ====================================================
        # WORKSPACE
        # ====================================================

        print("Creating workspace...")

        cur.execute(
            """
            INSERT INTO public.workspaces
            (
                id,
                name,
                timezone,
                settings,
                created_at
            )
            VALUES
            (%s, %s, %s, %s, %s)
            """,
            (
                workspace_id,
                "NexaOps Demo Workspace",
                "Asia/Kolkata",
                "{}",
                now,
            ),
        )

        # ====================================================
        # USER
        # ====================================================

        print("Creating user...")

        password_hash = pwd_context.hash("NexaOps@123")

        cur.execute(
            """
            INSERT INTO public.users
            (
                id,
                email,
                password_hash,
                full_name,
                role,
                avatar_url,
                created_at
            )
            VALUES
            (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                "admin@nexaops.com",
                password_hash,
                "NexaOps Admin",
                "admin",
                None,
                now,
            ),
        )

        # ====================================================
        # WORKSPACE MEMBER
        # ====================================================

        print("Creating workspace membership...")

        cur.execute(
            """
            INSERT INTO public.workspace_members
            (
                id,
                workspace_id,
                user_id,
                role,
                joined_at
            )
            VALUES
            (%s, %s, %s, %s, %s)
            """,
            (
                new_id(),
                workspace_id,
                user_id,
                "admin",
                now,
            ),
        )

        # ====================================================
        # WORKFLOW
        # ====================================================

        print("Creating workflow...")

        cur.execute(
            """
            INSERT INTO public.workflows
            (
                id,
                workspace_id,
                integration_id,
                name,
                category,
                sla_target_mins,
                health
            )
            VALUES
            (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                workflow_id,
                workspace_id,
                None,
                "Daily Data Pipeline",
                "Data Engineering",
                30,
                "healthy",
            ),
        )

        # ====================================================
        # JOBS
        # ====================================================

        print("Creating jobs...")

        jobs = [
            (
                "Customer Data Ingestion",
                "ETL",
                "success",
                "low",
                420,
                28.5,
                2,
                4096,
            ),
            (
                "Orders Transformation",
                "ETL",
                "success",
                "medium",
                680,
                42.1,
                4,
                8192,
            ),
            (
                "Revenue Aggregation",
                "SQL",
                "failed",
                "high",
                1250,
                76.4,
                4,
                12288,
            ),
            (
                "Customer Analytics",
                "Spark",
                "running",
                "medium",
                None,
                61.3,
                8,
                16384,
            ),
            (
                "Daily Report Generation",
                "Python",
                "success",
                "low",
                310,
                19.7,
                2,
                4096,
            ),
        ]

        for job_id, job in zip(job_ids, jobs):

            (
                job_name,
                job_type,
                status,
                severity,
                runtime_seconds,
                cpu_pct,
                cpu_cores,
                memory_mb,
            ) = job

            start_time = now - timedelta(minutes=30)

            end_time = None

            if runtime_seconds is not None:

                end_time = (
                    start_time
                    + timedelta(seconds=runtime_seconds)
                )

            cur.execute(
                """
                INSERT INTO public.jobs
                (
                    id,
                    workspace_id,
                    workflow_id,
                    parent_job_id,
                    retry_attempt,
                    job_name,
                    job_type,
                    status,
                    severity,
                    start_time,
                    end_time,
                    runtime_seconds,
                    cpu_pct,
                    cpu_cores,
                    memory_mb
                )
                VALUES
                (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s
                )
                """,
                (
                    job_id,
                    workspace_id,
                    workflow_id,
                    None,
                    0,
                    job_name,
                    job_type,
                    status,
                    severity,
                    start_time,
                    end_time,
                    runtime_seconds,
                    cpu_pct,
                    cpu_cores,
                    memory_mb,
                ),
            )

        # ====================================================
        # JOB METRICS
        # ====================================================

        

        # ====================================================
        # JOB LOGS
        # ====================================================

        print("Creating job logs...")

        for index, job_id in enumerate(job_ids, start=1):

            cur.execute(
                """
                INSERT INTO public.job_logs
                (
                    id,
                    job_id,
                    timestamp,
                    level,
                    service_name,
                    message
                )
                VALUES
                (%s, %s, %s, %s, %s, %s)
                """,
                (
                    index,
                    job_id,
                    now,
                    "INFO",
                    "nexaops-worker",
                    "Job execution completed successfully",
                ),
            )

        # ====================================================
        # INCIDENTS
        # ====================================================

        print("Creating incidents...")

        incidents = [
            (
                incident_ids[0],
                job_ids[2],
                "Revenue Aggregation Failure",
                "Revenue aggregation job failed during SQL execution.",
                "P1",
                "open",
            ),
            (
                incident_ids[1],
                job_ids[1],
                "Orders Pipeline Delay",
                "Orders transformation exceeded the expected runtime.",
                "P2",
                "investigating",
            ),
        ]

        for (
            incident_id,
            job_id,
            title,
            detail,
            priority,
            state,
        ) in incidents:

            cur.execute(
                """
                INSERT INTO public.incidents
                (
                    id,
                    workspace_id,
                    job_id,
                    title,
                    detail,
                    priority,
                    state,
                    assigned_owner_id
                )
                VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    incident_id,
                    workspace_id,
                    job_id,
                    title,
                    detail,
                    priority,
                    state,
                    user_id,
                ),
            )

        # ====================================================
        # INCIDENT ACTIVITIES
        # ====================================================

        print("Creating incident activities...")

        for incident_id in incident_ids:

            cur.execute(
                """
                INSERT INTO public.incident_activities
                (
                    id,
                    incident_id,
                    actor_id,
                    activity_type,
                    message,
                    created_at
                )
                VALUES
                (%s, %s, %s, %s, %s, %s)
                """,
                (
                    new_id(),
                    incident_id,
                    user_id,
                    "comment",
                    "Incident created and assigned for investigation.",
                    now,
                ),
            )

        # ====================================================
        # JOB RESOLUTIONS
        # ====================================================

        print("Creating job resolutions...")

        for job_id in [job_ids[2], job_ids[1]]:

            cur.execute(
                """
                INSERT INTO public.job_resolutions
                (
                    id,
                    job_id,
                    rca_root_cause,
                    rca_business_impact,
                    rca_fix_type,
                    rca_risk,
                    confidence,
                    fix_diff,
                    status,
                    feedback_rating,
                    feedback_comment,
                    approved_by_user_id
                )
                VALUES
                (
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s
                )
                """,
                (
                    new_id(),
                    job_id,
                    "Resource or query execution failure",
                    "Pipeline processing was delayed.",
                    "configuration",
                    "low",
                    85,
                    "{}",
                    "approved",
                    None,
                    None,
                    user_id,
                ),
            )

        # ====================================================
        # SLA BREACH
        # ====================================================

        print("Creating SLA breach...")

        cur.execute(
            """
            INSERT INTO public.sla_breaches
            (
                id,
                job_id,
                workflow_id,
                expected_max_mins,
                actual_runtime_mins,
                overdue_mins,
                breach_count
            )
            VALUES
            (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                new_id(),
                job_ids[2],
                workflow_id,
                30,
                42,
                12,
                1,
            ),
        )

        # ====================================================
        # ALERT
        # ====================================================

        print("Creating alert...")

        cur.execute(
            """
            INSERT INTO public.alerts
            (
                id,
                workspace_id,
                workflow_id,
                job_id,
                severity,
                message,
                is_active,
                triggered_at
            )
            VALUES
            (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                new_id(),
                workspace_id,
                workflow_id,
                job_ids[2],
                "high",
                "Revenue Aggregation job failed.",
                True,
                now,
            ),
        )

        # ====================================================
        # DAILY WORKFLOW SUMMARY
        # ====================================================

        print("Creating daily workflow summary...")

        cur.execute(
            """
            INSERT INTO public.daily_workflow_summaries
            (
                id,
                workspace_id,
                workflow_id,
                summary_date,
                total_runs,
                succeeded_count,
                failed_count,
                sla_breaches_count,
                avg_runtime_mins,
                avg_cpu_pct,
                ai_resolved_count
            )
            VALUES
            (
                %s, %s, %s, CURRENT_DATE,
                %s, %s, %s, %s,
                %s, %s, %s
            )
            """,
            (
                new_id(),
                workspace_id,
                workflow_id,
                5,
                3,
                1,
                1,
                18.5,
                45.2,
                1,
            ),
        )

        # ====================================================
        # COMMIT
        # ====================================================

        conn.commit()

        print()
        print("=" * 60)
        print("DATABASE SEED COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print()
        print("Jobs:", len(job_ids))
        print("Incidents:", len(incident_ids))
        print()
        print("Demo login:")
        print("Email: admin@nexaops.com")
        print("Password: NexaOps@123")
        print()

        cur.close()

    except Exception as error:

        conn.rollback()

        print()
        print("=" * 60)
        print("DATABASE SEED FAILED")
        print("=" * 60)
        print()
        print("Error:", error)
        print()

        raise

    finally:

        conn.close()


if __name__ == "__main__":
    seed_database()