# 🧭 GitPilot

A GitHub command center that runs entirely in your browser. No server, no build step, no dependencies.

## Quick start

1. Unzip this folder anywhere.
2. Double-click **`index.html`** (works offline apart from the Inter font, which falls back to your system font).
3. Add a profile (a name and a GitHub Personal Access Token). It is saved in your browser, so you stay connected next time.

Create a token at <https://github.com/settings/personal-access-tokens/new>.
Fine-grained tokens need Contents / Issues / Pull requests / Actions (read & write as needed). Classic tokens: `repo`, `workflow`, `notifications`.

## What it can do

| Area | Features |
|---|---|
| Profiles | Several saved tokens, one-click switching, rename / replace / delete |
| Dashboard | Repo, star and issue counts, language bar, recently pushed |
| Repositories | Search, filter, sort, create |
| Repo tabs | Files (edit/commit), Push, Structure, Branches, Commits, Issues, Pull requests, Actions, Releases |
| **Push** | Drag & drop files or folders, paste AI code, one atomic commit, **Safety Guard**, undo |
| **Download .zip** | Built in the browser from the GitHub API |
| Automate | Run your own JavaScript against the GitHub API |
| UI | Light and dark themes, responsive down to phone width |

## 🛡 Safety Guard (Push tab)

On by default. Before each push it compares your files with the repo and shows a popup with safe choices:
push to a **new branch**, **add new files only**, or **replace with an automatic backup branch**.
Files that look like secrets (`.env`, `*.pem`, `id_rsa`, ...) are skipped unless you untick the box, and the last push can be undone.
Turning the guard off asks for confirmation.

## Folder structure

```
gitpilot/
├── index.html                  Entry point: loads the CSS and JS below (order matters)
├── README.md
├── assets/
│   └── favicon.svg
├── css/
│   ├── tokens.css              Colors, radius, shadows, fonts (dark + light themes)
│   ├── base.css                Reset, typography, buttons, form controls
│   ├── layout.css              App frame, sidebar, header, page animation
│   ├── components.css          Cards, lists, tags, tabs, dialog, toast, skeleton
│   ├── auth.css                Login / profile screen
│   ├── push.css                Drop zone, progress bar
│   ├── guard.css               Safety Guard switch and option cards
│   └── responsive.css          Breakpoints, reduced motion (keep last)
└── js/
    ├── core/                   Foundation used by everything
    │   ├── theme-init.js         Sets light/dark before first paint
    │   ├── state.js              Global state: S (session), R (repos), cache
    │   ├── utils.js              $, esc, ago, base64 helpers
    │   ├── api.js                gh(): GitHub REST client + friendly errors
    │   ├── ui.js                 toast(), form(), confirmD()
    │   └── theme.js              Theme toggle
    ├── lib/                    Reusable helpers
    │   ├── git.js                rp(), R2, bytes(), bsha(), fullTree()
    │   ├── diff.js               Diff renderer
    │   ├── text.js               ASCII tree + copy/download text panel
    │   └── zip.js                Dependency-free ZIP writer
    ├── auth/
    │   └── profiles.js           Profiles, login screen, localStorage
    ├── layout/
    │   └── shell.js              Sidebar, header, router go()
    ├── views/                  Top-level pages
    │   ├── dashboard.js
    │   ├── repositories.js
    │   ├── repo.js               Repo page + tab registry `T`
    │   ├── automate.js
    │   └── notifications.js
    ├── repo-tabs/              One file per repository tab (each registers T.<name>)
    │   ├── files.js  branches.js  commits.js  issues.js
    │   └── pulls.js  actions.js   releases.js structure.js
    ├── features/
    │   ├── push/
    │   │   ├── queue.js          Drag & drop, paste AI code, queue list
    │   │   ├── guard.js          Safety Guard, preflight, popup
    │   │   ├── push.js           Push engine, undo
    │   │   └── push-tab.js       Push tab screen
    │   └── download-zip.js       Repo → .zip
    └── main.js                 Boot: restore profiles, auto-connect
```

## Where do I change X?

| I want to... | Edit |
|---|---|
| Change colors / fonts / spacing | `css/tokens.css` |
| Add a new repo tab | new file in `js/repo-tabs/` (`T.mytab=async()=>{...}`), add its name to `tabs` in `js/views/repo.js`, add a `<script>` line in `index.html` |
| Add a sidebar page | `js/layout/shell.js` (menu + router) and a new file in `js/views/` |
| Change push or guard behavior | `js/features/push/` |
| Change how profiles are stored | `js/auth/profiles.js` |

## Notes

- Scripts are plain `<script>` files that share one scope (no bundler). Load order in `index.html` matters: `core` → `lib` → `auth` → `layout` → `views` → `repo-tabs` → `features` → `main.js`.
- Tokens are stored in your browser's `localStorage` as plain text. Use minimal-scope tokens and avoid shared computers. Delete a profile to remove its token.
- Your token is only ever sent to `api.github.com`.
