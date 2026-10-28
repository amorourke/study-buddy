# Study Buddy

Study Buddy helps students find study groups and book a place to meet.

I first built this for a university project in Python with Flask. Later I rebuilt it in TypeScript, with a React front end and an Express API, to practise building a full-stack app with types shared across the whole codebase.

## What it does

Study Buddy covers three things:

1. **Find and join a group.** A new user can browse study groups, filter them by topic, and join one. Once they join, their name shows up in the group's member list.
2. **Create a group.** A user can start a new group and choose its topic. They become the group leader and can see everyone who joins.
3. **Book a study session.** A user can see which groups they're in and book a venue for one of them. They pick a venue, a date and a one-hour slot, and the app stops two groups booking the same venue at the same time.

The app comes with four topics: Computer Science, English, Science and Maths. If the venue you need isn't listed, you can add it from the Venues page.

The homepage walks new users through these steps. Once you log in, it also shows your upcoming bookings and the groups you've joined, each with a link to book a session.

## Tech stack

| Area | Tools |
| --- | --- |
| Front end | React 19, React Router (loaders and actions), Tailwind CSS v4, Vite |
| Back end | Express 5, running TypeScript directly on Node with no build step |
| Database | SQLite through the libSQL client: a local file in development, Turso in production |
| Validation | Zod schemas in `shared/`, used by both the client and the server |
| Auth | Passwords hashed with bcrypt, plus a JWT stored in an httpOnly cookie |
| Hosting | Vercel, with the client as static files and the API as one serverless function |

## Moving from Flask to TypeScript

- **Shared types and validation.** One set of Zod schemas in `shared/` validates forms in the browser and requests on the server, so the two can't fall out of sync.
- **Rules checked on the server.** The browser hides buttons you can't use, but the API is what enforces the rules. For example, only members can view or make bookings, only the leader can remove members, and the leader can't be removed from their own group.
- **Database rules as a safety net.** Unique constraints and foreign keys back up the checks in code. For example, the same venue can't be booked twice for the same date and slot.

## Design decisions

### Navigation and homepage

- **The nav bar shows what fits the user.** Logged-out visitors see only Register and Log in, at the far right. Once you log in, Home, Groups and Venues appear, with your username and Log out on the right. Pages you can't use yet aren't shown.
- **The homepage is the starting point.** New visitors get a short introduction, a "Get started" button and three cards explaining how to browse, join and create groups. Logged-in users also see their upcoming bookings first, with their groups at the bottom.
- **No pages for managing topics.** Topics are a short fixed list, so the pages for adding and editing them were removed to keep the nav bar small. Venues still have their own page because new places come up more often.

### Database and hosting

- **Turso instead of Node's built-in SQLite.** The first version used `node:sqlite` with a file on disk. That doesn't work on Vercel, where serverless functions have no lasting disk, so the app now uses the libSQL client. The same queries run against a local file in development and a hosted Turso database in production.
- **The database sets itself up.** Each server instance creates the tables and default topics the first time it handles a request, including each serverless cold start, so a fresh database needs no manual setup.

### Sample data

To fill the app with sample students, venues, groups and bookings, set `MOCK_PASSWORD` in `.env` and run:

```bash
npm run db:mock
```

This adds eight students (`alice`, `ben`, `chloe`, `dev`, `ella`, `finn`, `grace` and `harry`), all using `MOCK_PASSWORD` as their password. It doesn't touch existing data. To add your own account to some of the sample groups, pass your username: `npm run db:mock -- your-username`.

To wipe the database and start again with only the default topics:

```bash
npm run db:reset
```