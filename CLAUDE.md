# CG_IPOS — Claude Code Project Instructions

## 1. Purpose

This file defines the mandatory instructions, architecture, development workflow, validation process, and safety rules for working on the CG_IPOS project.

These instructions apply to all development tasks unless the user explicitly overrides them.

Claude MUST follow the existing project architecture and MUST NOT introduce a different architecture merely because another approach may be considered preferable.

---

# 2. Technology Stack

## Frontend

* React
* TypeScript

## Backend

* Node.js
* Express
* JavaScript

## Database

* MariaDB/MySQL-compatible database
* Stored Procedures are used for database operations

---

# 3. Mandatory Backend Architecture

The backend MUST strictly follow this architecture:

Controller
↓
Service
↓
Repository
↓
Stored Procedure
↓
Database

Each layer has a specific responsibility.

## Controller

The Controller is responsible for:

* Receiving HTTP requests
* Reading request parameters/body/query data
* Performing request-level validation where appropriate
* Calling the appropriate Service
* Returning HTTP responses
* Mapping service results to API responses
* Handling HTTP-level errors

The Controller MUST NOT:

* Contain business logic
* Contain database queries
* Call the database directly
* Call Stored Procedures directly
* Contain complex data processing that belongs in the Service layer

---

# 4. Service Layer

The Service is responsible for:

* Business logic
* Business rules
* Validation that requires business context
* Coordinating multiple Repository operations
* Managing application-level workflows
* Transforming data when required by business rules

The Service MUST NOT:

* Execute raw database queries
* Execute Stored Procedures directly
* Contain database connection logic
* Access database tables directly

All database operations MUST go through the Repository layer.

---

# 5. Repository Layer

The Repository is responsible for:

* Database access
* Calling Stored Procedures
* Passing parameters to Stored Procedures
* Receiving database results
* Mapping database results when appropriate

The Repository MUST NOT:

* Contain HTTP logic
* Access Express request/response objects
* Contain controller logic
* Contain unrelated business logic

Database operations MUST be implemented through the Repository.

---

# 6. Stored Procedures

Database operations MUST use Stored Procedures when the existing project architecture requires them.

Preferred flow:

Controller
→ Service
→ Repository
→ Stored Procedure
→ Database

Do NOT bypass the Stored Procedure layer by introducing raw SQL into:

* Controllers
* Services
* Routes
* Frontend
* Other application layers

Before creating a new Stored Procedure:

1. Search for an existing Stored Procedure that already performs the required operation.
2. Determine whether an existing Stored Procedure can be extended safely.
3. Check how similar functionality is implemented elsewhere.
4. Check naming conventions.
5. Check input/output conventions.
6. Check dependencies and callers.
7. Only create a new Stored Procedure if necessary.

Do not create duplicate Stored Procedures.

---

# 7. Frontend Architecture

New frontend code MUST use TypeScript.

Existing JavaScript frontend code MUST NOT be unnecessarily converted to TypeScript unless explicitly requested.

Before creating a new frontend component:

1. Search for existing components.
2. Search for existing hooks.
3. Search for existing utilities.
4. Search for existing API/service functions.
5. Search for existing types/interfaces.
6. Reuse or extend existing functionality when possible.

Frontend API communication MUST remain within the existing API/service layer.

Components SHOULD NOT directly implement backend communication if an existing API/service abstraction is already present.

Do not introduce a new frontend pattern when an existing project pattern can be reused.

---

# 8. Type Rules

When a required Type, interface, enum, or data model is missing or unclear:

DO NOT guess.

DO NOT create an arbitrary Type merely to make the code compile.

First inspect:

* Existing types
* Existing interfaces
* API response types
* Related components
* Related services
* Existing naming conventions

If the required Type is genuinely ambiguous and choosing one could affect the design or behavior, ask the user for clarification before proceeding.

---

# 9. Core Development Principle

Before creating anything, determine whether the functionality already exists.

Always search for:

* Existing files
* Existing functions
* Existing classes
* Existing components
* Existing hooks
* Existing services
* Existing repositories
* Existing Stored Procedures
* Existing API endpoints
* Existing types
* Existing utilities
* Existing tests

Prefer:

REUSE
→ EXTEND
→ REFACTOR WHEN NECESSARY
→ CREATE NEW

Do NOT automatically create new files.

---

# 10. Mandatory Development Process

