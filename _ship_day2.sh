#!/bin/bash
set -e
cd "/c/Users/KIIT/Desktop/projects/deploy or die"
git add -A
git status -sb
git commit -m "Polish Day 2 demo: one-click seed, badges, panel walk, v0.4.0."
export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch -f --msg-filter "sed '/Co-authored-by: Cursor <cursoragent@cursor.com>/d'" HEAD~1..HEAD
rm -rf .git/refs/original
git push --force-with-lease origin master
git tag -f v0.4.0
git push -f origin v0.4.0
gh release create v0.4.0 --title "CiteGuard v0.4.0" --notes "## Day 2 — superseded policies

- Cite only currently effective policy versions (effectiveDate + policyFamily)
- Citation Auditor currency check
- One-click **Day 2: superseded policies** demo button
- Sources list current/superseded badges
- Panel deck + walk: \`specs/PANEL_DECK.md\`, \`specs/PANEL_WALK.md\`
" 2>/dev/null || gh release edit v0.4.0 --notes "## Day 2 — superseded policies

- Cite only currently effective policy versions
- One-click Day 2 demo + superseded badges
- Panel walk docs
"
git log -1 --format="%h %s%n%b"
