# Security policy

OpenMerge reads source code and posts to GitHub on behalf of the repositories it is installed on, so we take security reports seriously.

## Supported versions

| Version | Supported |
| --- | --- |
| `main` branch and the hosted app at [openmerge.site](https://openmerge.site) | Yes |
| Older commits and forks | No |

## Reporting a vulnerability

**Do not open a public issue, discussion, or pull request for a security problem.**

Report it privately through GitHub:

1. Open the [Security tab](https://github.com/shashank-poola/openmerge/security) of this repository.
2. Click **Report a vulnerability** and fill in the form.

Include as much of the following as you can:

- The affected component: web app, API, worker, GitHub App, or hosted service
- Steps to reproduce, or a proof of concept
- The impact you observed or expect
- Any suggested fix or mitigation

We will acknowledge your report, keep you informed while we investigate, and credit you in the fix unless you ask us not to. Please give us a reasonable amount of time to release a fix before you disclose the issue publicly.

## Scope

In scope:

- This repository: `apps/web`, `apps/server`, `apps/worker`, and `packages/*`
- The hosted service at openmerge.site and the OpenMerge GitHub App

Out of scope:

- Vulnerabilities in third-party dependencies that are already publicly known. Report those upstream.
- Findings that require a compromised GitHub account or a compromised local machine
- Denial of service through high request volume

## For self-hosters

- Keep secrets such as the GitHub App private key, webhook secret, OAuth secret, JWT secret, and model keys in a secret manager, never in the repository.
- Rotate any credential you believe has been exposed, immediately.
- Install the GitHub App only on repositories you want reviewed.
