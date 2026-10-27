# Smart Crop Planning

feature/crop-planning-components
## Project Idea

Smart Crop Planning is a MERN application intended to help farmers make better-informed crop choices. It will bring together local weather conditions, soil suitability, historical yield information, and market demand to help reduce uncertainty and support productive, profitable farming decisions.

## Capstone Day-by-Day Plan

| Day | Planned work |
| --- | --- |
| 1 | Confirm user needs, define the first release scope, and map the farmer's main journeys. |
| 2 | Finalize wireframes and define the MongoDB data models for farmer profiles, crops, soil, and planning records. |
| 3 | Set up the MERN application structure and implement the initial backend API and farmer account flows. |
| 4 | Build the frontend navigation, sign-in, account creation, and farmer profile screens. |
| 5 | Add crop and soil information entry, validation, and the supporting backend endpoints. |
| 6 | Integrate weather information and assemble the inputs used for crop recommendations. |
| 7 | Implement the crop-planning results and dashboard, including relevant yield and market-demand information. |
| 8 | Test the main user journeys, fix issues, improve accessibility and responsiveness, and prepare deployment documentation. |

## Mock UX Design

Figma Link: https://school-moss-22946873.figma.site/

The public prototype currently demonstrates the farm sign-in and account-creation entry flows. These screens provide the starting point for the planned crop-planning journey.

feature/mongoose-model-schemas
## Backend Data Models

The Mongoose schemas in `server/models` define farmer profiles and crop plans, including contact details, farm conditions, crop season, field size, plan status, and recommendation snapshots. Run `npm install` in `server`, then `npm test` there to validate the schemas without a database connection.

 feature/database-read-write-api
### Database API

The Express API connects to MongoDB before it starts listening. Copy `server/.env.example` to `server/.env`, set `MONGO_URI` and a private `JWT_SECRET`, then run `npm install` and `npm run dev` from `server`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a farmer account and return a bearer token. |
| `POST` | `/api/auth/login` | Verify a farmer's email/phone and password. |
| `GET` | `/api/farmers/me` | Read the authenticated farmer profile. |
| `GET` | `/api/crop-plans` | Read the authenticated farmer's saved plans. |
| `POST` | `/api/crop-plans` | Save a crop plan for the authenticated farmer. |
| `PATCH` | `/api/crop-plans/:id/status` | Update a plan status owned by the authenticated farmer. |
| `DELETE` | `/api/crop-plans/:id` | Delete a plan owned by the authenticated farmer. |

Protected endpoints require `Authorization: Bearer <token>`. Request bodies are validated by the Mongoose schemas, and password values are hashed before storage. Run `npm test` from `server` for schema and API tests.

## Mock UX Design

Figma Link:  
https://school-moss-22946873.figma.site/

The public prototype currently shows the farm sign-in and account-creation entry flows. The planned crop-planning experience will help farmers make better-informed decisions using weather conditions, soil suitability, historical yields, and market demand.
 feature/mock-ux-design
 
 feature/mock-ux-design
 feature/mock-ux-design
