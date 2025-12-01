# Flick Web

축제 및 행사에서 사용하는 선불 결제 시스템입니다. <br>
사용자 충전 관리부터 부스별 판매 관리까지 지원하는 통합 플랫폼입니다.

## 프로젝트 구조

이 프로젝트는 Turborepo 기반의 모노레포로 구성되어 있습니다.

```
flick-web/
├── apps/
│   ├── admin/          # 관리자 대시보드
│   └── place/          # 부스 운영자 앱
└── packages/
    ├── ui/             # 공유 UI 컴포넌트
    ├── eslint-config/  # ESLint 설정
    └── typescript-config/ # TypeScript 설정
```

## 애플리케이션

### Admin (관리자 대시보드)

전체 시스템을 관리하는 백오피스 애플리케이션입니다.

**주요 기능:**
- 대시보드: 총 충전/사용/잔여 금액 통계
- 부스 관리
- 공지사항 관리
- 문의사항 관리
- 거래 내역 조회
- 사용자 관리
- 데이터 다운로드

### Place (부스 운영자 앱)

개별 부스(판매점) 운영자를 위한 애플리케이션입니다.

**주요 기능:**
- 대시보드: 총 판매 금액 및 거래 건수
- 상품 관리
- 주문 관리
- 키오스크 관리
- 매출 현황

## 기술 스택

- **프레임워크:** Next.js 15.3 (App Router)
- **언어:** TypeScript 5.8
- **UI 라이브러리:** React 19
- **상태관리:** Zustand, TanStack Query (React Query)
- **스타일링:** Tailwind CSS 4
- **UI 컴포넌트:** Radix UI
- **폼 관리:** React Hook Form + Zod
- **차트:** Chart.js (admin)
- **QR 코드:** qrcode.react (place)
- **HTTP 클라이언트:** Axios
- **빌드 시스템:** Turbo
- **패키지 매니저:** pnpm 9.0.0

## 프로젝트 구조 상세

### apps/admin

```
apps/admin/src/
├── app/
│   ├── (auth)/           # 인증 관련 페이지
│   ├── (dashboard)/      # 대시보드 페이지들
│   │   ├── booths/       # 부스 관리
│   │   ├── download/     # 데이터 다운로드
│   │   ├── inquiries/    # 문의사항
│   │   ├── notices/      # 공지사항
│   │   ├── transactions/ # 거래 내역
│   │   └── users/        # 사용자 관리
│   └── layout.tsx
├── components/           # React 컴포넌트
├── lib/                  # 유틸리티 함수
└── stores/               # Zustand 스토어
```

### apps/place

```
apps/place/src/
├── app/
│   ├── (auth)/           # 인증 관련 페이지
│   ├── (dashboard)/      # 대시보드 페이지들
│   │   ├── kiosks/       # 키오스크 관리
│   │   ├── orders/       # 주문 관리
│   │   ├── products/     # 상품 관리
│   │   └── sales/        # 매출 현황
│   └── layout.tsx
├── components/           # React 컴포넌트
├── lib/                  # 유틸리티 함수
├── stores/               # Zustand 스토어
└── types/                # TypeScript 타입 정의
```
