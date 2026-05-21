"""Initial schema — users, saju_profiles, reports

Revision ID: 0001
Revises:
Create Date: 2026-05-22 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── SubscriptionTier ENUM ─────────────────────────────────────────────
    subscription_tier = postgresql.ENUM(
        "free", "pro", "premium",
        name="subscriptiontier",
        create_type=True,
    )
    subscription_tier.create(op.get_bind(), checkfirst=True)

    # ── users ─────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id",           postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email",        sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("nickname",     sa.String(50),  nullable=True),
        sa.Column("is_active",    sa.Boolean(),   nullable=False, server_default="true"),
        sa.Column("is_verified",  sa.Boolean(),   nullable=False, server_default="false"),
        sa.Column("subscription_tier",
                  sa.Enum("free", "pro", "premium", name="subscriptiontier"),
                  nullable=False, server_default="free"),
        sa.Column("subscription_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at",  sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at",  sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── saju_profiles ─────────────────────────────────────────────────────
    op.create_table(
        "saju_profiles",
        sa.Column("id",      postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),

        # 입력값
        sa.Column("birth_date",  sa.Date(),        nullable=False),
        sa.Column("birth_hour",  sa.Integer(),     nullable=True),
        sa.Column("gender",      sa.String(1),     nullable=False),
        sa.Column("situation",   sa.String(50),    nullable=True),

        # 四柱 天干地支
        sa.Column("year_stem",    sa.String(2), nullable=False),
        sa.Column("year_branch",  sa.String(2), nullable=False),
        sa.Column("month_stem",   sa.String(2), nullable=False),
        sa.Column("month_branch", sa.String(2), nullable=False),
        sa.Column("day_stem",     sa.String(2), nullable=False),
        sa.Column("day_branch",   sa.String(2), nullable=False),
        sa.Column("hour_stem",    sa.String(2), nullable=True),
        sa.Column("hour_branch",  sa.String(2), nullable=True),

        # 오행 분포
        sa.Column("element_wood",  sa.Float(), nullable=False, server_default="0"),
        sa.Column("element_fire",  sa.Float(), nullable=False, server_default="0"),
        sa.Column("element_earth", sa.Float(), nullable=False, server_default="0"),
        sa.Column("element_metal", sa.Float(), nullable=False, server_default="0"),
        sa.Column("element_water", sa.Float(), nullable=False, server_default="0"),

        # 분석
        sa.Column("ilgan_element",  sa.String(2),  nullable=False),
        sa.Column("gyeokguk",       sa.String(50), nullable=True),
        sa.Column("yongsin",        sa.String(2),  nullable=True),
        sa.Column("persona_type",   sa.String(50), nullable=True),
        sa.Column("daeun_data",     postgresql.JSONB(), nullable=True),

        sa.Column("is_primary",  sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at",  sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
    )
    op.create_index("ix_saju_profiles_user_id", "saju_profiles", ["user_id"])

    # ── reports ───────────────────────────────────────────────────────────
    op.create_table(
        "reports",
        sa.Column("id",      postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("saju_profile_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("saju_profiles.id", ondelete="SET NULL"), nullable=True),

        sa.Column("report_type",   sa.String(30),  nullable=False, server_default="basic"),
        sa.Column("status",        sa.String(20),  nullable=False, server_default="pending"),
        sa.Column("situation",     sa.String(50),  nullable=True),
        sa.Column("analysis_data", postgresql.JSONB(), nullable=True),
        sa.Column("pdf_url",       sa.String(500), nullable=True),
        sa.Column("is_paid",       sa.Boolean(),   nullable=False, server_default="false"),
        sa.Column("payment_id",    sa.String(100), nullable=True),
        sa.Column("ai_tokens_used", sa.Integer(),  nullable=False, server_default="0"),
        sa.Column("created_at",    sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("completed_at",  sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_reports_user_id", "reports", ["user_id"])
    op.create_index("ix_reports_status",  "reports", ["status"])


def downgrade() -> None:
    op.drop_table("reports")
    op.drop_table("saju_profiles")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS subscriptiontier")
