from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class CareerAnalyzeRequest(BaseModel):
    saju_profile_id: UUID = Field(..., description="분석할 사주 프로필 ID")
    situation: str | None = Field(None, description="현재 상황 (취업준비생 등)")
    extra_question: str | None = Field(None, max_length=300, description="추가 질문 (선택)")


class CareerReportOut(BaseModel):
    report_id: str
    status: str                        # pending | processing | done | failed
    analysis: dict | None = None       # AI 분석 JSON (done일 때만)
    pdf_url: str | None = None
    created_at: datetime
    completed_at: datetime | None = None


class ChatRequest(BaseModel):
    report_id: UUID
    message: str = Field(..., max_length=500)


class ChatResponse(BaseModel):
    reply: str
    report_id: str


class DailyFortuneOut(BaseModel):
    luck_score: int = Field(..., ge=0, le=100)
    message: str
    tip: str
    lucky_color: str
    focus_area: str
    recommended_jobs: list[dict] = []
