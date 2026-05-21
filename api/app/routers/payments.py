"""결제 라우터 — Toss Payments (국내) + Stripe (글로벌) 지원"""
import hmac
import hashlib
import json
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from app.database import get_db
from app.models.user import User, SubscriptionTier
from app.core.dependencies import get_current_user
from app.config import get_settings
from app.services.email_service import send_payment_confirm

router = APIRouter(prefix="/payments", tags=["결제"])
settings = get_settings()


PLANS = {
    "pro_monthly": {
        "name": "PRO 월간",
        "price_krw": 9900,
        "price_usd": 799,
        "duration_days": 30,
        "tier": SubscriptionTier.PRO,
    },
    "pro_yearly": {
        "name": "PRO 연간",
        "price_krw": 79000,
        "price_usd": 5900,
        "duration_days": 365,
        "tier": SubscriptionTier.PRO,
    },
    "premium_monthly": {
        "name": "PREMIUM 월간",
        "price_krw": 29900,
        "price_usd": 2499,
        "duration_days": 30,
        "tier": SubscriptionTier.PREMIUM,
    },
}


@router.get("/plans")
async def list_plans():
    """요금제 목록 조회"""
    return {
        "plans": [
            {
                "id": plan_id,
                "name": info["name"],
                "price_krw": info["price_krw"],
                "price_usd": info["price_usd"],
            }
            for plan_id, info in PLANS.items()
        ]
    }


@router.post("/toss/confirm")
async def toss_confirm(
    body: dict,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Toss Payments 결제 승인
    프론트에서 paymentKey, orderId, amount 를 전달
    """
    import httpx
    import base64

    plan_id = body.get("planId")
    plan = PLANS.get(plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail="유효하지 않은 플랜입니다")

    # Toss Payments 결제 승인 API 호출
    secret_key = settings.TOSS_SECRET_KEY
    auth = base64.b64encode(f"{secret_key}:".encode()).decode()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.tosspayments.com/v1/payments/confirm",
            headers={"Authorization": f"Basic {auth}", "Content-Type": "application/json"},
            json={
                "paymentKey": body["paymentKey"],
                "orderId":    body["orderId"],
                "amount":     body["amount"],
            },
            timeout=10,
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"결제 승인 실패: {resp.json().get('message')}")

    # 구독 업그레이드
    user.subscription_tier = plan["tier"]
    user.subscription_expires_at = datetime.now(timezone.utc) + timedelta(days=plan["duration_days"])
    await db.commit()

    # 결제 완료 이메일 (백그라운드)
    background_tasks.add_task(
        send_payment_confirm,
        to=user.email,
        nickname=user.nickname or "",
        plan_name=plan["name"],
        amount=body.get("amount", plan["price_krw"]),
        order_id=body.get("orderId", ""),
    )

    return {"status": "success", "tier": plan["tier"].value, "expires_at": user.subscription_expires_at.isoformat()}


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """Stripe 웹훅 처리 (글로벌 결제)"""
    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        payload = await request.body()
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 결제 완료 이벤트
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        # 실제 구현: user_id를 metadata에 포함시켜 조회 후 구독 업그레이드
        pass

    return {"received": True}
