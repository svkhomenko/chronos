# Chronos

A service for meetings, tasks or events organization.

## Installation

1. Clone project 
    ```sh
    git clone git@gitlab.ucode.world:connect-khpi/connect-fullstack-chronos/skhomenko.git
    ```
## Server
2. In the server folder run
    ```sh
    npm install
    ```
3. Create database
    for Linux
    ```sh
    mysql -u root -p < db_init.sql
    ```
    for Windows in MySQL Shell
    ```sh
    source <path_for_root_of_project>\db_init.sql
    ```
4. Update file .env with your data
5. Run the server
    ```sh
    node server.js
    ```
## Client
6. In the client folder run
    ```sh
    npm install
    ```
7. Run the client
    ```sh
    npm start
    ```
    or
    Build the app for production to the build folder.
    ```sh
    npm run build
    ```  
8. Go to [http://localhost:8080](http://localhost:8080)

*The app has been tested on Windows. Linux may require additional settings*

## Tech

Chronos uses a number of open source projects to work properly:

- [Node.js](https://nodejs.org/en/) - evented I/O for the backend
- [Express](https://expressjs.com/) - fast node.js network app framework 
- [MySQL](https://www.mysql.com/) - open-source relational database management system 
- [Sequelize](https://sequelize.org/) - modern TypeScript and Node.js ORM for Oracle, Postgres, MySQL, MariaDB, SQLite and SQL Server, and more
- [webpack](https://webpack.js.org/) - static module bundler for modern JavaScript applications
- [Babel](https://babeljs.io/) - a JavaScript compiler
- [React](https://reactjs.org/) - a JavaScript library for building user interfaces
- [React Router](https://reactrouter.com/en/main) - bindings for using React Router in web applications
- [Redux](https://redux.js.org/) - a predictable state container for JS apps

