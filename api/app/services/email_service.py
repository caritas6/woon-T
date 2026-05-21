"""
이메일 서비스 — aiosmtplib 기반 비동기 이메일 발송

지원 이메일:
  - welcome          : 회원가입 환영 메일
  - analysis_done    : AI 진로 분석 완료 알림
  - booking_confirm  : 상담 예약 확인
  - payment_confirm  : 결제 완료 확인

SMTP 환경 변수가 없으면 발송을 건너뛰고 로그만 남깁니다(개발 환경 친화적).
"""

from __future__ import annotations

import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass

log = logging.getLogger(__name__)

# ── 공통 스타일 상수 ──────────────────────────────────────────────────────────

_INK   = "#1A1A2E"
_GOLD  = "#C9A84C"
_PAPER = "#FAF8F2"
_MUTED = "#7A7060"
_WHITE = "#FFFFFF"

# ── HTML 기본 레이아웃 ────────────────────────────────────────────────────────

def _base_html(title: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:{_PAPER};font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:{_PAPER};padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0"
               style="max-width:580px;width:100%;background:{_INK};border-radius:16px;overflow:hidden;">

          <!-- 헤더 -->
          <tr>
            <td style="padding:28px 36px;border-bottom:1px solid rgba(201,168,76,.2);">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:32px;height:32px;background:{_GOLD};border-radius:50%;
                              text-align:center;vertical-align:middle;">
                    <span style="font-family:serif;font-size:14px;font-weight:700;color:{_INK};">運</span>
                  </td>
                  <td style="padding-left:10px;font-family:serif;font-size:16px;
                              font-weight:700;color:{_WHITE};">운트(Woon-T)</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 본문 -->
          <tr>
            <td style="padding:36px 36px 28px;">
              {body_html}
            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td style="padding:20px 36px 28px;border-top:1px solid rgba(255,255,255,.08);">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,.3);line-height:1.7;">
                이 메일은 운트(Woon-T) 서비스 이용 중 발송된 알림입니다.<br>
                문의: <a href="mailto:help@woon-t.com" style="color:{_GOLD};text-decoration:none;">help@woon-t.com</a>
                &nbsp;·&nbsp;
                <a href="https://woon-t.com" style="color:{_GOLD};text-decoration:none;">woon-t.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _btn(text: str, url: str) -> str:
    return (
        f'<a href="{url}" style="display:inline-block;background:{_GOLD};color:{_INK};'
        f'font-weight:700;font-size:14px;padding:14px 28px;border-radius:9999px;'
        f'text-decoration:none;margin-top:8px;">{text}</a>'
    )


def _h1(text: str) -> str:
    return (
        f'<h1 style="margin:0 0 12px;font-family:serif;font-size:22px;'
        f'font-weight:700;color:{_WHITE};">{text}</h1>'
    )


def _p(text: str, *, muted: bool = False, small: bool = False) -> str:
    color = f"rgba(255,255,255,{'0.4' if muted else '0.7'})"
    size  = "12px" if small else "14px"
    return (
        f'<p style="margin:0 0 14px;font-size:{size};color:{color};line-height:1.75;">'
        f'{text}</p>'
    )


# ── 이메일 본문 템플릿 ────────────────────────────────────────────────────────

def _welcome_html(nickname: str) -> str:
    name = nickname or "회원"
    body = f"""
      {_h1(f"환영합니다, {name}님! ✨")}
      {_p("사주(四柱)로 풀어내는 나만의 진로 이야기, 운트(Woon-T)에 오신 것을 환영합니다.")}
      {_p("지금 바로 생년월일과 태어난 시각을 입력하고<br>AI가 분석하는 오행 기반 커리어 리포트를 받아보세요.")}
      <div style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.25);
                  border-radius:12px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 10px;font-size:12px;color:{_GOLD};font-weight:700;letter-spacing:.05em;">
          무료 체험으로 확인할 수 있는 것들
        </p>
        {''.join(f'''<p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,.6);">
          <span style="color:{_GOLD};margin-right:8px;">✓</span>{feat}</p>'''
          for feat in [
            "오행(木火土金水) 원소 분석 미리보기",
            "나에게 맞는 직군 2가지 추천",
            "격국·용신 힌트",
          ])}
      </div>
      <div style="text-align:center;margin-top:28px;">
        {_btn("사주 분석 시작하기 →", "https://woon-t.com/analyze")}
      </div>
    """
    return _base_html("운트 가입을 환영합니다", body)


