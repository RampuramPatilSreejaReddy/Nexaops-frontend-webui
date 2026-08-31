from typing import Optional

from fastapi import APIRouter, Query, HTTPException

from app.database import get_db_connection


router = APIRouter()


# ============================================================
# LIST JOBS
# ============================================================

@router.get("/")
def list_jobs(
    status: Optional[str] = Query(None),
    workflow: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
):

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        query = """
            SELECT
                j.id,
                j.job_name,
                j.job_type,
                j.status,
                j.severity,
                j.start_time,
                j.end_time,
                j.runtime_seconds,
                j.cpu_pct,
                j.cpu_cores,
                j.memory_mb,
                w.name AS workflow_name
            FROM public.jobs j
            LEFT JOIN public.workflows w
                ON j.workflow_id = w.id
            WHERE 1 = 1
        """

        params = []

        # ----------------------------------------------------
        # Status filter
        # ----------------------------------------------------

        if status:
            query += " AND j.status = %s"
            params.append(status)

        # ----------------------------------------------------
        # Workflow filter
        # ----------------------------------------------------

        if workflow:
            query += " AND w.name = %s"
            params.append(workflow)

        # ----------------------------------------------------
        # Search
        # ----------------------------------------------------

        if q:
            query += """
                AND (
                    j.job_name ILIKE %s
                    OR w.name ILIKE %s
                )
            """

            search = f"%{q}%"

            params.extend([search, search])

        query += """
            ORDER BY j.start_time DESC NULLS LAST
        """

        cur.execute(query, params)

        rows = cur.fetchall()

        jobs = []

        for row in rows:

            (
                job_id,
                job_name,
                job_type,
                job_status,
                severity,
                start_time,
                end_time,
                runtime_seconds,
                cpu_pct,
                cpu_cores,
                memory_mb,
                workflow_name,
            ) = row

            jobs.append(
                {
                    "id": str(job_id),
                    "workflow": workflow_name,
                    "name": job_name,
                    "type": job_type,
                    "start": start_time,
                    "end": end_time,
                    "runtime_seconds": runtime_seconds,
                    "status": job_status,
                    "severity": severity,
                    "cpu": cpu_pct,
                    "cpu_cores": cpu_cores,
                    "memory_mb": memory_mb,
                }
            )

        return {
            "jobs": jobs,
            "total": len(jobs),
        }

    finally:
        conn.close()


# ============================================================
# JOB SUMMARY
# ============================================================

@router.get("/summary")
def jobs_summary():

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                COUNT(*) FILTER (WHERE status = 'running') AS running,
                COUNT(*) FILTER (WHERE status = 'success') AS success,
                COUNT(*) FILTER (WHERE status = 'failed') AS failed,
                COUNT(*) FILTER (WHERE status = 'warning') AS warning,
                COUNT(*) FILTER (WHERE status = 'queued') AS queued
            FROM public.jobs
            """
        )

        row = cur.fetchone()

        running = row[0] or 0
        success = row[1] or 0
        failed = row[2] or 0
        warning = row[3] or 0
        queued = row[4] or 0

        cur.execute(
            """
            SELECT COUNT(*)
            FROM public.sla_breaches
            """
        )

        sla_breaches = cur.fetchone()[0] or 0

        return {
            "running": running,
            "success": success,
            "failed": failed,
            "warning": warning,
            "queued": queued,
            "sla_breaches": sla_breaches,
        }

    finally:
        conn.close()


# ============================================================
# GET SINGLE JOB
# ============================================================

@router.get("/{job_id}")
def get_job(job_id: str):

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                j.id,
                j.job_name,
                j.job_type,
                j.status,
                j.severity,
                j.start_time,
                j.end_time,
                j.runtime_seconds,
                j.cpu_pct,
                j.cpu_cores,
                j.memory_mb,
                w.name AS workflow_name
            FROM public.jobs j
            LEFT JOIN public.workflows w
                ON j.workflow_id = w.id
            WHERE j.id = %s
            """,
            (job_id,),
        )

        row = cur.fetchone()

        if not row:
            raise HTTPException(
                status_code=404,
                detail="Job not found",
            )

        (
            job_id,
            job_name,
            job_type,
            job_status,
            severity,
            start_time,
            end_time,
            runtime_seconds,
            cpu_pct,
            cpu_cores,
            memory_mb,
            workflow_name,
        ) = row

        return {
            "id": str(job_id),
            "workflow": workflow_name,
            "name": job_name,
            "type": job_type,
            "status": job_status,
            "severity": severity,
            "start": start_time,
            "end": end_time,
            "runtime_seconds": runtime_seconds,
            "cpu": cpu_pct,
            "cpu_cores": cpu_cores,
            "memory_mb": memory_mb,
        }

    finally:
        conn.close()


# ============================================================
# JOB RESOLUTION
# ============================================================

@router.get("/{job_id}/resolution")
def get_resolution(job_id: str):

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        # ----------------------------------------------------
        # Check job
        # ----------------------------------------------------

        cur.execute(
            """
            SELECT id, job_name
            FROM public.jobs
            WHERE id = %s
            """,
            (job_id,),
        )

        job = cur.fetchone()

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found",
            )

        # ----------------------------------------------------
        # Resolution
        # ----------------------------------------------------

        cur.execute(
            """
            SELECT
                id,
                rca_root_cause,
                rca_business_impact,
                rca_fix_type,
                rca_risk,
                confidence,
                fix_diff,
                status,
                feedback_rating,
                feedback_comment
            FROM public.job_resolutions
            WHERE job_id = %s
            """,
            (job_id,),
        )

        resolution = cur.fetchone()

        if not resolution:
            return {
                "message": "No resolution recorded for this job"
            }

        (
            resolution_id,
            root_cause,
            business_impact,
            fix_type,
            risk,
            confidence,
            fix_diff,
            resolution_status,
            feedback_rating,
            feedback_comment,
        ) = resolution

        return {
            "id": str(resolution_id),
            "root_cause": root_cause,
            "business_impact": business_impact,
            "fix_type": fix_type,
            "risk": risk,
            "confidence": confidence,
            "fix_diff": fix_diff,
            "status": resolution_status,
            "feedback_rating": feedback_rating,
            "feedback_comment": feedback_comment,
        }

    finally:
        conn.close()


# ============================================================
# APPROVE FIX
# ============================================================

@router.post("/{job_id}/approve")
def approve_fix(job_id: str):

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                id,
                job_name
            FROM public.jobs
            WHERE id = %s
            """,
            (job_id,),
        )

        job = cur.fetchone()

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found",
            )

        db_job_id, job_name = job

        # ----------------------------------------------------
        # Update resolution status
        # ----------------------------------------------------

        cur.execute(
            """
            UPDATE public.job_resolutions
            SET status = 'approved'
            WHERE job_id = %s
            """,
            (job_id,),
        )

        conn.commit()

        cr_id = "CR-" + str(db_job_id)[:8]

        return {
            "status": "approved",
            "cr_id": cr_id,
            "message": (
                f"Fix approved for {job_name}."
            ),
        }

    finally:
        conn.close()