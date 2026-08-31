from fastapi import APIRouter, HTTPException

from app.database import get_db_connection


router = APIRouter()


# ============================================================
# LIST INCIDENTS
# ============================================================

@router.get("/")
def list_incidents():

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                i.id,
                i.workspace_id,
                i.job_id,
                i.title,
                i.detail,
                i.priority,
                i.state,
                i.assigned_owner_id,
                j.job_name,
                u.full_name AS assigned_owner
            FROM public.incidents i

            LEFT JOIN public.jobs j
                ON i.job_id = j.id

            LEFT JOIN public.users u
                ON i.assigned_owner_id = u.id

            ORDER BY i.id
            """
        )

        rows = cur.fetchall()

        incidents = []

        for row in rows:

            (
                incident_id,
                workspace_id,
                job_id,
                title,
                detail,
                priority,
                state,
                assigned_owner_id,
                job_name,
                assigned_owner,
            ) = row

            incidents.append(
                {
                    "id": str(incident_id),
                    "workspace_id": str(workspace_id)
                    if workspace_id
                    else None,

                    "job_id": str(job_id)
                    if job_id
                    else None,

                    "title": title,
                    "detail": detail,
                    "severity": priority,
                    "status": state,

                    "assigned_owner_id": (
                        str(assigned_owner_id)
                        if assigned_owner_id
                        else None
                    ),

                    "assigned_owner": assigned_owner,
                    "job_name": job_name,
                }
            )

        return {
            "incidents": incidents,
            "total": len(incidents),
        }

    finally:
        conn.close()


# ============================================================
# GET SINGLE INCIDENT
# ============================================================

@router.get("/{incident_id}")
def get_incident(incident_id: str):

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                i.id,
                i.workspace_id,
                i.job_id,
                i.title,
                i.detail,
                i.priority,
                i.state,
                i.assigned_owner_id,
                j.job_name,
                u.full_name AS assigned_owner
            FROM public.incidents i

            LEFT JOIN public.jobs j
                ON i.job_id = j.id

            LEFT JOIN public.users u
                ON i.assigned_owner_id = u.id

            WHERE i.id = %s
            """,
            (incident_id,),
        )

        row = cur.fetchone()

        if not row:
            raise HTTPException(
                status_code=404,
                detail="Incident not found",
            )

        (
            db_incident_id,
            workspace_id,
            job_id,
            title,
            detail,
            priority,
            state,
            assigned_owner_id,
            job_name,
            assigned_owner,
        ) = row

        return {
            "id": str(db_incident_id),

            "workspace_id": (
                str(workspace_id)
                if workspace_id
                else None
            ),

            "job_id": (
                str(job_id)
                if job_id
                else None
            ),

            "title": title,
            "detail": detail,
            "severity": priority,
            "status": state,

            "assigned_owner_id": (
                str(assigned_owner_id)
                if assigned_owner_id
                else None
            ),

            "assigned_owner": assigned_owner,
            "job_name": job_name,
        }

    finally:
        conn.close()


# ============================================================
# INCIDENT ACTIVITIES
# ============================================================

@router.get("/{incident_id}/activities")
def get_incident_activities(incident_id: str):

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        # ----------------------------------------------------
        # Verify incident exists
        # ----------------------------------------------------

        cur.execute(
            """
            SELECT id
            FROM public.incidents
            WHERE id = %s
            """,
            (incident_id,),
        )

        if not cur.fetchone():
            raise HTTPException(
                status_code=404,
                detail="Incident not found",
            )

        # ----------------------------------------------------
        # Get activities
        # ----------------------------------------------------

        cur.execute(
            """
            SELECT
                ia.id,
                ia.incident_id,
                ia.actor_id,
                u.full_name AS actor_name,
                ia.activity_type,
                ia.message,
                ia.created_at
            FROM public.incident_activities ia

            LEFT JOIN public.users u
                ON ia.actor_id = u.id

            WHERE ia.incident_id = %s

            ORDER BY ia.created_at ASC
            """,
            (incident_id,),
        )

        rows = cur.fetchall()

        activities = []

        for row in rows:

            (
                activity_id,
                db_incident_id,
                actor_id,
                actor_name,
                activity_type,
                message,
                created_at,
            ) = row

            activities.append(
                {
                    "id": str(activity_id),

                    "incident_id": str(
                        db_incident_id
                    ),

                    "actor_id": (
                        str(actor_id)
                        if actor_id
                        else None
                    ),

                    "actor_name": actor_name,
                    "activity_type": activity_type,
                    "message": message,
                    "created_at": created_at,
                }
            )

        return {
            "incident_id": incident_id,
            "activities": activities,
            "total": len(activities),
        }

    finally:
        conn.close()