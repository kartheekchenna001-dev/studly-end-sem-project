# Studyly — Integrated Student Exam Management System

This build intentionally removes the login screen. Use the Student / Admin-Faculty / Principal mode selector in the sidebar for demo/testing.

Included:
- Existing Studyly exam, AI quiz, review, notes, planner and performance features.
- One Games section with the six built-in retro games.
- 100 progressive levels per game; completing a level automatically loads the next level.
- 30-minute daily game timer starts only when a game is launched.
- Student rank / leaderboard based on recorded assessment results.
- Admin/Principal learning-video upload with IndexedDB storage; students can watch published videos in the same browser.
- Admin/Principal learning-note publishing.
- Automatic daily local quiz generation from published learning-note text. This is a frontend/local generator, not a hosted LLM.
- No emulator, emulator ROMs, NES section, or GBA section.
- No login/credentials; login can be added later.

Run by opening index.html, or use any static web server if your browser blocks local resources. No BAT server is required for this build.


## Rotating project backgrounds
The original gradient/grid background is replaced with the 14 supplied photos. Background images cross-fade every 10 seconds and the text, accent colors, panel tint, and overlay update together. Photos are stored locally in `backgrounds/`.


## Principal mode update
Principal mode is available in the mode selector. It includes the shared management tools plus Users, System Activity, and a new Principal Reports page with institution-wide averages and student rankings. The reports use results already stored in this browser.


## Scenic wallpapers added
18 uploaded Unsplash JPG images are included in the `backgrounds/` folder. The full-screen background crossfades automatically to the next image every 10 seconds, with matching color accents and overlay tones. Keep the `backgrounds/` folder beside `index.html` and `backgrounds.js`.


## Light and Dark Mode
The demo workspace includes a persistent Light/Dark theme switch in the demo controls. Switching themes triggers a stickman animation: he carries the sun toward the centre for Light Mode, or the moon toward the centre for Dark Mode. Your selected theme is saved in this browser and restored on the next visit. The demo role selector remains unchanged.


## Separate login page
Studyly opens on a dedicated sign-in screen. Choose Student, Admin / Faculty, or Principal, enter a display name and any demo password, then sign in to open that role workspace. Sign Out returns to the login screen. This is a frontend demo flow, not production-grade password authentication. The light/dark theme switch is available on both the login page and workspace.


## Demo review build
- Login is in demo mode: select Student, Admin / Faculty, or Principal and press Sign In.
- No username or password is required.
- Existing role-specific dashboards and application features are retained.
- The Studyly wordmark uses the aligned red dot.
- Login motivational quotes rotate every 10 seconds; numeric suffixes are stripped from displayed quote text.
- This is a local front-end demo. Data is stored in the browser and is not production authentication.


## Studyly account access (local demo)
- Students can create accounts from **Create Student Account** using name, email, and a password of at least 8 characters.
- Admin/Faculty and Principal accounts cannot self-register. Create them only from **Authorized staff account setup** using the setup key.
- Default setup key for this local demo: `STUDYLY-SETUP-2026`. Change `PRIVILEGED_SETUP_KEY` in `app.js` before sharing the project.
- Accounts are stored in this browser's localStorage. Passwords are stored as SHA-256 digests, not plaintext.
- This is suitable only as a local classroom/demo prototype. Because the app is static and client-side, a setup key embedded in JavaScript is not secure against a technically capable user. For real deployment, use a server-side authentication service, salted password hashing (Argon2id/bcrypt), and server-enforced roles.


## Demo login roles
Student accounts are created through Student Registration. After registering, sign in with the same email and password. If the registered password contains `admin`, the session opens Admin/Faculty mode; if it contains `principal` (or `principle`), it opens Principal mode. Principal takes priority if both keywords appear. This is a client-side demonstration only; use server-side authentication and authorization for real deployment.