Claude MUST follow this process for development tasks.

## PHASE 1 — Understand the Request

Before touching the code:

1. Understand exactly what the user is requesting.
2. Identify the expected behavior.
3. Identify affected application layers.
4. Identify potential database impact.
5. Identify potential API changes.
6. Identify frontend impact.
7. Identify validation/testing requirements.

If the requirement is ambiguous and cannot safely be inferred from the existing project, ask the user.

Do not make assumptions about important business rules.

---

# 11. PHASE 2 — Inspect the Existing Project

Before modifying anything:

1. Inspect the project structure.
2. Locate the relevant frontend code.
3. Locate the relevant backend code.
4. Locate the relevant routes.
5. Locate Controllers.
6. Locate Services.
7. Locate Repositories.
8. Locate Stored Procedures.
9. Locate relevant database tables.
10. Locate related Types/interfaces.
11. Locate related tests.
12. Locate similar existing functionality.

Trace the complete existing flow.

For backend functionality, trace:

API Route
→ Controller
→ Service
→ Repository
→ Stored Procedure
→ Database

For frontend functionality, trace:

Component
→ Hook/State
→ API/Service
→ Backend Endpoint
→ Controller
→ Service
→ Repository
→ Stored Procedure
→ Database

Do not modify code until the relevant flow is understood.

---

# 12. PHASE 3 — Identify Existing Patterns

Before implementing:

Search the codebase for similar functionality.

Determine:

* How similar Controllers are implemented
* How similar Services are implemented
* How similar Repositories are implemented
* How Stored Procedures are named
* How parameters are passed
* How errors are handled
* How API responses are structured
* How frontend API calls are implemented
* How Types are defined
* How tests are structured

The implementation MUST follow these existing patterns unless there is a strong reason to change them.

---

# 13. PHASE 4 — Determine the Change Scope

Identify exactly what needs to change.

Categorize changes as:

### Database

* Tables
* Columns
* Indexes
* Foreign keys
* Stored Procedures
* Triggers, if applicable

### Backend

* Routes
* Controllers
* Services
* Repositories
* Types/models
* Utilities
* Validation

### API

* Endpoints
* Request parameters
* Request body
* Response structure
* HTTP status codes
* Error handling

### Frontend

* Pages
* Components
* Hooks
* API/service calls
* Types
* State management
* Validation
* UI behavior

### Tests

* Unit tests
* Integration tests
* API tests
* Component tests
* Regression tests

Only modify layers that actually require changes.

---

# 14. PHASE 5 — Create an Implementation Plan

For non-trivial tasks, create a concise implementation plan before editing.

The plan SHOULD identify:

1. Files to modify
2. Files to create
3. Stored Procedures to modify/create
4. Database objects affected
5. API changes
6. Frontend changes
7. Tests to add/update
8. Validation commands

The plan must respect:

Controller
→ Service
→ Repository
→ Stored Procedure
→ Database

Do not implement a shortcut that bypasses the architecture.

---

# 15. PHASE 6 — Implement the Database Layer First

When a task requires database changes, implement and validate the database layer before depending on it from the application.

Recommended sequence:

1. Inspect current schema.
2. Inspect related Stored Procedures.
3. Inspect foreign keys.
4. Inspect indexes.
5. Determine required changes.
6. Modify/create the required Stored Procedures.
7. Modify database schema if necessary.
8. Execute the required database changes in the authorized development environment.
9. Test the Stored Procedure directly.
10. Verify returned data and affected rows.
11. Verify transaction behavior where applicable.

Do not provide SQL for the user to execute manually when Claude has been explicitly authorized to execute the database changes in the development environment.

---

# 16. PHASE 7 — Implement the Repository Layer

After the database behavior is verified:

1. Update/create the Repository.
2. Connect the Repository to the appropriate Stored Procedure.
3. Follow existing parameter conventions.
4. Follow existing result mapping conventions.
5. Handle database errors according to existing project conventions.

The Repository MUST NOT contain business rules that belong in the Service.

---

# 17. PHASE 8 — Implement the Service Layer

After the Repository is ready:

1. Update/create the Service.
2. Implement business rules.
3. Validate business conditions.
4. Coordinate Repository calls if necessary.
5. Handle business-level errors.
6. Preserve existing behavior that is unrelated to the requested change.

Do not place database queries in the Service.

---

# 18. PHASE 9 — Implement the Controller/API Layer

