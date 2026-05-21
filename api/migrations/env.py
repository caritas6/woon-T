import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# ── 앱 모델 임포트 ────────────────────────────────────────────────────────
# 마이그레이션이 모든 테이블을 인식하도록 모델을 반드시 임포트해야 합니다
from app.database import Base  # noqa: F401
from app.models import user, saju  # noqa: F401 — 사이드 이펙트로 테이블 등록

# ── Alembic Config ────────────────────────────────────────────────────────
config = context.config

# .env의 DATABASE_URL 우선 사용 (alembic.ini의 sqlalchemy.url 덮어쓰기)
import os
from dotenv import load_dotenv  # type: ignore[import]

load_dotenv()
db_url = os.environ.get("DATABASE_URL", config.get_main_option("sqlalchemy.url", ""))
config.set_main_option("sqlalchemy.url", db_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ── 오프라인 모드 (SQL 파일 생성용) ──────────────────────────────────────
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# ── 온라인 모드 (실제 DB 연결) ────────────────────────────────────────────
def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
