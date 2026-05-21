# 운트(Woon-T) 배포 가이드

## 아키텍처

```
Vercel (Next.js 프론트엔드)
    ↕ HTTPS
Railway (FastAPI 백엔드 + PostgreSQL + Redis)
    ↕
Anthropic API · Toss Payments · SMTP
```

---

## 1. API 서버 — Railway

### 1-1. 사전 준비
- [Railway](https://railway.app) 계정 생성
- GitHub 저장소 연결

### 1-2. 서비스 생성

Railway 대시보드에서:
1. **New Project → Deploy from GitHub repo** → `WOON-T/api` 선택
2. **PostgreSQL** 플러그인 추가 → `DATABASE_URL` 자동 생성
3. **Redis** 플러그인 추가 → `REDIS_URL` 자동 생성

### 1-3. 환경 변수 설정

Railway 서비스 → Variables 탭에서 아래를 입력하세요:

```
APP_ENV=production
DEBUG=false
JWT_SECRET_KEY=<최소 32자의 랜덤 문자열>
ANTHROPIC_API_KEY=sk-ant-...
TOSS_CLIENT_KEY=live_ck_...
TOSS_SECRET_KEY=live_sk_...
ALLOWED_ORIGINS=https://woon-t.com,https://www.woon-t.com
# SMTP (선택)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx   # Gmail 앱 비밀번호
SMTP_FROM=운트(Woon-T) <noreply@woon-t.com>
SMTP_TLS=true
```

> `DATABASE_URL`, `REDIS_URL`은 플러그인이 자동 주입합니다.

### 1-4. 빌드 설정 확인

`api/railway.toml` 이미 설정됨:
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile.prod"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
```

### 1-5. 데이터베이스 마이그레이션

배포 후 Railway 서비스 터미널에서:
```bash
alembic upgrade head
```

### 1-6. 확인

```
GET https://<railway-url>/health         → {"status":"ok"}
GET https://<railway-url>/api/v1/docs    → Swagger UI
```

---

## 2. 프론트엔드 — Vercel

### 2-1. 배포

```bash
cd frontend
npx vercel --prod
```

또는 GitHub 연동 후 자동 배포 (권장).

### 2-2. 환경 변수

Vercel 대시보드 → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://<railway-url>/api/v1
NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_...
```

### 2-3. 도메인 설정

Vercel → Domains → `woon-t.com` 추가 후 DNS 설정:
```
A     @    76.76.21.21
CNAME www  cname.vercel-dns.com
```

---

## 3. Toss Payments 라이브 키 전환

1. [Toss Payments 개발자센터](https://developers.tosspayments.com) → 내 개발정보
2. **라이브 키** 발급 (사업자 심사 후 발급)
3. API 서버: `TOSS_SECRET_KEY=live_sk_...`
4. 프론트엔드: `NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_...`

---

## 4. SMTP 이메일 설정

### Gmail 앱 비밀번호 발급
1. Google 계정 → 보안 → 2단계 인증 활성화
2. 앱 비밀번호 → "메일" 선택 → 16자리 발급
3. `SMTP_PASSWORD`에 입력

### SendGrid (대량 발송 권장)
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxx
```

---

## 5. SEO · 검색 등록

### Google Search Console
1. [search.google.com/search-console](https://search.google.com/search-console)
2. 속성 추가 → `woon-t.com`
3. `DEPLOYMENT.md` 인증 토큰 발급 → `frontend/src/app/layout.tsx` `verification.google` 에 입력
4. 사이트맵 제출: `https://woon-t.com/sitemap.xml`

### Naver Search Advisor
1. [searchadvisor.naver.com](https://searchadvisor.naver.com)
2. 사이트 등록 → `woon-t.com`
3. 사이트맵 제출: `https://woon-t.com/sitemap.xml`

---

## 6. OG 이미지

`frontend/public/og-image.png` (1200×630px) 을 준비하세요.  
현재 메타데이터에서 참조합니다:

```typescript
images: [{ url: "/og-image.png", width: 1200, height: 630 }]
```

권장 도구: [Figma](https://figma.com), [Canva](https://canva.com)  
내용: 운트 로고 + "사주 기반 AI 진로 상담" 텍스트 + 어두운 배경 (#1A1A2E)

---

## 7. 프로덕션 체크리스트

- [ ] Railway PostgreSQL 백업 활성화
- [ ] Railway Redis maxmemory-policy 설정 (`allkeys-lru`)
- [ ] Vercel Analytics 활성화
- [ ] Toss Payments 라이브 키 교체
- [ ] SMTP 테스트 이메일 발송 확인
- [ ] Google Search Console 사이트맵 제출
- [ ] Naver Search Advisor 등록
- [ ] OG 이미지(`public/og-image.png`) 업로드
- [ ] Google Analytics / Umami 연결 (선택)
- [ ] Railway 알림 설정 (슬랙/이메일)