After the Service is ready:

1. Update/create the Controller.
2. Validate request-level data.
3. Call the Service.
4. Map results to the existing API response format.
5. Use appropriate HTTP status codes.
6. Follow existing error-handling conventions.

Then verify the route:

Route
→ Controller
→ Service
→ Repository
→ Stored Procedure
→ Database

---

# 19. PHASE 10 — Implement the Frontend

After the backend/API behavior is established:

1. Inspect existing frontend architecture.
2. Reuse existing components.
3. Reuse existing hooks.
4. Reuse existing API/service functions.
5. Add/update TypeScript Types.
6. Implement the UI.
7. Implement loading states.
8. Implement error states.
9. Implement validation.
10. Implement success states.
11. Verify API integration.
12. Verify existing functionality remains intact.

Do not duplicate existing frontend functionality.

---

# 20. PHASE 11 — Validation

After implementation, ALWAYS validate the affected system.

Run appropriate:

* Type checks
* Linting
* Unit tests
* Integration tests
* API tests
* Frontend tests
* Builds

Use the project's existing commands.

Do not invent commands when package.json, configuration files, or existing documentation already define the correct commands.

---

# 21. PHASE 12 — Fix Validation Failures

If validation fails:

1. Determine whether the failure was caused by the changes.
2. Inspect the error.
3. Identify the root cause.
4. Fix the issue.
5. Re-run the failed validation.
6. Continue until the affected validation passes.

Do not simply report an error that was introduced by the implementation.

If a failure is pre-existing and unrelated:

1. Verify that it is unrelated.
2. Do not modify unrelated code solely to make the task appear successful.
3. Report the pre-existing failure clearly.

---

# 22. PHASE 13 — Final Review

Before completing the task, review all changes.

Check:

* Architecture compliance
* Naming conventions
* Error handling
* Validation
* Security
* Database integrity
* API compatibility
* Frontend behavior
* Unnecessary code
* Duplicate functionality
* Unrelated modifications
* Type correctness
* Test coverage

Ask internally:

> Did I solve the requested problem without unnecessarily changing anything else?

If not, clean up the changes.

---

# 23. Database Safety Rules

Database changes require additional caution.

Before modifying the database:

1. Determine which database/environment is being used.
2. Verify it is the authorized development environment.
3. Inspect the existing schema.
4. Inspect dependencies.
5. Check existing Stored Procedures.
6. Check whether the requested operation can affect existing data.

Never:

* Drop the database
* Drop unrelated tables
* Delete production data
* Delete database volumes
* Reset the database
* Truncate tables

unless the user explicitly authorizes the specific destructive operation.

Do not assume that a Docker container being local means its database is disposable.

---

# 24. Inventory/POS Safety

Inventory and POS operations are business-critical.

When modifying inventory-related functionality, inspect the complete transaction flow.

Consider:

* Product
* Inventory
* Stock quantity
* Stock movement
* POS transaction
* Transaction details
* Returns
* Voids
* Adjustments
* Cancellation
* Payment status
* Transaction status
* Audit/history

Any operation that changes inventory MUST have a clear and traceable reason for the stock movement.

Avoid directly changing stock quantities without following the project's existing inventory transaction mechanism.

Use transactions where multiple database operations must succeed or fail together.

---

# 25. Error Handling

Follow existing project error-handling conventions.

Do not:

* Swallow errors
* Return meaningless errors
* Expose raw database errors to users
* Duplicate error-handling logic unnecessarily

Errors should provide enough information for debugging while maintaining appropriate API/client responses.

---

# 26. Security

Never expose or commit:

* Passwords
* API keys
* Tokens
* Database credentials
* Private keys
* `.env` secrets
* Authentication secrets

Do not hardcode credentials.

Do not weaken authentication or authorization merely to make a feature work.

When modifying authentication or authorization, inspect the existing security flow first.

---

# 27. Dependencies

Before adding a dependency:

1. Check whether the functionality already exists in the project.
2. Check whether an existing dependency provides it.
3. Check whether the feature can be implemented without another dependency.

Do not add dependencies unnecessarily.

If a new dependency is genuinely required, explain why it is necessary.

---

# 28. File Changes

Keep changes focused.

Do not:

* Reformat unrelated files
* Rename unrelated variables
* Rewrite working modules
* Refactor unrelated architecture
* Upgrade dependencies unnecessarily
* Change unrelated database objects
* Modify unrelated frontend components

