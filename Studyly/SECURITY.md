# Studyly security notes

## Implemented in this static project
- Cookie consent banner with **Accept all** and **Essential only** choices.
- The choice is saved in a first-party `studyly_cookie_consent` cookie for 180 days (`Path=/`, `SameSite=Lax`, and `Secure` on HTTPS).
- No analytics, advertising, or cross-site tracking cookies are installed by this project.
- Basic security response headers and a compatibility Content Security Policy are provided in Netlify's `_headers` file.
- HTTPS redirect configuration is provided in `_redirects`.
- Existing password hashing and basic form validation remain in the original application.

## Important limitations
This is still a browser-only application using localStorage and client-side JavaScript. A static frontend cannot securely implement server-side validation, SQL prepared statements, server-enforced roles, MFA, secret environment variables, rate limiting, or account lockout. Do not use it to store real sensitive student records or deploy it as a production authentication system without a backend.

The current app uses inline event handlers and inline scripts/styles, so the compatibility CSP contains `'unsafe-inline'`. This is weaker than a strict CSP. Before production, move inline scripts and event handlers into external files, use nonces or hashes, remove `'unsafe-inline'`, and test the policy in report-only mode first.

## Production deployment checklist
1. Add a backend (for example, Django or Laravel) and validate all inputs server-side.
2. Use parameterized/prepared database queries; never build SQL by concatenating user input.
3. Store passwords with Argon2id or bcrypt and enforce roles on the server.
4. Add MFA, login throttling, account lockout controls, and secure server-managed sessions.
5. Keep secrets in deployment environment variables, not source files.
6. Serve only over HTTPS. The HSTS header in `_headers` should be used only after HTTPS is correctly configured for the whole domain and its subdomains.
7. Add encrypted offsite backups, dependency scanning, SAST/DAST, WAF protection, and an incident-response process.
8. Review third-party scripts and pin/self-host dependencies where practical.

## Contact
kartheekchenna001@gmail.com
