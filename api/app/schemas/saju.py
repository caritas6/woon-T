from pydantic import BaseModel, Field, field_validator
from datetime import date
from typing import Literal


class SajuCalculateRequest(BaseModel):
    birth_date: date = Field(..., description="생년월일 (YYYY-MM-DD)")
    birth_hour: int | None = Field(None, ge=0, le=23, description="태어난 시각 (0~23시). 모르면 null")
    gender: Literal["M", "F"] = Field(..., description="M=남, F=여")
    situation: Literal["취업준비생", "직장인", "N잡러", "창업희망자"] | None = None

    @field_validator("birth_date")
    @classmethod
    def birth_date_range(cls, v: date) -> date:
        if v.year < 1900 or v > date.today():
            raise ValueError("생년월일은 1900년 이후 ~ 오늘 이전이어야 합니다")
        return v


class PillarOut(BaseModel):
    stem: str
    branch: str
    stem_kr: str
    branch_kr: str
    stem_element: str
    branch_element: str


class ElementScoreOut(BaseModel):
    wood: float = Field(alias="木")
    fire: float = Field(alias="火")
    earth: float = Field(alias="土")
    metal: float = Field(alias="金")
    water: float = Field(alias="水")

    model_config = {"populate_by_name": True}


class DaeunOut(BaseModel):
    start_age: int
    stem: str
    branch: str
    element: str
    relationship: str


class SajuResultOut(BaseModel):
    profile_id: str
    year:  PillarOut
    month: PillarOut
    day:   PillarOut
    hour:  PillarOut | None = None
    elements: dict[str, float]   # {"木": 20.0, "火": 15.0, ...}
    ilgan: str
    ilgan_element: str
    gyeokguk: str
    yongsin: str
    persona: dict
    career_matches: list[dict]
    daeun_list: list[DaeunOut]
    ten_gods: dict[str, str]
