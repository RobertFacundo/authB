# Authentication WebSite

This project consists of a 

frontend => (https://github.com/RobertFacundo/authF) 

&

backend =>(https://github.com/RobertFacundo/authB) 

working together to provide a secure authentication solution. 

---

### Deployment
-Frontend: Deployed to Vercel via the web interface, communicates with the backend API.

-Backend: Deployed to Render using the VSC CLI, handles authentication and data processing.

---

# Backend

### PostgreSQL DataBase

The application is connected to a PostgreSQL database provided by Supabase. To properly configure the connection to the database, environment variables and a conditional are used to load configurations differently depending on the development or production environment.

### Environment Variables
Environment variables are managed with the ConfigModule of NestJS. Depending on the environment (production or development), different .env files are loaded. This allows using different configurations for each environment.

- In production, the .env.production file is used to load the environment variables.

- In development, the .env file is used to load the local variables.

### Database Connection
The TypeOrmModule package is used to manage the connection to the database. The database configuration file follows this pattern:

- If the DATABASE_URL environment variable is set (as is the case with Supabase), that URL will be used to connect to the database.

- If the DATABASE_URL is not found, individual variables like DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, and DB_DATABASE will be used to configure the connection.

### User Module and Endpoints

The User Module is responsible for handling user-related operations. It includes endpoints for creating a new user, retrieving a user profile by ID, and changing the password of an existing user.

- Endpoints:

POST /user: Creates a new user with the provided details (first name, last name, email, and password).

GET /user/:id: Retrieves the user profile by ID.

PUT /user/:id/password: Changes the password of a user by ID.

### Auth Module and Endpoints

The Auth Module is responsible for handling all user authentication operations. It includes endpoints for registering a new user, logging in, verifying email, and resetting the password.

- Endpoints:

 ```json 
 POST /auth/register ```
Description: Creates a new user with the provided details (first name, last name, email, and password).

POST /auth/login
Description: Logs in the user with the provided email and password.

POST /auth/verify-email
Description: Verifies the user's email using the verification token sent to the user's email.

POST /auth/forgot-password
Description: Sends an email with a link to reset the password.

PUT /auth/reset-password
Description: Resets the user's password using a reset token and a new password.

GET /auth/github
Description: Redirects the user to GitHub's OAuth authorization page for login.

GET /auth/github/callback
Description: GitHub OAuth callback endpoint that exchanges the authorization code for an authentication token.

- Email Notifications:

When a new user registers, an email is sent to verify their email address. The verification email includes a token that the user must use to confirm their email.

If a user forgets their password, a password reset email is sent with a link containing a token that can be used to reset their password.

- Third-party Authentication (GitHub):

The system supports authentication via GitHub, using OAuth for secure login. The user is redirected to GitHub’s OAuth page to grant permission, and once authenticated, the user is redirected back to the application with an authentication token.


### Tests & Documentation

The backend is documented using Swagger options. You can access the API documentation at the following link:

[Swagger API Documentation](http://authb.onrender.com/api)

To test the endpoints, you can use the following test user credentials:

```json
{
  "id": 77,
  "firstName": "swagger",
  "lastName": "test",
  "email": "swaggerTest@api.com",
  "password": "4567896!aA"
}
```

----
Created by Robert Facundo
--