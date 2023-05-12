import express, { json } from "express";
import pool from "./db";

const app = express();

app.use(json());

app.get("/AddUser", async (req, res) => {
  const { username, password, email, deviceToken } = req.body;

  try {
    await pool.query(
      "INSERT INTO users (username, password, email, deviceToken) VALUES ($1, $2, $3, $4) RETURNING id",
      [username, password, email, deviceToken]
    );
    res.status(200);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Error creating user");
  }
});

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

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