If an unrelated issue is discovered, report it rather than fixing it unless it directly blocks the requested task.

---

# 29. Git Safety

Claude MUST NOT:

* Push to GitHub automatically
* Force push
* Delete branches
* Reset the repository destructively
* Rewrite commit history

Unless explicitly requested by the user.

Before major changes, inspect:

```bash
git status
```

After implementation, inspect:

```bash
git status
git diff
```

Never assume changes shown in Git are all caused by the current task. Review the working tree first.

---

# 30. Existing Changes

Before modifying files:

Check whether there are already uncommitted changes.

If unrelated user changes exist:

* Preserve them.
* Do not overwrite them.
* Do not revert them.
* Do not reset them.

Only modify the parts required for the requested task.

---

# 31. When to Ask the User

Ask the user before proceeding when:

* A critical business rule is ambiguous.
* A required Type is genuinely unclear.
* The requested change could have multiple incompatible interpretations.
* A destructive database operation is required.
* Production resources could be affected.
* Existing behavior conflicts with the requested requirement.
* A security-sensitive decision requires clarification.
* The correct architecture cannot be determined from the existing project.

Do NOT ask unnecessary questions when the answer can be determined by inspecting the existing project.

---

# 32. Do Not Ask the User to Do Work That Claude Can Safely Do

If the user has explicitly authorized Claude to modify the local development project:

Claude SHOULD perform the required development work directly.

Do not merely:

* Generate SQL and tell the user to run it
* Generate code and tell the user where to paste it
* Describe changes without implementing them
* Stop after identifying the problem

Instead:

Inspect
→ Plan
→ Implement
→ Execute
→ Test
→ Fix
→ Verify
→ Report

---

# 33. Complete End-to-End Process

For a full-stack feature, the preferred implementation sequence is:

## Step 1 — Requirement

Understand the requested behavior.

↓

## Step 2 — Repository Inspection

Inspect the existing project.

↓

## Step 3 — Existing Functionality Search

Search for reusable functionality.

↓

## Step 4 — Dependency/Impact Analysis

Determine affected:

* Database
* Stored Procedures
* Repository
* Service
* Controller
* API
* Frontend
* Tests

↓

## Step 5 — Implementation Plan

Define the minimal required changes.

↓

## Step 6 — Database

Schema/Stored Procedure changes.

↓

## Step 7 — Repository

Database access implementation.

↓

## Step 8 — Service

Business logic implementation.

↓

## Step 9 — Controller/API

HTTP/API implementation.

↓

## Step 10 — Frontend

UI/API integration.

↓

## Step 11 — Testing

Run affected tests.

↓

## Step 12 — Type Checking

Run type checks.

↓

## Step 13 — Linting

Run linting.

↓

## Step 14 — Build

Run relevant builds.

↓

## Step 15 — Error Resolution

Fix issues caused by the implementation.

↓

## Step 16 — Final Review

Review the complete change.

↓

## Step 17 — Report

Report:

* What was changed
* Files changed
* Database objects changed
* Stored Procedures changed
* API changes
* Frontend changes
* Tests executed
* Build/type-check results
* Any remaining issues

---

# 34. Final Response Format

At the end of a completed task, provide a concise implementation report.

Use:

## Implementation Summary

Briefly explain what was implemented.

## Database Changes

List:

* Tables changed
* Columns changed
* Stored Procedures changed
* Indexes/constraints changed

If none, state:

> No database changes were required.

## Backend Changes

List:

* Routes
* Controllers
* Services
* Repositories
* Other backend files

## Frontend Changes

List:

* Pages
* Components
* Hooks
* API/services
* Types

## Validation

Report:

* Type check
* Lint
* Tests
* Build

For each, report whether it passed or failed.

## Remaining Issues

Only list genuine remaining issues.

Do not claim success if validation has not been performed.

---

# 35. Core Rule

The most important rule for this project is:

DO NOT GUESS THE EXISTING ARCHITECTURE.

Inspect it.

Understand it.

Follow it.

Reuse it.

Then make the smallest safe change necessary.

The required backend architecture is:

Controller
→ Service
→ Repository
→ Stored Procedure
→ Database

The preferred development process is:

Understand
→ Inspect
→ Analyze
→ Plan
→ Implement
→ Execute
→ Test
→ Fix
→ Verify
→ Report
