# Frofolia — Online Portfolio Template Generator

## Project Title
Frofolia – Online Portfolio Template Generator

## Project Description
Frofolia is a database-driven website where users enter their personal, educational, skill, project and work-experience information, save it to an online database, choose one of three portfolio templates (Simple, Modern, Creative), and generate, preview, print, edit or delete their portfolio.

## Design
Warm editorial look: ivory #F7F3E9, forest green #173D30, charcoal #252820, sage #A8B6A0, terracotta #C5684D, cream #FFFCF5. Playfair Display for headings, Inter for body text and controls. Responsive (phone, tablet, desktop), keyboard accessible, respects reduced-motion, print-friendly preview.

## Project Files
| File | Purpose |
|------|---------|
| index.html | Page shell, fonts, script loading |
| style.css | Navigation, home, form, template picker, preview, manage, dialogs |
| templates.css | Styles for the three templates (scoped `.t1` Simple, `.t2` Modern, `.t3` Creative) |
| templates.js | Shared helpers + the three template renderers (separate markup per template) |
| app.js | Routing, Supabase CRUD, form, pages |
| config.js | Supabase URL + public anon key |
| schema.sql | Creates the `portfolios` table (+ public class-project policies) |
| schema-secure.sql | Optional: per-visitor privacy (see Security) |

## The Three Templates
- **Simple** — minimalist résumé: narrow profile/contact column, serif name, fine dividers, no images or cards.
- **Modern** — forest-green sidebar with section navigation, hero introduction, uniform project-card gallery, grid of experience/education panels, skill tags.
- **Creative** — asymmetric magazine layout: oversized serif name, arch-shaped portrait, numbered editorial labels, varied project gallery, no sidebar.

## Technologies Used
- HTML5, CSS3, JavaScript (vanilla, no build step)
- Supabase JavaScript client (supabase-js v2)
- Google Fonts (Inter, Space Grotesk)

## Database Platform
- Database: Supabase (PostgreSQL, cloud-hosted)
- Database Project: Frofolia
- Access: Row Level Security is enabled. Only the public anon key is used in the website; no secret keys or database password are in the source code.
- Default (`schema.sql`): public policies, so anyone using the site can read, edit and delete every record. Acceptable for a class demo only.
- Recommended (`schema-secure.sql`): each browser signs in anonymously (Supabase Anonymous sign-ins) and can only read/edit/delete the rows it created. The website detects this automatically; no code change is needed.

## Hosting / Deployment Platform
- Vercel (static site)

## Database Structure — table `portfolios`
| Column      | Type        | Description                              |
|-------------|-------------|------------------------------------------|
| id          | text (PK)   | Unique portfolio ID                      |
| name        | text        | Full name (required)                     |
| title       | text        | Headline / role                          |
| photo       | text        | Profile picture (resized, base64)        |
| email       | text        | Email (required)                         |
| phone       | text        | Contact number                           |
| address     | text        | Address                                  |
| about       | text        | About me                                 |
| owner_id    | uuid        | Optional (schema-secure.sql): owner of the row |
| education   | jsonb       | List of {school, degree, years}          |
| skills      | jsonb       | List of skill names                      |
| projects    | jsonb       | List of {title, link, desc, image} (image = resized base64, optional) |
| experience  | jsonb       | List of {role, company, years, desc}     |
| links       | jsonb       | List of {label, url} social/website links|
| template    | int         | Selected template: 0 Simple, 1 Modern, 2 Creative |
| updated_at  | bigint      | Last update time (milliseconds)          |
| created_at  | timestamptz | Creation time                            |

## CRUD Mapping
- Create → `upsert` on Save
- Read → `select` on Manage / Preview
- Update → `upsert` on Edit
- Delete → `delete` on Manage (after a confirmation dialog)

The connection indicator in the navigation bar reflects real request results (Connecting / Database connected / Database unavailable). After every save or delete the list is reloaded from the database, so what is on screen is what is stored.

## Screenshots of the System

### Home Page
![Home page](screenshots/home.png)

### Portfolio Information Form
![Portfolio form](screenshots/form.png)

### Template Selection Page
![Template selection](screenshots/templates.png)

### Manage Portfolio Page
![Manage portfolios](screenshots/manage.png)

## Screenshots of the 3 Templates

### Template 1 – Simple
![Simple template](screenshots/template-simple.png)

### Template 2 – Modern
![Modern template](screenshots/template-modern.png)

### Template 3 – Creative
![Creative template](screenshots/template-creative.png)

## Database Screenshots

### Table Data (Supabase)
![Supabase table](screenshots/supabase-table.png)

### Table Structure (Supabase)
![Supabase structure](screenshots/supabase-structure.png)

## Published Website URL
https://frofolia.vercel.app
