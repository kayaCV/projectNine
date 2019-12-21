'use strict';

const express = require('express');
const data = require('./seed/data');
const Database = require('./seed/database');

const enableLogging = process.env.DB_ENABLE_LOGGING === 'true';
const database = new Database(data, enableLogging);


// Construct a router instance.
const router = express.Router();

/* Handler function to wrap each route. */
function asyncHandler(cb){
    return async(req, res, next) => {
      try {
        await cb(req, res, next);
        
      } catch(error){
         res.status(500).send(error);
      }
    }
  }

// Route that returns a list of users. FOR TESTING
router.get('/users', (req, res) => {
    // retrieves a list of user accounts from db and returns it as JSON
    res.json(data.users); 
});

// // Route that returns the currently authenticated user.
// router.get('/users', asyncHandler(async(req, res) => {

// }));

// Route that creates a new user
router.post('/users', async (req, res) => {
    try{
        // Get the user from the request body.
        const user = await database.createUser({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            password: req.body.password
        });
        // Add the user to the database
        res.json(user);
        // Set the status to 201 Created and end the response.
        res.status(201).end();
    } catch(error) {
        res.json({message: error.message});
    }
});


// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
router.get('/courses', asyncHandler(async (req, res)=>{
    const courses = await database.returnCourses();
    res.json(courses);
    res.status(200);   
}));

// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', asyncHandler(async (req, res)=>{
    const course = await database.returnSingleCourse(req.params);
    if(course){
        res.json(course);
    } else {
        res.status(404).json({message: "Course not found."});
    }
}));

// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', async (req, res) => {
    try{
        // Get the user from the request body.
        const course = await database.createCourse({
            userId: req.body.userId,
            title: req.body.title,
            description: req.body.description,
            estimatedTime: req.body.estimatedTime,
            materialsNeeded: req.body.materialsNeeded
        });

        // Add the user to the database
        res.json(course);
        // Set the status to 201 Created and end the response.
        res.status(201).end();
    } catch(error) {
        res.json({message: error.message});
    }
});

// PUT /api/courses/:id 204 - Updates a course and returns no content
// DELETE /api/courses/:id 204 - Deletes a course and returns no content





module.exports = router;