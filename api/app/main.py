from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import get_settings
from app.database import engine, Base

settings = get_settings()

# ── Sentry 초기화 (DSN 설정 시에만 활성화) ──────────────────────────────
if settings.SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.APP_ENV,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
        # 민감 정보 필터링
        before_send=lambda event, hint: (
            None if settings.APP_ENV == "development" else event
        ),
    )


# ── slowapi 속도 제한 ────────────────────────────────────────────────────
# Redis를 스토리지로 사용 (메모리 공유, 멀티 워커 대응)
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.REDIS_URL,
    default_limits=["200/minute"],  # 전역 기본값
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 개발 환경: Alembic 대신 SQLAlchemy로 테이블 자동 생성
    if settings.APP_ENV == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="운트(Woon-T) API",
    description="사주 기반 맞춤형 진로 상담 플랫폼 API",
    version="1.0.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/redoc" if settings.APP_ENV != "production" else None,
    lifespan=lifespan,
)

# ── 미들웨어 등록 ────────────────────────────────────────────────────────

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 전역 예외 핸들러 ─────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if settings.SENTRY_DSN:
        import sentry_sdk
        sentry_sdk.capture_exception(exc)
    if settings.DEBUG:
        raise exc
    return JSONResponse(
        status_code=500,
        content={"detail": "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요."},
    )


# ── 라우터 등록 ──────────────────────────────────────────────────────────
from app.routers import auth, saju, career, fortune, payments, reports  # noqa: E402

PREFIX = settings.API_V1_PREFIX

app.include_router(auth.router,     prefix=PREFIX)
app.include_router(saju.router,     prefix=PREFIX)
app.include_router(career.router,   prefix=PREFIX)
app.include_router(fortune.router,  prefix=PREFIX)
app.include_router(payments.router, prefix=PREFIX)
app.include_router(reports.router,  prefix=PREFIX)


# ── 헬스체크 ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["시스템"])
async def health():
    """DB·Redis 연결을 포함한 종합 헬스체크 — Railway가 사용합니다"""
    checks: dict[str, str] = {}

    # DB 핑
    try:
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["db"] = "ok"
    except Exception as e:
        checks["db"] = f"error: {e}"

    # Redis 핑
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.REDIS_URL, socket_connect_timeout=2)
        await r.ping()
        await r.aclose()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {e}"

    ok = all(v == "ok" for v in checks.values())
    return JSONResponse(
        status_code=200 if ok else 503,
        content={"status": "ok" if ok else "degraded", "version": "1.0.0", "checks": checks},
    )


@app.get("/", tags=["시스템"], include_in_schema=False)
async def root():
    return {"service": "운트(Woon-T) API", "docs": "/docs", "version": "1.0.0"}
