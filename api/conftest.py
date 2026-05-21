"""
pytest 전역 설정 — 테스트 환경 초기화
DB/Redis 없이도 순수 로직 테스트 가능하도록 앱 lifespan을 패치
"""
import os
import pytest

# 환경변수 우선 설정 (app 임포트 전에)
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost/test_db")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-at-least-32-characters-long")
os.environ.setdefault("ANTHROPIC_API_KEY", "sk-ant-test")
os.environ.setdefault("APP_ENV", "test")


@pytest.fixture(scope="session", autouse=True)
def patch_lifespan():
    """테스트 중 DB 연결 시도를 막음 (lifespan skip)"""
    from unittest.mock import patch, AsyncMock
    from contextlib import asynccontextmanager

    @asynccontextmanager
    async def noop_lifespan(app):
        yield

    with patch("app.main.lifespan", noop_lifespan):
        yield
