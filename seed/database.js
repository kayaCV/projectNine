'use strict';

const bcryptjs = require('bcryptjs');
const Context = require('./context');

class Database {
  constructor(seedData, enableLogging) {
    this.courses = seedData.courses;
    this.users = seedData.users;
    this.enableLogging = enableLogging;
    this.context = new Context('fsjstd-restapi.db', enableLogging);
  }

  log(message) {
    if (this.enableLogging) {
      console.info(message);
    }
  }

  tableExists(tableName) {
    this.log(`Checking if the ${tableName} table exists...`);

    return this.context
      .retrieveValue(`
        SELECT EXISTS (
          SELECT 1 
          FROM sqlite_master 
          WHERE type = 'table' AND name = ?
        );
      `, tableName);
  }

  // method to retrieve all courses
  returnCourses() {
    this.log(`Getting list of courses...`);
    return this.context
      .retrieve(`
        SELECT title, Users.firstName || " " || Users.lastName As user
        FROM Courses
        INNER JOIN Users
        ON Courses.userId = Users.id
      `);
  }

  // method to retrieve single course
  returnSingleCourse(course) {
    this.log(`Getting single course...`);
    this.log(course.id  + '-- from courses database.js');
    return this.context
      .retrieveSingle(`
        SELECT title, Users.firstName || " " || Users.lastName As user
        FROM Courses 
        INNER JOIN Users
        ON Courses.userId = Users.id
        WHERE Courses.id = ?
      `, course.id);  
  }

  // method to return last entry id
  lastCourseId() {
    this.log("retrieving last entry id");
    return this.context
      .retrieveSingle(`   
      SELECT last_insert_rowid() AS id;
      `);
  }

  // method to update a course
  updateCourse(course) {
    this.log(course.userId);
    this.log("Updating course");
    return this.context
      .execute( `
      UPDATE Courses
      SET userId = ?, title = ?, description = ?, estimatedTime = ?, materialsNeeded = ?, updatedAt = datetime('now')
      WHERE Courses.id = ?
      `, 
        course.userId,
        course.title,
        course.description,
        course.estimatedTime,
        course.materialsNeeded,
        course.id
        )
  }

  // method to delete a course
  deleteCourse(course) {
    return this.context
      .execute(`
      DELETE FROM Courses
      WHERE id = ?
      `,
      course.id
      )
  }

  // method to retrieve all users
  allUsers() {
    this.log(`Getting list of users...`);
    return this.context
      .retrieve(`
      SELECT emailAddress, password
      FROM Users
      `
    )
  }

  // method to return single user by email
  singleUser(email) {
    return this.context
      .retrieveSingle(`
        SELECT emailAddress
        FROM Users 
        WHERE Users.emailAddress = ?
      `, email);  
  }

  createUser(user) {
    return this.context
      .execute(`
        INSERT INTO Users
          (firstName, lastName, emailAddress, password, createdAt, updatedAt)
        VALUES
          (?, ?, ?, ?, datetime('now'), datetime('now'));
      `,
      user.firstName,
      user.lastName,
      user.emailAddress,
      user.password);
  }

  createCourse(course) {
    return this.context
      .execute(`
        INSERT INTO Courses
          (userId, title, description, estimatedTime, materialsNeeded, createdAt, updatedAt)
        VALUES
          (?, ?, ?, ?, ?, datetime('now'), datetime('now'));
      `,
      course.userId,
      course.title,
      course.description,
      course.estimatedTime,
      course.materialsNeeded);
    
  }

  async hashUserPasswords(users) {
    const usersWithHashedPasswords = [];

    for (const user of users) {
      const hashedPassword = await bcryptjs.hash(user.password, 10);
      usersWithHashedPasswords.push({ ...user, password: hashedPassword });
    }

    return usersWithHashedPasswords;
  }

  async createUsers(users) {
    for (const user of users) {
      await this.createUser(user);
    }
  }

  async createCourses(courses) {
    for (const course of courses) {
      await this.createCourse(course);
    }
  }

  async init() {
    const userTableExists = await this.tableExists('Users');

    if (userTableExists) {
      this.log('Dropping the Users table...');

      await this.context.execute(`
        DROP TABLE IF EXISTS Users;
      `);
    }

    this.log('Creating the Users table...');

    await this.context.execute(`
      CREATE TABLE Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        firstName VARCHAR(255) NOT NULL DEFAULT '', 
        lastName VARCHAR(255) NOT NULL DEFAULT '', 
        emailAddress VARCHAR(255) NOT NULL DEFAULT '' UNIQUE, 
        password VARCHAR(255) NOT NULL DEFAULT '', 
        createdAt DATETIME NOT NULL, 
        updatedAt DATETIME NOT NULL
      );
    `);

    this.log('Hashing the user passwords...');

    const users = await this.hashUserPasswords(this.users);

    this.log('Creating the user records...');

    await this.createUsers(users);

    const courseTableExists = await this.tableExists('Courses');

    if (courseTableExists) {
      this.log('Dropping the Courses table...');

      await this.context.execute(`
        DROP TABLE IF EXISTS Courses;
      `);
    }

    this.log('Creating the Courses table...');

    await this.context.execute(`
      CREATE TABLE Courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        title VARCHAR(255) NOT NULL DEFAULT '', 
        description TEXT NOT NULL DEFAULT '', 
        estimatedTime VARCHAR(255), 
        materialsNeeded VARCHAR(255), 
        createdAt DATETIME NOT NULL, 
        updatedAt DATETIME NOT NULL, 
        userId INTEGER NOT NULL DEFAULT -1 
          REFERENCES Users (id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    this.log('Creating the course records...');

    await this.createCourses(this.courses);

    this.log('Database successfully initialized!');
  }
}

module.exports = Database;
