# Kotonoha Journal

Next.js 16.1.6 + TypeScript + shadcn/ui 기반의 일본어 일기 블로그 프로젝트입니다.

## 주요 기능

- 공개 블로그 페이지 (`/`, `/blog/[id]`)
- 작성자 전용 관리 페이지 (`/me`, `/me/new`, `/me/posts/[id]`)
- 작성자 전용 학습 페이지 (`/learning`, `/learning/[postId]`)
- Supabase Auth 로그인
- Supabase RLS 기반 접근 제어
- Gemini 피드백 도우미 (일기 전체 대필 금지 프롬프트 적용)
- 피드백 히스토리 저장 (`feedback_history`)
- Supabase Storage 썸네일 이미지 업로드 (`post-images`)
- SEO/LLMO: `sitemap.xml`, `robots.txt`, `llms.txt`

## 기술 스택

- Next.js `16.1.6`
- React `19`
- TypeScript
- Tailwind CSS + shadcn/ui 스타일
- Supabase (Auth, Database, Storage)
- Gemini API

## 시작하기

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 환경변수

`.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
OWNER_USER_ID=YOUR_AUTH_USER_UUID
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.0-flash
```

## Supabase RLS 보강 (단일 작성자 제한)

기존 정책은 "각 사용자 본인 글" 형태라 다중 작성자가 가능합니다.
단일 작성자 블로그로 제한하려면 아래 마이그레이션 파일의 `YOUR_OWNER_UUID`를 실제 UUID로 바꿔 실행하세요.

- `supabase/migrations/20260206_owner_locked_policies.sql`

## SEO / LLMO

- `app/sitemap.ts`: 공개 글만 사이트맵 노출
- `app/robots.ts`: `/me`, `/learning`, `/api` 크롤링 차단
- `app/llms.txt/route.ts`: LLM 친화 가이드 제공

## 주의 사항

- 피드백 API는 작성 중 본문을 자동 전달하며, 결과는 `feedback_history`에 저장됩니다.
- 학습 페이지는 작성자만 접근 가능합니다.
- 공개 페이지에는 최종 완성본만 노출됩니다.
