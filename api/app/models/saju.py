import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, Date, JSON, ForeignKey, Integer, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class SajuProfile(Base):
    """사용자의 사주 프로필 (생년월일시 기준, 변하지 않는 원국)"""
    __tablename__ = "saju_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # 입력값
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    birth_hour: Mapped[int | None] = mapped_column(Integer)   # 0~23, None = 시각 미상
    gender: Mapped[str] = mapped_column(String(1))             # M | F
    situation: Mapped[str | None] = mapped_column(String(50))  # 취준생 | 직장인 | N잡러 | 창업희망

    # 사주 원국 (四柱八字)
    year_stem: Mapped[str] = mapped_column(String(2))     # 年 天干
    year_branch: Mapped[str] = mapped_column(String(2))   # 年 地支
    month_stem: Mapped[str] = mapped_column(String(2))    # 月 天干
    month_branch: Mapped[str] = mapped_column(String(2))  # 月 地支
    day_stem: Mapped[str] = mapped_column(String(2))      # 日 天干 (일간)
    day_branch: Mapped[str] = mapped_column(String(2))    # 日 地支
    hour_stem: Mapped[str | None] = mapped_column(String(2))
    hour_branch: Mapped[str | None] = mapped_column(String(2))

    # 오행 분포 (0~100 스코어)
    element_wood: Mapped[float] = mapped_column(Float, default=0)   # 木
    element_fire: Mapped[float] = mapped_column(Float, default=0)   # 火
    element_earth: Mapped[float] = mapped_column(Float, default=0)  # 土
    element_metal: Mapped[float] = mapped_column(Float, default=0)  # 金
    element_water: Mapped[float] = mapped_column(Float, default=0)  # 水

    # 분석 결과
    ilgan_element: Mapped[str] = mapped_column(String(2))    # 일간 오행
    gyeokguk: Mapped[str | None] = mapped_column(String(50)) # 격국
    yongsin: Mapped[str | None] = mapped_column(String(2))   # 용신 오행
    persona_type: Mapped[str | None] = mapped_column(String(50))

    # 대운 데이터 (JSONB)
    daeun_data: Mapped[dict | None] = mapped_column(JSONB)

    is_primary: Mapped[bool] = mapped_column(default=True)  # 대표 사주
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="saju_profiles")  # noqa: F821
    reports: Mapped[list["Report"]] = relationship(back_populates="saju_profile")  # noqa: F821


class Report(Base):
    """AI 진로 분석 리포트"""
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    saju_profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("saju_profiles.id"))

    report_type: Mapped[str] = mapped_column(String(30), default="basic")  # basic | full | calendar
    status: Mapped[str] = mapped_column(String(20), default="pending")    # pending | processing | done | failed
    situation: Mapped[str | None] = mapped_column(String(50))             # 취준생 | 직장인 | N잡러 | 창업희망자

    # AI 분석 결과 (구조화 JSON)
    analysis_data: Mapped[dict | None] = mapped_column(JSONB)

    # PDF
    pdf_url: Mapped[str | None] = mapped_column(String(500))

    # 결제 연동
    is_paid: Mapped[bool] = mapped_column(default=False)
    payment_id: Mapped[str | None] = mapped_column(String(100))

    ai_tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="reports")  # noqa: F821
    saju_profile: Mapped["SajuProfile"] = relationship(back_populates="reports")
