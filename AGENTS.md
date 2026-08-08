# Project Instructions

## Technology

Frontend:
- React
- TypeScript

Backend:
- Node.js
- Express
- JavaScript

## Architecture

The backend MUST strictly follow:

Controller
→ Service
→ Repository
→ Stored Procedure
→ Database

Do not bypass any layer.

## General Rules

- Inspect the existing code before making changes.
- Follow the existing project structure and architecture.
- Follow the Controller → Service → Repository → Stored Procedure architecture for all backend operations.
- Reuse existing components, services, repositories, utilities, and stored procedures whenever possible.
- Do not put business logic in routes or controllers.
- Do not put database logic in routes, controllers, or services.
- Database operations must be handled through the Repository layer using Stored Procedures.
- Do not introduce raw SQL when the existing architecture uses Stored Procedures.
- Do not introduce unnecessary dependencies.
- Follow existing naming conventions and coding style.
- Do not modify unrelated code.
- Do not rewrite working code unnecessarily.
- Do not convert JavaScript backend code to TypeScript unless explicitly requested.
- Use TypeScript for all new frontend code.
- Reuse existing frontend components and hooks whenever possible.
- Keep frontend API calls within the existing API/service layer.
- Preserve existing functionality and behavior unless the requested feature requires a change.
- Before creating new files or functionality, check whether existing code can be reused or extended.
- If the required Type is missing or unclear, ask the user for the Type before making changes. Do not assume or choose a Type.
- After making changes, run the appropriate type checks, tests, linting, and builds.
- If validation fails because of your changes, investigate and fix the issue before completing the task.
- Keep changes focused on the requested task.