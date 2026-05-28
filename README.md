<p align="center">
    <img height="120" src="https://www.natours.dev/img/logo-green.png#gh-light-mode-only">
</p>




## Table of contents

- [General info](#general-info)
- [Technologies](#technologies)
- [Setup](#setup)

## General info

Open everyone,who wants to eager seeing beautiy of World

## Technologies

Project is created with:

- Node.js
- Expressjs(fremwork of Node)
- MongoDB
- HTML/CSS/Javascript
- Pug(used for server side rendering)
- JWT (json web token)
- Stripe (payment system)
- Mongoose
- Map (yandex map)
- MVC Architecture
- npm workspaces + Turborepo monorepo
- TypeScript (shared types package)

## Project structure

This repo is an npm-workspaces + Turborepo monorepo:

```
.
├── apps/
│   └── api/         # Express + Mongoose API and server-rendered site (@natours/api)
└── packages/
    └── shared/      # Shared TypeScript types & API contracts (@natours/shared)
```

## Setup

Install once from the repo root (workspaces hoist dependencies):

```
$ npm install
$ npm run build            # builds packages (e.g. @natours/shared)
```

Run the API:

```
$ npm run start            # starts @natours/api from the repo root
# or for development, from apps/api:
$ cd apps/api && npm run dev
```

Environment variables live in `apps/api/.env` (the API reads `./.env`
relative to its own folder, so run/deploy it with `apps/api` as the working
directory).

## Deployment (Render)

The production app is now `apps/api-nest` (NestJS). See **[`CUTOVER.md`](./CUTOVER.md)**
for the full go-live checklist: Render service settings, env vars, the
Stripe webhook URL change, and how to retire the legacy `apps/api` once the
Nest deploy is stable.

Interactive API docs once deployed: `/docs` (Swagger UI).