def _analysis_done_html(nickname: str, report_id: str, one_liner: str) -> str:
    name    = nickname or "회원"
    snippet = one_liner[:60] + "…" if len(one_liner) > 60 else one_liner
    body    = f"""
      {_h1("AI 진로 분석이 완료됐습니다 🎴")}
      {_p(f"{name}님의 사주 기반 커리어 리포트가 준비됐습니다.")}
      <div style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.25);
                  border-radius:12px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,.3);letter-spacing:.08em;">당신의 진로 페르소나</p>
        <p style="margin:0;font-size:15px;color:{_WHITE};font-style:italic;line-height:1.6;">"{snippet}"</p>
      </div>
      {_p("리포트에는 격국·용신 심층 분석, 추천 직군 3가지, 피해야 할 업종, 커리어 타이밍 인사이트가 담겨 있습니다.")}
      <div style="text-align:center;margin-top:28px;">
        {_btn("전체 리포트 보기 →", f"https://woon-t.com/result/{report_id}")}
      </div>
    """
    return _base_html("AI 진로 분석 완료", body)


def _booking_confirm_html(
    nickname: str,
    expert_name: str,
    consult_date: str,
    consult_time: str,
    duration_min: int,
) -> str:
    name = nickname or "회원"
    body = f"""
      {_h1("상담 예약이 확정됐습니다 🗓")}
      {_p(f"{name}님의 전문가 상담 예약이 완료됐습니다.")}
      <div style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.25);
                  border-radius:12px;padding:20px;margin:20px 0;">
        {''.join(f'''<div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <span style="font-size:13px;color:rgba(255,255,255,.4);">{label}</span>
          <span style="font-size:13px;color:{_WHITE};font-weight:600;">{value}</span>
        </div>'''
        for label, value in [
          ("전문가", expert_name),
          ("날짜", consult_date),
          ("시간", consult_time),
          ("소요 시간", f"{duration_min}분"),
        ])}
      </div>
      {_p("상담 10분 전 카카오톡 또는 이메일로 화상 링크를 보내드립니다.", muted=True)}
      {_p("예약 변경·취소는 상담 24시간 전까지 고객센터에 문의해 주세요.", muted=True, small=True)}
      <div style="text-align:center;margin-top:28px;">
        {_btn("대시보드 확인하기 →", "https://woon-t.com/dashboard")}
      </div>
    """
    return _base_html("상담 예약 확인", body)


def _payment_confirm_html(
    nickname: str,
    plan_name: str,
    amount: int,
    order_id: str,
) -> str:
    name = nickname or "회원"
    body = f"""
      {_h1("결제가 완료됐습니다 ✅")}
      {_p(f"{name}님의 {plan_name} 플랜 구독이 시작됐습니다.")}
      <div style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.25);
                  border-radius:12px;padding:20px;margin:20px 0;">
        {''.join(f'''<div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <span style="font-size:13px;color:rgba(255,255,255,.4);">{label}</span>
          <span style="font-size:13px;color:{_WHITE};font-weight:600;">{value}</span>
        </div>'''
        for label, value in [
          ("플랜", plan_name),
          ("결제 금액", f"₩{amount:,}"),
          ("주문 번호", order_id),
        ])}
      </div>
      {_p("이제 Pro 플랜의 모든 기능을 이용하실 수 있습니다.", muted=True)}
      <div style="text-align:center;margin-top:28px;">
        {_btn("대시보드에서 확인하기 →", "https://woon-t.com/dashboard")}
      </div>
    """
    return _base_html("결제 완료", body)


# ── SMTP 발송 코어 ────────────────────────────────────────────────────────────

