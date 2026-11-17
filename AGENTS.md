# AGENTS.md

## Project Overview

This repository contains **pietrodellanotte.dev**, a personal website and technical blog.

The website is maintained by a backend developer specializing in PHP, Laravel, Yii2, MySQL, and software engineering.

The main goals of the project are:

- Maintain a fast, accessible, secure personal website.
- Publish technical articles, book summaries, and small coding projects.
- Support content in Italian and English.
- Improve code quality and SEO without unnecessary complexity.
- Keep maintenance and hosting costs low.

## Technology Stack

The existing project uses:

- Next.js 12 (Pages Router)
- React 17
- JavaScript
- Tailwind CSS 2
- Markdown files for blog content
- `gray-matter` for frontmatter parsing
- `remark` for Markdown processing

**Important:** These are the original technologies, not mandatory long-term choices.

Before upgrading dependencies, analyze compatibility, migration requirements, and potential breaking changes.

Do not migrate to the Next.js App Router, TypeScript, or a different framework without explicit approval.

## Project Structure

```text
components/        Reusable React components
helpers/           Shared configuration
lib/               Blog utilities and integrations
pages/             Next.js Pages Router
posts/             Markdown blog articles
public/            Static assets, images, sitemap, robots.txt
styles/            Global and component styles
```

Inspect the current repository before making assumptions about implementation details.

## General Development Guidelines

1. Prefer simple, maintainable solutions.
2. Follow the existing code conventions unless a change is justified.
3. Avoid overengineering and unnecessary abstractions.
4. Keep dependencies to a minimum.
5. Prefer incremental changes over large rewrites.
6. Preserve existing functionality and URLs.
7. Explain architectural decisions and important trade-offs.
8. Do not introduce new frameworks or services without approval.
9. Do not introduce unnecessary backend infrastructure or databases.
10. Never expose credentials, API keys, or personal secrets.

## Git Workflow

- Never commit directly to `main`.
- Create a descriptive feature or fix branch before implementing changes.
- Use clear, descriptive commit messages.
- Keep changes focused and reviewable.
- Do not force-push or rewrite shared history.
- Do not merge pull requests without explicit approval.
- Do not deploy to production without explicit approval.

Before making significant changes:

1. Inspect the relevant files.
2. Explain the identified problem.
3. Propose a solution.
4. Identify possible risks.
5. Wait for approval before proceeding.

Small, low-risk changes may be implemented directly on a dedicated branch when explicitly requested.

## Blog Content Guidelines

All blog articles are stored as Markdown files inside `posts/`.

### Writing Style

Articles should be:

- Clear and concise.
- Technically accurate.
- Practical and example-driven.
- Friendly but professional.
- Written in a natural, personal tone.
- Accessible to developers with different experience levels.

Avoid:

- Generic AI-generated introductions.
- Excessive marketing language.
- Unnecessary jargon.
- Artificially long articles.
- Unsupported performance claims.
- Excessive emoji.
- Repetitive conclusions.

Favor real examples, explanations of trade-offs, and practical lessons.

### Supported Languages

The blog should progressively support:

- Italian (`it`)
- English (`en`)

Italian is the primary language.

When writing English content, prefer clear, natural technical English.

Do not translate code identifiers, API names, framework terminology, or technical keywords unnecessarily.

Do not automatically translate existing articles unless explicitly requested.

### Markdown Frontmatter

Existing articles use a structure similar to:

```yaml
---
title: "Example article title"
canonical: "example-article-title"
description: "Short SEO description."
coverImage: "cover.png"
date: "2026-11-15"
time: "18:00:00 GMT+1"
---
```

Preserve compatibility with the existing frontmatter format.

Future multilingual support may introduce optional fields such as:

```yaml
lang: "it"
translationKey: "example-article"
tags:
  - Laravel
  - PHP
```

Do not introduce new required fields without updating the parsing logic and validating existing articles.

### Article Requirements

For new technical articles:

