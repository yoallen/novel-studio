# Story Canon: working notes

## Before any installer is built or anything is shown to Yolanda

Standing rule (hers): check the build against Story Canon's aesthetic requirements first, fix what falls short, and say what was checked. She should never have to ask.

The aesthetic: a writer's study. Cream paper, purple cloth, Caslon (body and display), Just Another Hand for the pen, ink and pencil and her pink for status. Breathing room. No boardroom charts. Nothing crowds anything else. No em dashes, no AI-speak in any text. Visual changes get a mockup and her approval before they are built.

Check by looking at real screenshots (SHOT_DIR with the e2e specs), including hard cases, not only by tests.

## Shipping

Unit: `npx vitest run`. E2E: `npx vite build` then `PW_PORT=47561 PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx playwright test --reporter=line --timeout=30000`.
Never create files whose names differ only by case (Windows): `git ls-files | tr 'A-Z' 'a-z' | sort | uniq -d`.
Pushing main builds the Windows installer (0.1.<run number>). Update the guide in src/ui/guide with every user-facing change.
