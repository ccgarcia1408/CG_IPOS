# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

# PRIMARY PRINCIPLES

1. **Never access the database or database data.**
2. **Strictly preserve all existing technology, framework, library, package, and dependency versions unless the user explicitly requests a version change.**
3. Make the smallest possible change that fully satisfies the user's request.
4. Preserve the existing project structure, architecture, patterns, conventions, and behavior.
5. Modify only files directly required for the requested task.
6. Reuse existing code, components, utilities, hooks, types, services, repositories, and patterns whenever possible.
7. Use the minimum necessary tokens, context, file reads, searches, and tool calls.
8. Do not over-analyze, over-engineer, refactor, redesign, modernize, or restructure unless explicitly requested.
9. Do not introduce new frameworks, libraries, architectural patterns, dependencies, or technologies unless explicitly requested.
10. Do not invent requirements or make unrequested changes.
11. For low-risk ambiguity, follow the existing project pattern instead of asking unnecessary questions.
12. Ask before making decisions that could affect architecture, security, data integrity, API contracts, or existing functionality.
13. Always inform the user what was changed and what was tested.

# PROJECT WORKFLOW
# A1: PLAN -> EXECUTE -> REVIEW-> TEST-> PUSH
**STRICT REMINDER: EXECUTE THIS WORKFLOW WHEN USER TYPED "A1"**

## PLAN
- Get a ticket from either "To Do" or "Claude Created" status. Move the ticket to "For Claude Planning" status.
- If the requirements are clearly defined from the ticket, skip planning and proceed to the **EXECUTE**
- Analyze the selected ticket very carefully and provide accurate implementation plan. Before executing the plan, ask for the plan the user wants to implement. Proceed to **EXECUTE** if the user agreed.

## EXECUTE
- Move the selected ticket to "In Progress" status, execute the planning. Once it finishes the execution, proceed to **REVIEW**

## REVIEW
- Move the ticket to "In Review" status. Review the executed plan very carefully. Once it passess the review, proceed to **TEST**

## TEST
- Move the ticket to "In Testing" status. Test the executed plan very carefully. Once it passess the testing, wait for the user's approval before proceeding to **PUSH**

## PUSH
- Create a new branch, the name of the branch must match the old branches naming format. Do not directly push into "main" branch, strictly switch and move all the changes to the newly created branch. Once the codebase is in the  newly created branch, proceed to commit and push the changes and make sure to provide the detailed description on the changes made. Check first if there are branches that is still not merge, if there is, do not commit and push, ask the user to do pull request and merge first before proceeding. Also inform the user to run npm run import:procedures before committing & pushing the changes. Verify the merge if success or not.

**If all the process are success, move the ticket into "Done" status**