1. Use a clear, descriptive title.
2. Include a concise introduction explaining the problem.
3. Provide realistic, readable code examples.
4. Explain why the solution works.
5. Mention relevant edge cases and trade-offs.
6. Include a practical conclusion.
7. Verify technical claims whenever possible.
8. Do not invent benchmarks, statistics, or test results.
9. Avoid copying third-party content.
10. Follow the existing Markdown conventions.

Keep articles relatively short unless the topic requires a deeper explanation.

## SEO Guidelines

Preserve existing indexed URLs.

When implementing SEO improvements:

- Use descriptive page titles.
- Provide unique meta descriptions.
- Generate consistent canonical URLs.
- Use a single preferred domain.
- Maintain a valid sitemap.
- Maintain `robots.txt`.
- Provide appropriate Open Graph metadata.
- Use meaningful image alternative text.
- Add `hreflang` metadata when multilingual routing is implemented.
- Avoid duplicate content between language versions.

Prefer automatically generated SEO metadata and sitemap entries when appropriate.

Do not change existing article slugs without explicit approval and a redirect strategy.

## Security Guidelines

- Treat Markdown content as potentially untrusted input.
- Review HTML rendering and sanitization requirements.
- Avoid introducing XSS vulnerabilities.
- Never commit secrets or environment files containing credentials.
- Validate inputs and metadata where appropriate.
- Review dependency security before major upgrades.
- Do not modify analytics or cookie consent behavior without verifying privacy implications.

## Performance Guidelines

- Prefer static generation for blog articles when appropriate.
- Minimize client-side JavaScript.
- Optimize images.
- Avoid unnecessary network requests.
- Maintain good Core Web Vitals.
- Avoid adding dependencies for trivial functionality.

Performance improvements should be supported by measurements whenever possible.

## Testing and Validation

Before proposing a change as complete:

1. Install dependencies using the existing lockfile.
2. Run the production build.
3. Run available automated tests.
4. Verify that existing article routes still work.
5. Check Markdown rendering and metadata.
6. Review accessibility and SEO implications.
7. Report any tests that could not be executed.

Existing commands include:

```bash
npm ci
npm run build
npm run dev
```

Do not claim that tests passed unless they were actually executed successfully.

If no automated test suite exists, recommend a minimal testing strategy.

## Initial Technical Audit

The following areas were identified for further investigation:

- Outdated Next.js, React, and Tailwind CSS versions.
- Markdown file filtering and frontmatter validation.
- Static sitemap maintenance.
- Consistency between canonical URLs and sitemap URLs.
- HTML sanitization and Markdown rendering.
- Multilingual HTML language metadata.
- Google Analytics and Cookiebot consent integration.
- Accessibility and responsive behavior.
- Dependency vulnerabilities.

These are preliminary findings, not all confirmed defects.

Validate each finding before implementing a fix.

## Current Editorial Roadmap

The first planned technical article is:

**Italian:** Laravel e il problema N+1: quando una query diventa cento

**English:** Laravel and the N+1 Problem: When One Query Becomes a Hundred

The article should:

- Explain the N+1 query problem in Laravel Eloquent.
- Demonstrate lazy loading and eager loading.
- Use realistic PHP examples.
- Explain how to detect N+1 queries.
- Avoid invented benchmark results.
- Be available in Italian and English.

Before publishing, verify the Markdown structure, multilingual routing, SEO metadata, and images.

## Communication Preferences

- Communicate with the project owner in Italian.
- Keep explanations practical and technically precise.
- Explain what was changed and why.
- Identify risks and breaking changes.
- Distinguish verified findings from assumptions.
- Ask for approval before significant architectural changes.
- Provide a concise summary of modified files and validation results.

## Definition of Done

A task is complete only when:

- The requested functionality is implemented.
- Existing behavior is preserved unless changes were approved.
- The production build succeeds, or blockers are documented.
- Relevant tests and checks are executed, or their absence is reported.
- SEO and accessibility implications are considered.
- Changes are reviewed and summarized.
- No deployment or merge occurs without approval.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
