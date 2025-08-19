# ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-404D59?style=flat-square&logo=express&logoColor=white) ![EJS](https://img.shields.io/badge/EJS-7B42B0?style=flat-square&logo=ejs&logoColor=white)

# Sang_v

Sang_v is a web application designed to facilitate blood donation management. It provides a comprehensive platform for managing donors, medical staff, and the overall donation process. The application features user-specific dashboards for different roles, including administrators, nurses, doctors, and donors, allowing for efficient management and oversight of blood donation campaigns.

## Key Features
- Role-based access control with distinct views for administrators, nurses, doctors, and donors.
- User management capabilities, including registration and profile management.
- Dashboard statistics and reporting for administrators and responsible personnel.
- Donation management and tracking for donors and medical staff.
- Responsive design with a user-friendly interface.

## Tech Stack

| Technology | Description |
|------------|-------------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | JavaScript runtime built on Chrome's V8 JavaScript engine. |
| ![Express](https://img.shields.io/badge/Express.js-404D59?style=flat-square&logo=express&logoColor=white) | Fast, unopinionated, minimalist web framework for Node.js. |
| ![EJS](https://img.shields.io/badge/EJS-7B42B0?style=flat-square&logo=ejs&logoColor=white) | Embedded JavaScript templating for rendering HTML. |
| SQL | Used for database management (as indicated by the presence of `database.sql`). |

## Installation Instructions

### Prerequisites
- Node.js (version 12 or higher)
- npm (Node Package Manager)
- A SQL database (MySQL, PostgreSQL, etc.)

### Step-by-Step Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/fofa2342/sang_v.git
   cd sang_v
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Import the `database.sql` file into your SQL database to create the necessary tables.

4. Configure database:
   - Modify the bd.js file in the lib directory with your database informations

5. Start the application:
   ```bash
   npm start
   ```

## Usage
After starting the application, navigate to `http://localhost:3000` in your web browser. You can access different dashboards based on your user role:
- Admin: `/admin`
- Donor: `/donneur`
- Nurse: `/infirmier`
- Doctor: `/medecin`
- Assistant: `/assistant`

## Project Structure

```
sang_v/
├── bin/                          # Contains the entry point for the application
│   └── www                       # Application server configuration
├── lib/                          # Library files
│   └── db.js                     # Database connection logic
├── middlewares/                  # Middleware functions
│   └── roles.js                  # Role-based access control middleware
├── public/                       # Static files
│   ├── images/                   # Image assets
│   └── stylesheets/              # CSS stylesheets
├── routes/                       # Route handlers
│   ├── admin.js                  # Admin-related routes
│   ├── assistant.js              # Assistant-related routes
│   ├── donneur.js                # Donor-related routes
│   ├── infirmier.js              # Nurse-related routes
│   ├── medecin.js                # Doctor-related routes
│   ├── login.js                  # Login routes
│   ├── registration.js           # Registration routes
│   └── responsable.js            # Responsible personnel routes
├── views/                        # EJS template views
│   ├── admin/                    # Admin views
│   ├── assistant/                # Assistant views
│   ├── donneur/                  # Donor views
│   ├── infirmier/                # Nurse views
│   ├── medecin/                  # Doctor views
│   ├── responsable/              # Responsible personnel views
│   ├── accueil.ejs               # Home page view
│   ├── index.ejs                 # Main index view
│   └── error.ejs                 # Error handling view
├── app.js                        # Main application file
├── database.sql                  # SQL script for database setup
├── package.json                  # Project metadata and dependencies
└── README.md                     # Project documentation
```

### Explanation of Main Directories and Files
- **bin/**: Contains the entry point for the application.
- **lib/**: Contains library files such as database connection logic.
- **middlewares/**: Contains middleware functions for role-based access control.
- **public/**: Contains static assets like images and stylesheets.
- **routes/**: Contains route handlers for different user roles.
- **views/**: Contains EJS template files for rendering HTML views.
- **app.js**: The main application file that initializes the server and middleware.
- **database.sql**: SQL script to set up the initial database schema.

## Contributing
We welcome contributions to the Sang_v project! If you'd like to contribute, please fork the repository, create a new branch, and submit a pull request. Ensure your code is well-documented and follows the project's coding standards. 

Thank you for your interest in contributing to Sang_v!
