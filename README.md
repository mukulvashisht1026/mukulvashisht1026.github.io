# Dreamfolio

A two-page portfolio (Professional + Personal) that is 100% frontend: no server, no build step, no installs.

## View it

Double-click `index.html`. That's it. It opens in your browser and renders straight from `profile.js`.

To publish, upload the folder to any static host (GitHub Pages, Netlify, Vercel).

## Update your data

Edit **`profile.js`**, save, refresh. It is the only data file.

`profile.js` is one JavaScript line `window.PORTFOLIO_DATA = { ... };` wrapped around a JSON-shaped object.
Inside the braces, follow JSON rules: double-quoted keys and strings, commas between items, no trailing commas.

Every list is an array, so adding a new project, event or job means appending one object.
Optional fields can be left out or set to `""`. Empty or missing sections are hidden.

Required: `"schemaVersion": 1`, `profile.name` and `profile.role`. If they are missing or `profile.js` has a syntax error, the page shows an error message instead of the portfolio. Fix the file and refresh.

## Schema (schemaVersion 1)

| Key | Type | Fields (`?` = optional) |
|-----|------|-------------------------|
| `settings?` | object | `sampleData?: bool` (true shows "sample data" notes), `autoplay?: bool` (default `true`: carousels auto-scroll in cards and in the large viewer, even when the visitor's OS has Reduce Motion on; multi-image carousels include a pause button. Set `false` to start carousels paused. Videos never autoplay on the page) |
| `profile` | object | `name`, `role`, `photo?` (base path, no extension, e.g. `public/mukul_pic`), `tagline?`, `location?`, `availability?`, `resumeUrl?` |
| `about` | object | `summary`, `facts?: [{ label, value }]` |
| `skills` | array | `{ group, items: [string] }` |
| `experience?` | array | `{ company, role, start, end?, location?, highlights?: [string] }` (no `end` means "Present") |
| `projects` | array | `{ title, year, type, description, tech?: [string], featured?: bool, links?: [{ label, url }], media?: Media }` |
| `events` | array | `{ name, kind, role, date: "YYYY-MM-DD", location?, description?, achievement?, url? }` |
| `education?` | array | `{ school, degree, start, end? }` |
| `certifications?` | array | `{ name, issuer, year, url? }` |
| `contact` | object | `email`, `phone?`, `links: [{ label, url }]` |
| `personal?` | object | `title`, `intro?`, `photo?` (base path, e.g. `public/mukul_personal`), `hobbies: [{ title, description, icon?, media?: Media }]`, `travel?: [{ place, date: "YYYY-MM", note?, media?: Media }]` |

- `events[].kind`: `hackathon` | `seminar` | `conference` | `workshop` | `talk`
- `events[].role`: `attendee` | `participant` | `speaker` | `organizer`
- Events are shown newest first. Projects with `"featured": true` are shown first.

### Media (carousel or video)

Any project, hobby or trip can have a `media` object. Pick one type per item:

```json
"media": { "type": "images", "items": ["public/projects/cloudnote/1.jpg", "public/projects/cloudnote/2.jpg"], "interval": 3500 }
```

```json
"media": { "type": "video", "src": "public/projects/my-project/demo.mp4", "poster": "public/projects/my-project/poster.jpg" }
```

- `images`: an auto-scrolling carousel that slides smoothly between images (`interval` in ms between slides, optional).
- `video`: plays a video file (`.mp4` or `.webm`); `poster` is optional.
- Clicking either one opens it in a large modal. Close with the close button, Escape, or clicking outside; image galleries also support arrow keys.
- Carousels auto-scroll, both in the cards and in the large viewer. Every multi-image carousel has a pause/play button.
- Videos do not autoplay on the page: the card shows the poster with a play badge. Hovering the card plays a muted preview in the card, which pauses when the pointer leaves. Clicking opens the large viewer, where the video starts playing automatically.
- Card carousels pause while hovered or focused; the viewer keeps rotating. Card media pauses while the viewer is open.
- In the viewer, videos play with sound and controls (if the browser blocks sound, they play muted).
- List every file path. A page opened from disk cannot look inside folders by itself.

## Photos and the `public/` folder

Put all images and videos in `public/`. Paths in `profile.js` are relative to the `dreamfolio` folder.

- **Profile photo:** save it as `public/mukul_pic.jpg` (tries JPG, JPEG, PNG, WebP, AVIF, GIF, HEIC, HEIF, then SVG).
- **Personal page photo:** `public/mukul_personal.jpg`, same rules.
- To change a photo, replace the file and keep the same name, then refresh. No edit to `profile.js` is needed. Keep one photo for each base name: if both JPG and PNG exist, the first supported match wins. If no supported photo loads, initials appear.
- HEIC support varies by browser. Use JPG, PNG, or WebP for broad compatibility. If needed, export your photo to one of those formats.
- Project images in `public/projects/` come from your old GitHub Pages site. The travel images in `public/personal/travel/` are placeholders: replace them with your own photos and update the paths in `profile.js`.
- To show a video for a project, put the file in `public/projects/<project>/` and set `media` to the video form shown above.

### Example: add a hackathon

Append this object to the `events` array in `profile.js` (put a comma after the previous object):

```json
{
  "name": "HackCity 2026",
  "kind": "hackathon",
  "role": "participant",
  "date": "2026-09-20",
  "location": "Berlin",
  "description": "Built a carbon-aware job scheduler.",
  "achievement": "Winner, Sustainability track"
}
```

Reload `index.html` and it appears at the top of the events list.

## Repository and deployment

This repository now serves the Professional page from `index.html` and the Personal page from `personal.html`. `profile.js` is the data source for these pages. The previous homepage is retained at `version_1.html`; its original data/assets and the interactive game remain available.

No build is needed to open the portfolio or serve this repository from GitHub Pages. To package a static upload, run `npm run build:portfolio` (Node.js only; no dependency install needed). This writes the site and preserved legacy assets into `dist/`; edit root files, not generated `dist/` copies.

`npm run build` also rebuilds the existing React game before packaging the static site. That optional game build requires `npm ci`. Docker uses the complete generated `dist/` folder so both pages, data, and public media are included.

Project years/links and personal photos marked as examples are temporary placeholders.

## Docker build and deployment

Run these commands from this repository's root. Requirements: Docker Engine or
Docker Desktop running, Docker Compose v2 with `--wait` support, and Make.
The first build needs internet access to download base images and dependencies.

### One-command build and run

```bash
make deploy
```

Open **http://localhost:8085**. This builds the image(s), starts containers in
the background, and waits for their health checks. Deployment targets your current
Docker context (normally your local machine); it does not create a cloud server.

```bash
make build      # Build without starting containers
make up         # Start previously built or loaded images
make status     # Show container health and ports
make logs       # Follow logs; Ctrl+C stops following logs
make stop       # Stop and remove this project's containers/network
```

Without Make, use `docker compose up -d --build --wait`.

### Port, architecture, and image name

```bash
make deploy PORT=9000
make deploy DOCKER_PLATFORM=linux/arm64
make deploy IMAGE_PREFIX=my-account IMAGE_TAG=v1
```

Default image: `mukul-local/portfolio:latest`. Default platform: `linux/amd64`.
Use `linux/arm64` for ARM servers or native Apple Silicon execution. Keep the same
platform, prefix, tag, and port overrides when running later Make commands.
The website listens on port 8080 inside its container.

### Copy images to another Docker server

After a successful build, export this project's image(s):

```bash
make export IMAGE_ARCHIVE=portfolio-images.tar
```

Copy `portfolio-images.tar`, `compose.yaml`, and `Makefile` into a directory on the
target server. Source code is unnecessary for running the loaded images:

```bash
make load IMAGE_ARCHIVE=portfolio-images.tar
make up
```

The server's CPU architecture must match the built images. Repeat any
`DOCKER_PLATFORM`, `IMAGE_PREFIX`, or `IMAGE_TAG` overrides used during the build.
To use a registry instead, tag and push the built image(s) to your registry, then
configure your container host to pull those tags. Registry publishing is manual.
For public HTTPS, configure a domain and TLS reverse proxy in your hosting platform.

### Application notes and verification

The image serves the static portfolio at / and builds the React game at /game/. Building requires npm registry access.

```bash
curl --fail http://localhost:8085/
```

Use the overridden port if you changed `PORT`. Check the app in a browser as well.

Docker builds and container runtime have not been verified in the preparation
environment because Docker daemon access was denied. Compose configuration and
Make command expansion are checked; a successful local build and health check
are still required.
