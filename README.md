# WallStreet Value

AI 기반 대한민국 상장기업 **가치투자 분석 및 기업 비교** 플랫폼.

[DART Open API](https://opendart.fss.or.kr/)로 재무·공시 데이터를 수집하고, OpenAI GPT로 **Wall Street Journal 스타일** 분석 리포트를 생성합니다.

**Repository:** [ronafa-debug/groom-260529-dart-api](https://github.com/ronafa-debug/groom-260529-dart-api)

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | WallStreet Value |
| 목표 | 복잡한 기업 공시 데이터를 WSJ 스타일 UI로 제공 |
| 대상 | 대한민국 상장기업 (KOSPI/KOSDAQ) |
| 배포 | Vercel (Serverless Functions + SPA) |

### 아키텍처

```
User → React Frontend (Vite) → Vercel API → DART / OpenAI
                                    ↓
                              Vercel KV (캐시)
```

- **프론트엔드**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Recharts
- **백엔드**: Vercel Serverless Functions (Node.js)
- **캐시**: Vercel KV (로컬 미설정 시 메모리 캐시 fallback)
- **외부 API**: DART Open API, OpenAI GPT-4o / gpt-4o-mini

---

## 주요 기능 (MVP Phase 1~4)

### Phase 1 — 기업 검색 + 재무제표
- 기업명·종목코드 검색 및 자동완성
- 기업 상세 페이지 (기본정보, 업종, 최근 공시)
- 재무제표 조회 (매출, 영업이익, 순이익, 자산, 부채, 현금흐름)
- 가치투자 지표 계산 (PER, PBR, ROE, ROA, 부채비율, 영업이익률, 성장률)

### Phase 2 — 차트 + 기업 비교
- Recharts 기반 재무·수익성·재무상태 차트
- 2~4개 기업 side-by-side 비교 (Zustand + localStorage persist)
- Radar 차트로 수익성·성장·안정성 시각 비교

### Phase 3 — AI 투자 분석 리포트
- GPT 기반 WSJ 스타일 분석 리포트 (성장성, 수익성, 안정성, 경쟁력, 리스크, 장기 관점)
- 신문형 2-column 레이아웃 + 면책 고지
- 금지 표현 필터 (매수 추천, 확실한 수익 등)

### Phase 4 — 공시 모니터링
- 최근 30일 공시 피드 (5분 폴링)
- 중요 공시 하이라이트 (유상증자, 자사주, 합병, 대규모 계약 등)
- GPT 공시 AI 요약

---

## 프로젝트 구조

```
src/
├── api/              # 프론트엔드 fetch 클라이언트
├── components/       # layout, charts, compare, reports, ui
├── pages/            # Home, Company, Compare, Report, Disclosures
├── store/            # useCompareStore (Zustand)
├── hooks/
├── types/
└── utils/            # 재무 정규화, 지표 계산

api/                  # Vercel Serverless Functions
├── company.ts
├── company/search.ts
├── finance.ts
├── analyze.ts
├── compare.ts
├── disclosures.ts
├── disclosures/summarize.ts
└── _lib/             # dart, cache, openai, prompts, market

scripts/
└── dev-server.ts     # 로컬 API 개발 서버
```

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성합니다.

```bash
cp .env.example .env   # Windows: Copy-Item .env.example .env
```

| 변수 | 설명 | 필수 |
|------|------|------|
| `DART_API_KEY` | [DART Open API](https://opendart.fss.or.kr/) 인증키 | ✅ |
| `OPENAI_API_KEY` | [OpenAI API](https://platform.openai.com/) 키 | AI 기능 사용 시 |
| `KV_REST_API_URL` | Vercel KV REST URL | 배포 시 (로컬은 생략 가능) |
| `KV_REST_API_TOKEN` | Vercel KV REST Token | 배포 시 (로컬은 생략 가능) |

> API Key는 **서버에서만** 사용됩니다. 클라이언트 번들에 포함되지 않습니다.

### 3. 로컬 개발

터미널 1 — API 서버 (port 3001):

```bash
npm run dev:api
```

터미널 2 — 프론트엔드 (port 5152):

```bash
npm run dev
```

브라우저에서 **http://localhost:5152/** 접속

프론트엔드의 `/api` 요청은 Vite proxy를 통해 `localhost:3001`로 전달됩니다.

### 4. 빌드

```bash
npm run build
```

---

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/company?corpCode=` | 기업 정보 + 최근 공시 |
| GET | `/api/company/search?q=` | 기업 검색 자동완성 |
| GET | `/api/finance?corpCode=&years=5` | 재무제표 + 가치투자 지표 |
| POST | `/api/analyze` | GPT 단일 기업 분석 리포트 |
| POST | `/api/compare` | 기업 비교 (+ AI 해설 옵션) |
| GET | `/api/disclosures?corpCode=&days=30` | 공시 목록 |
| POST | `/api/disclosures/summarize` | 공시 AI 요약 |

---

## UI/UX

- **테마**: Wall Street Journal + Bloomberg 스타일
- **색상**: Warm White 배경, Charcoal 텍스트, Dark Green / Burgundy 액센트
- **폰트**: Merriweather (헤드라인), Inter (본문), Playfair Display (로고)
- **레이아웃**: 표 중심, 카드 최소화, 신문형 정보 밀도

---

## Vercel 배포

1. GitHub 저장소에 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 Import
3. **Storage → KV** (또는 Upstash Redis) 스토어 생성 후 연결
4. Environment Variables 설정:
   - `DART_API_KEY`
   - `OPENAI_API_KEY`
   - KV 변수는 Vercel 연동 시 자동 주입
5. Deploy

---

## 개발 및 오류 수정 이력

초기 MVP 구축 과정에서 발생·해결한 주요 이슈입니다.

### 1. Windows 환경 Vite scaffold 이슈
- **문제**: `npm create vite`가 PowerShell에서 템플릿 인식 실패 (vanilla-ts로 생성됨)
- **해결**: React + TypeScript 프로젝트를 수동 구성 (`package.json`, `vite.config.ts`, `tsconfig.json` 직접 작성)

### 2. API 중첩 라우트 import 경로 오류
- **문제**: `api/company/search.ts`, `api/disclosures/summarize.ts`에서 `./_lib/` 경로로 import → 모듈 not found
- **해결**: `../_lib/` 상대 경로로 수정

### 3. TypeScript 프로젝트 참조 오류
- **문제**: `tsc -b` project references 설정 시 composite/emit 관련 TS6306, TS6310 오류
- **해결**: 단일 `tsconfig.json`으로 통합 (`src`, `api`, `scripts` 포함), `tsc --noEmit` 사용

### 4. DART corpCode ZIP 파싱 불안정
- **문제**: 수동 ZIP 헤더 파싱으로 `CORPCODE.xml` 추출 실패 가능
- **해결**: `fflate` 라이브러리로 ZIP 압축 해제 후 XML 파싱

### 5. DART API "조회된 데이터가 없습니다" (status 013)
- **문제**: 재무 데이터 없는 연도 API 호출 시 전체 요청 실패
- **해결**: status `013`을 `NO_DATA`로 처리, 해당 연도는 빈 배열 반환 후 계속 진행

### 6. 프론트엔드 API 클라이언트 타입 오류
- **문제**: `request()` 반환 타입 `unknown`으로 `.then(setState)` TS2345 오류
- **해결**: 제네릭 타입 `request<T>()` 및 `CompanyDetail` 등 명시적 타입 export

### 7. 로컬 KV 미설정 환경
- **문제**: Vercel KV env 없이 로컬 실행 시 캐시 오류 가능
- **해결**: `api/_lib/cache.ts`에 메모리 캐시 fallback + in-flight dedup 구현

### 8. 로컬 개발 서버 구성
- **문제**: Vite만 실행 시 `/api` 라우트 없음
- **해결**: `scripts/dev-server.ts` (tsx) 로컬 API 서버 추가, Vite proxy → port 3001

### 9. 로컬 프론트엔드 포트 설정
- **변경**: 로컬 개발 포트를 **5152**로 고정 (`vite.config.ts` — `server.port: 5152`)

---

## 면책

본 서비스는 **투자 자문이 아닙니다**. 모든 AI 분석은 참고용이며, 투자 판단은 사용자 본인의 책임입니다.

- 금지: "무조건 상승", "매수 추천", "확실한 투자" 등
- 권장: "참고용 분석", "투자 판단은 사용자 책임"

---

## 라이선스

Private — All rights reserved.