## Exam Planner and Student Notes & Research Papers
- Admin/Faculty and Principal can create exams with custom durations and add unlimited MCQ, VSAQ, SAQ and LAQ questions.
- Each question supports an individual mark value and model/correct answer; MCQs support options.
- The exam manager shows question count and total marks, supports individual question deletion, clearing a question bank, publishing/unpublishing and deleting exams.
- Students see published exams, answer questions in a timed attempt, and receive an immediate weighted marks/percentage result on submission or timeout.
- Students can submit notes or research papers against an exam and subject, with a title, description and optional image/PDF attachments. They can track pending, approved or rejected status.
- Admin/Faculty and Principal can edit submission metadata, add review notes, reject, or approve and publish material to all student accounts.
- Attachments are stored as browser data in localStorage for this standalone demo; large files are limited to 2 MB each.


## Added React Student Management (additive update)
- A new **Student Management** page is available to Admin/Faculty and Principal roles.
- Built with React components: `Header`, `StudentList`, `StudentManagementApp`, and `Footer`.
- Admin/Principal can add student names and marks (0–100), see automatic PASS/FAIL results (40 is the pass mark), and remove records.
- Student records persist in browser `localStorage` under `studyly_react_student_records`.
- Five sample records are shown on first use. Students can view this page only if granted a navigation entry in a future role update; current student workspace remains unchanged.
- React is loaded from a CDN and is used only on this new page. The original Studyly application remains in vanilla JavaScript and is not replaced.
- Internet access is required to load the React CDN scripts.


## Cookie consent and contact
- Added a cookie banner with **Accept all** and **Essential only**.
- The selected choice is saved in a first-party cookie for 180 days. This project does not set analytics or advertising cookies.
- Contact email is displayed at the bottom of the login screen and workspace: **kartheekchenna001@gmail.com**.
- See `SECURITY.md` for implemented protections, deployment headers, and important frontend-only limitations.

## Security configuration
- Netlify `_headers` and `_redirects` files are included as a starting point for security headers and HTTPS redirects.
- The current app uses inline scripts and event handlers, so the CSP is compatibility-oriented and includes `'unsafe-inline'`. Read `SECURITY.md` before production deployment.

- Cookie consent styling now uses the same live scenic theme variables (panel, border, text, muted text and accent), so its glass panel adapts as the project background rotates.

- Cookie banner restyled with a dark cybermorphic surface, subtle teal edge lighting, inset button shadows and solid teal Accept All action. Purple gradients have been removed from the cookie banner and its buttons.


## Examination-management expansion
This update adds role-specific examination modules while retaining the existing application, React Student Management page, cookie preferences, and all scenic backgrounds unchanged.

### Student additions
- Examination Center with published exams, scheduled exam information, attempt history, answer review and CSV result export.
- Attendance summary and eligibility estimate based on attendance records entered by staff.
- Assignment list and student submission workflow.
- Syllabus topic tracker and revision checklist.
- Study Assistant that searches the local saved question bank (not a hosted generative AI service).
- Notifications and question bookmarks.

### Admin / Faculty additions
- Reusable question bank with manual entry and CSV import.
- Question paper generator that creates a draft from saved questions for a selected subject.
- Exam scheduling for existing exams.
- Attendance recording.
- Assignment creation, submission review, feedback and optional marks.
- Written-answer inspection and re-evaluation request handling.
- Exam attempt monitoring, result export and principal approval requests.
- Examination notices.

### Principal additions
- Principal Oversight dashboard with institution-level result summaries and subject comparison.
- Exam approval/rejection workflow; approval publishes the associated exam.
- Academic risk indicators based on recorded assessment averages (review aid only).
- Attendance overview, academic calendar, irregularity records, re-evaluation oversight, faculty activity and CSV reports.

### Data and limitations
- New module data is stored in browser localStorage for this project demonstration.
- The Study Assistant searches existing local content; it is not a live AI model.
- CSV import expects simple comma-separated rows; use quoted/clean values and avoid embedded commas in fields.
- The attendance eligibility figure is an informational estimate, not an official university decision.
- Real multi-device notifications, secure role authorization, formal proctoring, server-side evaluation records, institution-wide data sharing and hosted AI require a backend.

- Added manual examination-integrity incident reporting to Exam Operations. It records staff-observed events; it does not claim automated remote proctoring.
