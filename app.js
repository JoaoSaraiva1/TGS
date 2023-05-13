const express = require('express');
const json = require('express');
const pool = require("./db");

const app = express();

app.use(json());

//CRUD USERS

// GET all users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    const users = result.rows;
    res.send(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
  }
});

// GET a specific user
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM users WHERE uuid = $1', [id]);
    const user = result.rows[0];

    res.send(user).status(200);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Error fetching user');
  }
});

// POST a new user
app.post('/users', async (req, res) => {
  const { username, password, email } = req.body;
  const id = uuidv4();

  try {
    await pool.query('INSERT INTO users (id, username, password, email) VALUES ($1, $2, $3, $4)', [id, username, password, email]);
    res.send({ id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});

// PUT (update) an existing user
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, email } = req.body;

  try {
    await pool.query('UPDATE users SET username = $1, password = $2, email = $3 WHERE id = $4', [username, password, email, id]);
    res.send(`User with id ${id} updated`);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating user');
  }
});

// DELETE an existing user
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.send(`User with id ${id} deleted`);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Error deleting user');
  }
});

app.get('/users/:userId/plantations', async (req, res) => {
  const { userId } = req.params;
  const { user } = req;

  // Check if the authenticated user has access to the requested user's data
  if (user.id !== userId) {
    res.status(403).send('Access denied');
    return;
  }

  try {
    const result = await pool.query('SELECT * FROM plantations WHERE user_id = $1', [userId]);
    const plantations = result.rows;
    res.send(plantations);
  } catch (error) {
    console.error('Error fetching plantations:', error);
    res.status(500).send('Error fetching plantations');
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
