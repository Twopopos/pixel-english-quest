# Pixel English Quest — mandatory verification

These rules apply to the English pixel game in `Twopopos/pixel-english-quest` only. Do not apply them to unrelated projects. Use `verified-build/` in this workspace, or the extracted project root when that folder is absent. Prior version folders are historical references.

- Preserve all previously approved design requirements. Do not redesign or ask the user to confirm established requirements again. See the active project’s `PROJECT-STATE.md`.
- After every code edit, run `python3 qa/run.py` from the active project root, fix failures, and rerun affected checks. Run the full suite once after the final edit.
- Static checks and a Node runtime with DOM/canvas mocks are not browser tests. Keep their evidence separate.
- Launch the actual app through HTTP and use the available browser tools after changes. Inspect browser console, resource loading, rendered output, actual button handlers and input. Record exact build hashes and observations in `qa/browser-evidence.json`. Never fabricate results or silently copy evidence from an older build.
- Cover home/START, all classroom worlds, movement/jump/collision, door and ending triggers, transitions, touch controls, words/journal, independent PDF upload/view/save/reopen for worlds 01–03, and current exploration and side-story routes. Concentrate manual regression on affected behavior. Use test-only entry buttons for long routes when needed; explicitly distinguish fixture-assisted coverage from full natural playthroughs.
- Check 390×844 iPhone portrait, 1180×820 iPad landscape and 1366×900 desktop where possible. A desktop browser at an iframe viewport is a layout simulation, not real iPhone/iPad or Safari verification.
- Reproduce a defect, fix it within authorized scope, rerun its test and regression. Continue without routine approval requests. Only stop for genuinely missing files/access/decisions or an unresolvable constraint.
- Before delivery run `python3 qa/run.py --release`. It must reject stale/missing browser evidence and unresolved blocking bugs. Do not label a blocked build as final.
- Entry filename must be `index.html`. Ship a complete deployable tree including all locally referenced fonts, images, audio and scripts; exclude QA fixtures from the website. Never ship escaped HTML, Markdown fences, or HTML as plain text. Check HTTP MIME type and resource failures in actual browser testing.
- Package only the final verified bytes. Verify ZIP integrity, root `index.html`, dependencies, per-file GitHub web limit and SHA-256 manifest against tested bytes. Automatically increment descriptive archive names; never overwrite the last delivered version.
- Final report: static checks, runtime checks, browser checks, fixes, remaining issues and unexecuted/environment-limited tests. Mention fixture assistance and simulated viewports. Never claim real-device, sound audibility, full natural playthrough or production deployment without evidence.
- Do not publish to GitHub or change external hosting without the user's current authorization. Local fixes, tests and downloadable packages are authorized by the task.

This workflow is required for every subsequent game-code generation or modification, including small fixes.
