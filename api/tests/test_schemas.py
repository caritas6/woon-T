"""Pydantic 스키마 검증 테스트"""
import pytest
from datetime import date
from pydantic import ValidationError
from app.schemas.saju import SajuCalculateRequest
from app.schemas.user import RegisterRequest, LoginRequest
from app.schemas.career import CareerAnalyzeRequest, ChatRequest
import uuid


class TestSajuCalculateRequest:
    def test_valid_request(self):
        req = SajuCalculateRequest(birth_date=date(1995, 3, 15), gender="F")
        assert req.gender == "F"
        assert req.birth_hour is None

    def test_valid_with_hour(self):
        req = SajuCalculateRequest(birth_date=date(1995, 3, 15), birth_hour=14, gender="M")
        assert req.birth_hour == 14

    def test_invalid_gender(self):
        with pytest.raises(ValidationError):
            SajuCalculateRequest(birth_date=date(1995, 3, 15), gender="X")

    def test_future_date_rejected(self):
        with pytest.raises(ValidationError):
            SajuCalculateRequest(birth_date=date(2099, 1, 1), gender="F")

    def test_too_old_date_rejected(self):
        with pytest.raises(ValidationError):
            SajuCalculateRequest(birth_date=date(1800, 1, 1), gender="M")

    def test_hour_out_of_range(self):
        with pytest.raises(ValidationError):
            SajuCalculateRequest(birth_date=date(1995, 3, 15), birth_hour=24, gender="F")

    def test_hour_negative_rejected(self):
        with pytest.raises(ValidationError):
            SajuCalculateRequest(birth_date=date(1995, 3, 15), birth_hour=-1, gender="F")

    def test_valid_situation(self):
        req = SajuCalculateRequest(
            birth_date=date(1995, 3, 15),
            gender="F",
            situation="취업준비생",
        )
        assert req.situation == "취업준비생"

    def test_invalid_situation_rejected(self):
        with pytest.raises(ValidationError):
            SajuCalculateRequest(
                birth_date=date(1995, 3, 15),
                gender="F",
                situation="무직",
            )

    @pytest.mark.parametrize("gender", ["M", "F"])
    def test_both_genders_valid(self, gender):
        req = SajuCalculateRequest(birth_date=date(1990, 1, 1), gender=gender)
        assert req.gender == gender


class TestRegisterRequest:
    def test_valid(self):
        req = RegisterRequest(email="user@example.com", password="securepass")
        assert req.email == "user@example.com"

    def test_short_password_rejected(self):
        with pytest.raises(ValidationError):
            RegisterRequest(email="user@example.com", password="short")

    def test_bad_email_rejected(self):
        with pytest.raises(ValidationError):
            RegisterRequest(email="not-email", password="validpassword")

    def test_too_long_password_rejected(self):
        with pytest.raises(ValidationError):
            RegisterRequest(email="user@example.com", password="a" * 73)

    def test_nickname_optional(self):
        req = RegisterRequest(email="user@example.com", password="validpass")
        assert req.nickname is None

    def test_nickname_too_short(self):
        with pytest.raises(ValidationError):
            RegisterRequest(email="user@example.com", password="validpass", nickname="a")

    def test_nickname_too_long(self):
        with pytest.raises(ValidationError):
            RegisterRequest(email="user@example.com", password="validpass", nickname="a" * 21)


class TestLoginRequest:
    def test_valid(self):
        req = LoginRequest(email="user@example.com", password="pass")
        assert req.email == "user@example.com"

    def test_bad_email_rejected(self):
        with pytest.raises(ValidationError):
            LoginRequest(email="bad", password="pass")


class TestCareerAnalyzeRequest:
    def test_valid(self):
        pid = uuid.uuid4()
        req = CareerAnalyzeRequest(saju_profile_id=pid)
        assert req.saju_profile_id == pid

    def test_extra_question_max_length(self):
        pid = uuid.uuid4()
        with pytest.raises(ValidationError):
            CareerAnalyzeRequest(
                saju_profile_id=pid,
                extra_question="a" * 301,
            )

    def test_extra_question_valid(self):
        pid = uuid.uuid4()
        req = CareerAnalyzeRequest(saju_profile_id=pid, extra_question="이직 시기를 알고 싶어요")
        assert req.extra_question == "이직 시기를 알고 싶어요"


class TestChatRequest:
    def test_valid(self):
        rid = uuid.uuid4()
        req = ChatRequest(report_id=rid, message="다음 단계는 무엇인가요?")
        assert req.message == "다음 단계는 무엇인가요?"

    def test_message_too_long(self):
        rid = uuid.uuid4()
        with pytest.raises(ValidationError):
            ChatRequest(report_id=rid, message="a" * 501)
