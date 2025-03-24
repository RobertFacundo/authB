### Authentication WebSite

This project consists of a 

frontend => (https://github.com/RobertFacundo/authF) 

&

backend =>(https://github.com/RobertFacundo/authB) 

working together to provide a secure authentication solution. 
---

# Deployment
-Frontend: Deployed to Vercel via the web interface, communicates with the backend API.

-Backend: Deployed to Render using the VSC CLI, handles authentication and data processing.
---

### Backend

## PostgreSQL DataBase

The application is connected to a PostgreSQL database provided by Supabase. To properly configure the connection to the database, environment variables and a conditional are used to load configurations differently depending on the development or production environment.

# Environment Variables
Environment variables are managed with the ConfigModule of NestJS. Depending on the environment (production or development), different .env files are loaded. This allows using different configurations for each environment.

- In production, the .env.production file is used to load the environment variables.

- In development, the .env file is used to load the local variables.

# Database Connection
The TypeOrmModule package is used to manage the connection to the database. The database configuration file follows this pattern:

- If the DATABASE_URL environment variable is set (as is the case with Supabase), that URL will be used to connect to the database.

- If the DATABASE_URL is not found, individual variables like DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, and DB_DATABASE will be used to configure the connection.


----
Created by Robert Facundo
--