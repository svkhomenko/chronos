# Chronos

A service for meetings, tasks or events organization.

## Demo

[Demo video](https://youtu.be/M6Iiiqkdsec)

## Installation

1. Clone project
   ```sh
   git clone https://github.com/svkhomenko/chronos.git
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
7. Update file client/src/const.js with your data (Google Cloud API key)
8. Run the client
   ```sh
   npm start
   ```
   or
   Build the app for production to the build folder.
   ```sh
   npm run build
   ```
9. Go to [http://localhost:8080](http://localhost:8080)

_The app has been tested on Windows. Linux may require additional settings_

## Tech

Chronos uses a number of open source projects to work properly:

- [Node.js](https://nodejs.org/en/) - evented I/O for the backend
- [Express](https://expressjs.com/) - fast node.js network app framework
- [MySQL](https://www.mysql.com/) - open-source relational database management system
- [Sequelize](https://sequelize.org/) - modern TypeScript and Node.js ORM for Oracle, Postgres, MySQL, MariaDB, SQLite and SQL Server, and more
- [moment](https://momentjs.com/) - parse, validate, manipulate, and display dates and times in JavaScript
- [webpack](https://webpack.js.org/) - static module bundler for modern JavaScript applications
- [Babel](https://babeljs.io/) - a JavaScript compiler
- [React](https://reactjs.org/) - a JavaScript library for building user interfaces
- [React Router](https://reactrouter.com/en/main) - bindings for using React Router in web applications
- [Redux](https://redux.js.org/) - a predictable state container for JS apps
