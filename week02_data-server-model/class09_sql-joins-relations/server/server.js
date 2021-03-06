const express = require('express');
const app = express();
const morgan = require('morgan');
const client = require('./db-client');

// enhanced logging
app.use(morgan('dev'));

// register the json "middleware" body parser
app.use(express.json());

/* Defined routes: METHOD, URL PATH */
// method == app.<method>
// path = app.get('/this/is/path', ...)

app.get('/api/tracks', (req, res) => {
  client.query(`
    SELECT id, name, short_name as "shortName"
    FROM track
    ORDER BY name;
  `)
    .then(result => {
      res.json(result.rows);
    });
});


app.get('/api/students', (req, res) => {
  client.query(`
    SELECT 
      student.id, 
      student.name as name,
      start_date as "startDate",
      track.id as "trackId",  
      track.name as track
    FROM student
    JOIN track
    ON student.track_id = track.id
    ORDER BY start_date DESC, name ASC;
  `)
    .then(result => {
      res.json(result.rows);
    });
});

app.get('/api/students/:id', (req, res) => {
  client.query(`
    SELECT * FROM student WHERE id = $1;
  `,
  [req.params.id])
    .then(result => {
      res.json(result.rows[0]);
    });
});

app.post('/api/students', (req, res) => {
  const body = req.body;

  client.query(`
    INSERT INTO student (name, track_id, start_date)
    VALUES($1, $2, $3)
    RETURNING id;
  `,
  [body.name, body.trackId, body.startDate])
    .then(result => {
      const id = result.rows[0].id;
      
      return client.query(`
        SELECT 
          student.id, 
          student.name as name,
          start_date as "startDate",
          track.id as "trackId",  
          track.name as track
        FROM student
        JOIN track
        ON student.track_id = track.id 
        WHERE student.id = $1;
      `,
      [id]);
    })
    .then(result => {
      res.json(result.rows[0]);
    });
});

/* end defined routes */

/* configure and start the server */
const PORT = 3000;

app.listen(PORT, () => {
  console.log('server app started on port', PORT);
});

/* end configure and server start */