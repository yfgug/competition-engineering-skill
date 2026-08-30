# Changelog

Notable changes to this repository are documented here. The project follows semantic versioning for public releases.

## [Unreleased]

### Added

- Audit readiness checks, repeatable path-glob exclusions, configurable scan limits, and stable JSON scan metadata.
- Explicit project-profile overrides for readiness checks on legacy workspaces, with conflict warnings.
- Regression tests for profile defaults, readiness, scan controls, and Windows paths containing spaces.
- CI coverage for Node.js 22 and 24 on both Windows and Linux.

### Fixed

- Updated Codex installation documentation to the current `.agents/skills` discovery paths.
- Removed competition-only wording from shared research scaffolds and initialized profile-specific entry fields.
- Prevented false stale-path warnings for quoted or backtick-delimited Windows paths containing spaces.

## [1.1.0] - 2026-08-25

### Added

- Experimental-research mode with claim-evidence, figure, table, data, and model provenance templates.
- Safe adoption guidance for mature workspaces with legacy notes and overlapping directory roles.
- Read-only workspace audit for stale paths, encoding problems, missing ledgers, authority drift, and duplicate directories.
- Dependency-free repository validation and Windows/Linux GitHub Actions.
- Sanitized LLM inference optimization adoption case study and citation metadata.

### Changed

- Generalized the workflow from competition-only submissions to external evaluation, paper, artifact, and data releases.
- Strengthened baseline promotion, evaluation validity, permission boundaries, and reproducible-delivery guidance.

## [1.0.0] - 2026-08-24

- Initial public release of the competition engineering skill and scaffold.

[Unreleased]: https://github.com/yfgug/competition-engineering-skill/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/yfgug/competition-engineering-skill/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/yfgug/competition-engineering-skill/releases/tag/v1.0.0
