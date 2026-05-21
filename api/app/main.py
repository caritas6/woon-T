from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import get_settings
from app.database import engine, Base
from app.routers import auth, saju, career, fortune, payments, reports

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 시작: DB 테이블 생성 (개발 환경용 — 프로덕션은 alembic)
    if settings.APP_ENV == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    # 종료: 엔진 정리
    await engine.dispose()


app = FastAPI(
    title="운트(Woon-T) API",
    description="사주 기반 맞춤형 진로 상담 플랫폼 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 전역 예외 핸들러 ───────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if settings.DEBUG:
        raise exc
    return JSONResponse(
        status_code=500,
        content={"detail": "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요."},
    )


# ── 라우터 등록 ─────────────────────────────────────────────────────────
PREFIX = settings.API_V1_PREFIX

app.include_router(auth.router,     prefix=PREFIX)
app.include_router(saju.router,     prefix=PREFIX)
app.include_router(career.router,   prefix=PREFIX)
app.include_router(fortune.router,  prefix=PREFIX)
app.include_router(payments.router, prefix=PREFIX)
app.include_router(reports.router,  prefix=PREFIX)


# ── 헬스체크 ────────────────────────────────────────────────────────────
@app.get("/health", tags=["시스템"])
async def health():
    return {"status": "ok", "version": "1.0.0", "service": "Woon-T API"}


@app.get("/", tags=["시스템"])
async def root():
    return {
        "service": "운트(Woon-T) API",
        "docs":    "/docs",
        "version": "1.0.0",
    }
