@AGENTS.md

# ProperT

ProperT (originally drafted as "PropertyOps") is a production-style, multi-tenant property operations platform connecting **tenants**, **property managers**, and **maintenance vendors/technicians**. It manages the full lifecycle of a maintenance issue: report → AI triage → duplicate detection → manager review → vendor assignment → scheduling → realtime updates/messaging → repair → verification → analytics/audit.

**North star:** real product usefulness + deep backend/system-design engineering + *quantifiable* results. This is a portfolio project meant to produce resume bullets backed by measured numbers. Features may change; that center should not.

## Principles

- **Not a CRUD app.** Start as a modular monolith with clear domain boundaries; add infrastructure only when a benchmark justifies it.
- **Measure before optimizing.** Benchmark before and after every optimization (indexes, Redis, caching, etc.). Never add infrastructure "because it's standard."
- **AI is a subsystem, not a gimmick.** Triage, duplicate detection, and vendor routing are evaluated with precision / recall / F1, latency, and cost per request.
- **Multi-tenant isolation is non-negotiable.** Every important resource belongs to an Organization; all queries must be org-scoped, and authorization is covered by tests.

## Domain model

```
Organization
├── Users / Memberships / Roles (RBAC)
├── Properties
│   └── Units
├── Work Orders
│   ├── Attachments
│   ├── Appointments
│   ├── Messages
│   └── Work Order Events   (immutable audit trail; feeds realtime + analytics)
├── Vendors / Technicians
└── Analytics
```

Work orders move through a **controlled state machine**, never by arbitrary status updates:

`SUBMITTED → TRIAGED → ASSIGNED → ACCEPTED → SCHEDULED → IN_PROGRESS → COMPLETED → VERIFIED → CLOSED`

Every important action emits an immutable event.

## Target architecture

Next.js/TypeScript → Node.js API → PostgreSQL, plus Redis, a job queue with background workers (AI, notifications, analytics), WebSockets, object storage, observability, Docker, and CI/CD.

Key engineering areas: multi-tenancy, RBAC, transactional consistency, concurrency control, idempotent APIs, state machines, event-driven processing, caching, DB optimization, automated testing, observability, cloud deployment.

## Performance goals

A simulator will generate realistic data (~100 orgs, 5k properties, 50k units, 100k+ users, 1M+ work orders/events) for load testing. Track: p50/p95/p99 latency, RPS, concurrent users, query performance, cache hit rate, WebSocket latency, queue throughput, error rate, retry reliability, AI accuracy, authz coverage.

## Current stack (as scaffolded)

- Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, shadcn/ui (`components/ui`)
- Prisma 7 with `@prisma/adapter-pg`; schema at `prisma/schema.prisma`, client generated to `src/generated/prisma` (gitignored); config in `prisma7.config.ts`; `DATABASE_URL` in `.env`
