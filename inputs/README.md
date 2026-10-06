# inputs/ — put your project files here

```
inputs/
├── fsd-spec.md             the client's FSD (architecture) document, saved as Markdown
├── ux/                     one .html file per screen  (subfolders are fine, e.g. ux/admin/, ux/customer/)
└── api/backend-api.yaml    the backend team's OpenAPI file (partial or complete; optional)
```
Edit the SAME file when a screen changes (don't create products-v2.html) — the team compares old and new.
Then run: node tools/check-install.mjs
