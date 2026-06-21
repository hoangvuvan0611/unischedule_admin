# Backend Frontend Sync

## Workspace

- Backend: `/Users/vuvanhoang/Workspace/Java/unischedule_service`
- Frontend admin: `/Users/vuvanhoang/Workspace/NextJS/unischedule_admin`
- Runtime API base: `http://localhost:8801`
- Swagger contract: `http://localhost:8801/v3/api-docs`
- Frontend dev server: usually `http://localhost:3001` when port `3000` is busy

## Development Loop

1. Implement or adjust backend controller, DTO, service, and repository.
2. Restart/rebuild backend so `http://localhost:8801/v3/api-docs` reflects source changes.
3. Read Swagger as the contract, not just Java source.
4. Update frontend service methods in `services/reportClient.ts`.
5. Update frontend DTO types in `types/report.ts`.
6. Wire the consuming page or component.
7. Verify with `npm run lint`, `npm run build`, and a browser check of the affected route.

## Current Admin Screens

| Screen | Frontend route | Main backend contract |
| --- | --- | --- |
| Dashboard | `/` | `GET /report/dashboard`, plus analytics/recent fallback endpoints |
| Accounts | `/accounts` | `GET /account/query` |
| Logs | `/logs` | `GET /user-access-logs` |
| Batches | `/batches` | `GET /report/accounts/batches/summary`, `GET /report/accounts/batches/stats/summary` |

## Endpoint Ownership

| Backend endpoint | Frontend usage | Notes |
| --- | --- | --- |
| `GET /report/dashboard` | Dashboard totals, charts, recent accounts, all accounts | Primary dashboard aggregate payload. |
| `GET /report/accounts/statistics` | Dashboard fallback/details | Account totals and created-at milestones. |
| `GET /report/accounts/analytics?days=30` | Dashboard trend chart | Uses `dailyChart`, `hourlyChart`, and `growth` when available. |
| `GET /report/access-logs/analytics?days=30` | Dashboard access trend | Uses `dailyChart`, `hourlyChart`, and `growth` when available. |
| `GET /report/accounts/recent?limit=8` | Dashboard fallback table | Recent account list. |
| `GET /user-access-logs/recent?limit=10` | Dashboard recent log table | Recent log list. |
| `GET /report/accounts/all` | Dashboard fallback charts | Used when dashboard aggregate does not include enough chart data. |
| `GET /account/query` | Accounts page | Supports `username`, `createdFrom`, `createdTo`, `updatedFrom`, `updatedTo`, `page`, `size`, `sortBy`, `sortDirection`. |
| `GET /user-access-logs` | Logs page | Supports `username`, `osOfDevice`, `accountType`, `createdFrom`, `createdTo`, `page`, `size`, `sortBy`, `sortDirection`. |
| `GET /report/accounts/batches/summary` | Batches page | Batch reports with optional account details. |
| `GET /report/accounts/batches/stats/summary` | Batches page and dashboard | Batch stats without account detail records. |

## Contract Gaps To Watch

- `AccountInfoDTO` from `GET /account/query` currently exposes `id`, `username`, `accountType`, `createdAt`, and `updatedAt`. Frontend must not assume `accountStatus` or `daysSinceCreated` exists on this endpoint unless backend adds it to Swagger.
- `AccountReportDTO` does expose `accountType`, `accountStatus`, and `daysSinceCreated`; use report endpoints when the UI needs those fields from backend.
- Backend source currently contains `GET /report/access-logs/between`, but the running Swagger did not expose it during the last check. Restart/rebuild backend before wiring this endpoint into frontend.
- `services/accountClient.ts` still contains legacy `POST /account/fullInfoReportOverview`, which is not in current Swagger. Prefer `services/reportClient.ts` for admin reporting.

## Request Template

When asking for a feature, describe the screen-level outcome:

```txt
Hoàn thiện màn Logs: lọc theo loại account, xem tổng log trong khoảng thời gian, biểu đồ OS, và export dữ liệu.
```

I will then handle it in this order:

1. Backend DTO/query/endpoint if the contract is missing data.
2. Swagger verification.
3. Frontend service/type/UI wiring.
4. Lint, build, and browser route verification.