async def _send(
    *,
    to_email: str,
    subject: str,
    html: str,
    plain: str,
) -> None:
    """
    SMTP_HOST가 설정돼 있으면 실제 발송, 없으면 개발 로그로 대체.
    예외는 삼켜서 메인 플로우를 방해하지 않습니다.
    """
    from app.config import get_settings

    cfg = get_settings()
    host: str = getattr(cfg, "SMTP_HOST", "")
    if not host:
        log.info("[EMAIL-SKIP] to=%s subject=%s (SMTP_HOST 미설정)", to_email, subject)
        return

    try:
        import aiosmtplib  # type: ignore[import]
    except ImportError:
        log.warning("[EMAIL-SKIP] aiosmtplib 미설치 — pip install aiosmtplib")
        return

    port: int       = int(getattr(cfg, "SMTP_PORT", 587))
    user: str       = getattr(cfg, "SMTP_USER", "")
    password: str   = getattr(cfg, "SMTP_PASSWORD", "")
    from_addr: str  = getattr(cfg, "SMTP_FROM", f"운트(Woon-T) <noreply@woon-t.com>")
    use_tls: bool   = bool(getattr(cfg, "SMTP_TLS", True))

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = from_addr
    msg["To"]      = to_email
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html,  "html",  "utf-8"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=host,
            port=port,
            username=user or None,
            password=password or None,
            start_tls=use_tls,
        )
        log.info("[EMAIL-SENT] to=%s subject=%s", to_email, subject)
    except Exception as exc:
        log.error("[EMAIL-FAIL] to=%s error=%s", to_email, exc)


# ── 공개 API ──────────────────────────────────────────────────────────────────

async def send_welcome(*, to: str, nickname: str) -> None:
    """회원가입 환영 이메일"""
    await _send(
        to_email=to,
        subject="운트(Woon-T) 가입을 환영합니다 ✨",
        html=_welcome_html(nickname),
        plain=(
            f"안녕하세요, {nickname or '회원'}님!\n\n"
            "운트(Woon-T)에 오신 것을 환영합니다.\n"
            "사주 분석을 시작하려면 https://woon-t.com/analyze 를 방문해 주세요.\n\n"
            "감사합니다,\n운트(Woon-T) 팀"
        ),
    )


async def send_analysis_done(
    *,
    to: str,
    nickname: str,
    report_id: str,
    one_liner: str,
) -> None:
    """AI 진로 분석 완료 알림"""
    await _send(
        to_email=to,
        subject="[운트] AI 진로 분석 리포트가 완성됐습니다 🎴",
        html=_analysis_done_html(nickname, report_id, one_liner),
        plain=(
            f"{nickname or '회원'}님의 AI 진로 분석이 완료됐습니다.\n\n"
            f"리포트 보기: https://woon-t.com/result/{report_id}\n\n"
            "운트(Woon-T) 팀"
        ),
    )


async def send_booking_confirm(
    *,
    to: str,
    nickname: str,
    expert_name: str,
    consult_date: str,
    consult_time: str,
    duration_min: int = 30,
) -> None:
    """전문가 상담 예약 확인 이메일"""
    await _send(
        to_email=to,
        subject="[운트] 상담 예약이 확정됐습니다 🗓",
        html=_booking_confirm_html(nickname, expert_name, consult_date, consult_time, duration_min),
        plain=(
            f"{nickname or '회원'}님의 {expert_name} 상담이 예약됐습니다.\n"
            f"날짜: {consult_date} {consult_time} ({duration_min}분)\n\n"
            "대시보드: https://woon-t.com/dashboard\n\n"
            "운트(Woon-T) 팀"
        ),
    )


async def send_payment_confirm(
    *,
    to: str,
    nickname: str,
    plan_name: str,
    amount: int,
    order_id: str,
) -> None:
    """결제 완료 확인 이메일"""
    await _send(
        to_email=to,
        subject=f"[운트] {plan_name} 결제가 완료됐습니다 ✅",
        html=_payment_confirm_html(nickname, plan_name, amount, order_id),
        plain=(
            f"{nickname or '회원'}님의 {plan_name} 구독 결제(₩{amount:,})가 완료됐습니다.\n"
            f"주문 번호: {order_id}\n\n"
            "대시보드: https://woon-t.com/dashboard\n\n"
            "운트(Woon-T) 팀"
        ),
    )
