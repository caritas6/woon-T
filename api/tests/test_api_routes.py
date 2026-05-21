"""
API 엔드포인트 통합 테스트 (httpx + pytest-asyncio)
실제 DB 없이 mock으로 동작 확인
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport
from datetime import date


@pytest.fixture
def app():
    """테스트용 FastAPI 앱 (DB 연결 없이)"""
    import os
    os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost/test")
    os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-at-least-32-characters-long")
    os.environ.setdefault("ANTHROPIC_API_KEY", "sk-ant-test")

    from app.main import app as _app
    return _app


@pytest.fixture
def auth_header():
    from app.core.security import create_access_token
    token = create_access_token("test-user-id")
    return {"Authorization": f"Bearer {token}"}


class TestHealthCheck:
    @pytest.mark.asyncio
    async def test_health_ok(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    @pytest.mark.asyncio
    async def test_root_ok(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/")
        assert resp.status_code == 200
        data = resp.json()
        assert "service" in data
        assert "docs" in data


class TestSajuQuickEndpoint:
    @pytest.mark.asyncio
    async def test_quick_calculate_success(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/api/v1/saju/quick", json={
                "birth_date": "1995-03-15",
                "birth_hour": 10,
                "gender": "F",
            })
        assert resp.status_code == 200
        data = resp.json()
        assert "ilgan" in data
        assert "elements" in data
        assert "persona" in data
        assert "career_matches" in data
        assert len(data["career_matches"]) <= 2  # 비회원 제한

    @pytest.mark.asyncio
    async def test_quick_calculate_without_hour(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/api/v1/saju/quick", json={
                "birth_date": "1990-01-01",
                "birth_hour": None,
                "gender": "M",
            })
        assert resp.status_code == 200
        assert resp.json()["hour"] is None

    @pytest.mark.asyncio
    async def test_quick_invalid_date(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/api/v1/saju/quick", json={
                "birth_date": "1850-01-01",  # 1900년 이전 → 검증 실패
                "gender": "M",
            })
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_quick_invalid_gender(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/api/v1/saju/quick", json={
                "birth_date": "1995-01-01",
                "gender": "X",  # 유효하지 않은 성별
            })
        assert resp.status_code == 422


class TestAuthRequired:
    @pytest.mark.asyncio
    async def test_calculate_requires_auth(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/api/v1/saju/calculate", json={
                "birth_date": "1995-03-15",
                "gender": "F",
            })
        # FastAPI 0.136+: Bearer 없으면 401, 이전 버전은 403
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_daily_fortune_requires_auth(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/api/v1/career/today")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_calendar_requires_auth(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/api/v1/fortune/calendar/2026/5")
        assert resp.status_code in (401, 403)


class TestAuthEndpoints:
    @pytest.mark.asyncio
    async def test_register_validation_short_password(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/api/v1/auth/register", json={
                "email": "test@example.com",
                "password": "short",  # 8자 미만
            })
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_register_validation_bad_email(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/api/v1/auth/register", json={
                "email": "not-an-email",
                "password": "validpassword123",
            })
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_invalid_token_returns_401(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get(
                "/api/v1/auth/me",
                headers={"Authorization": "Bearer invalid.token.here"},
            )
        assert resp.status_code == 401


class TestSajuQuickDataIntegrity:
    """사주 계산 결과 데이터 무결성 검증"""

    @pytest.mark.asyncio
    async def test_elements_sum_to_100(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/api/v1/saju/quick", json={
                "birth_date": "2000-06-15",
                "gender": "M",
            })
        elements = resp.json()["elements"]
        total = sum(elements.values())
        assert abs(total - 100.0) < 0.5

    @pytest.mark.asyncio
    async def test_pillar_elements_are_valid(self, app):
        valid_elements = {"木", "火", "土", "金", "水"}
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/api/v1/saju/quick", json={
                "birth_date": "1988-11-20",
                "gender": "F",
            })
        data = resp.json()
        assert data["ilgan_element"] in valid_elements
        assert data["yongsin"] in valid_elements

    @pytest.mark.asyncio
    async def test_persona_has_emoji(self, app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/api/v1/saju/quick", json={
                "birth_date": "1997-04-05",   # ISO 8601 형식 YYYY-MM-DD
                "gender": "M",
            })
        assert resp.status_code == 200
        persona = resp.json()["persona"]
        assert "emoji" in persona
        assert "name" in persona
