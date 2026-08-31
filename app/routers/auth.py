from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.database import get_db_connection


router = APIRouter()


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


# ============================================================
# LOGIN
# ============================================================

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                id,
                email,
                password_hash,
                full_name,
                role
            FROM public.users
            WHERE LOWER(email) = LOWER(%s)
            """,
            (req.email,),
        )

        user = cur.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        user_id, email, password_hash, full_name, role = user

        if not verify_password(req.password, password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        token = create_access_token(
            {
                "sub": str(user_id),
                "email": email,
                "name": full_name,
                "role": role,
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(user_id),
                "email": email,
                "name": full_name,
                "role": role,
            },
        }

    finally:
        conn.close()


# ============================================================
# REGISTER
# ============================================================

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest):

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        # ----------------------------------------------------
        # Check existing user
        # ----------------------------------------------------

        cur.execute(
            """
            SELECT id
            FROM public.users
            WHERE LOWER(email) = LOWER(%s)
            """,
            (req.email,),
        )

        if cur.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )

        # ----------------------------------------------------
        # Find workspace
        # ----------------------------------------------------

        cur.execute(
            """
            SELECT id
            FROM public.workspaces
            ORDER BY created_at
            LIMIT 1
            """
        )

        workspace = cur.fetchone()

        if not workspace:
            raise HTTPException(
                status_code=500,
                detail="No workspace available",
            )

        workspace_id = workspace[0]

        # ----------------------------------------------------
        # Create user
        # ----------------------------------------------------

        import uuid

        user_id = uuid.uuid4()

        password_hash = hash_password(req.password)

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
            (%s, %s, %s, %s, %s, %s, NOW())
            """,
            (
                user_id,
                req.email,
                password_hash,
                req.name,
                "viewer",
                None,
            ),
        )

        # ----------------------------------------------------
        # Add user to workspace
        # ----------------------------------------------------

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
            (%s, %s, %s, %s, NOW())
            """,
            (
                uuid.uuid4(),
                workspace_id,
                user_id,
                "viewer",
            ),
        )

        conn.commit()

        return {
            "message": "User registered successfully",
            "user": {
                "id": str(user_id),
                "email": req.email,
                "name": req.name,
                "role": "viewer",
            },
        }

    except HTTPException:
        conn.rollback()
        raise

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()


# ============================================================
# CURRENT USER
# ============================================================

@router.get("/me")
def me():

    # This endpoint will be wired to JWT authentication
    # in the next step.

    return {
        "message": "Authentication is connected to Neon."
    }