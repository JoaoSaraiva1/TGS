const express = require("express");
const json = require("express");
const bodyParser = require("body-parser");
const pool = require("./db");

const app = express();

app.use(json());

// GET all users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    const users = result.rows;
    res.send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

// GET a specific user
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM users WHERE uuid = $1", [
      id,
    ]);
    const user = result.rows[0];

    res.send(user).status(200);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Error fetching user");
  }
});

// POST a new user
app.post("/newUser", async (req, res) => {
  const { username, password, email } = req.body;
  const id = uuidv4();

  try {
    await pool.query(
      "INSERT INTO users (id, username, password, email) VALUES ($1, $2, $3, $4)",
      [id, username, password, email]
    );
    res.send({ id });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Error creating user");
  }
});

// PUT (update) an existing user
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password, email } = req.body;

  try {
    await pool.query(
      "UPDATE users SET username = $1, password = $2, email = $3 WHERE id = $4",
      [username, password, email, id]
    );
    res.send(`User with id ${id} updated`);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Error updating user");
  }
});

// DELETE an existing user
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.send(`User with id ${id} deleted`);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Error deleting user");
  }
});

//GET the plantations associated with the user
app.get("/users/:userId/plantations", async (req, res) => {
  const { userId } = req.params;
  const { user } = req;

  // Check if the authenticated user has access to the requested user's data
  if (user.id !== userId) {
    res.status(403).send("Access denied");
    return;
  }

  try {
    const result = await pool.query(
      "SELECT * FROM plantations WHERE user_id = $1",
      [userId]
    );
    const plantations = result.rows;
    res.send(plantations);
  } catch (error) {
    console.error("Error fetching plantations:", error);
    res.status(500).send("Error fetching plantations");
  }
});

// POST a new plantation
app.post("/newPlantation", async (req, res) => {
  try {
    const {
      user_id,
      autowatering,
      healthy,
      name,
      active_notifications,
      readings,
    } = req.body;

    const query =
      "INSERT INTO plantations (user_id, autowatering, healthy, name, active_notifications, readings) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
    const values = [
      user_id,
      autowatering,
      healthy,
      name,
      active_notifications,
      readings,
    ];

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating plantation:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the plantation." });
  }
});

//GET a specific plantation
app.get("/plantations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = "SELECT * FROM plantations WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Plantation not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error retrieving plantation:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the plantation." });
  }
});

//UPDATE a specific plantation
app.put("/plantations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { autowatering, healthy, name, active_notifications, readings } =
      req.body;

    const query =
      "UPDATE plantations SET autowatering = $1, healthy = $2, name = $3, active_notifications = $4, readings = $5 WHERE id = $6 RETURNING *";
    const values = [
      autowatering,
      healthy,
      name,
      active_notifications,
      readings,
      id,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Plantation not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating plantation:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the plantation." });
  }
});

//DELETE a specific plantation by id
app.delete("/plantations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = "DELETE FROM plantations WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Plantation not found." });
    }

    res.json({ message: "Plantation deleted successfully." });
  } catch (error) {
    console.error("Error deleting plantation:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the plantation." });
  }
});

//POST a new plantation and associated reading
app.post("/plantations", async (req, res) => {
  try {
    const {
      user_id,
      autowatering,
      healthy,
      name,
      active_notifications,
      readings,
    } = req.body;

    const createPlantationQuery =
      "INSERT INTO plantations (user_id, autowatering, healthy, name, active_notifications) VALUES ($1, $2, $3, $4, $5) RETURNING id";
    const plantationValues = [
      user_id,
      autowatering,
      healthy,
      name,
      active_notifications,
    ];

    const plantationResult = await pool.query(
      createPlantationQuery,
      plantationValues
    );
    const plantationId = plantationResult.rows[0].id;

    const { humidity, light, moisture, temperature } = readings;

    const createReadingQuery =
      "INSERT INTO readings (plantation_id, humidity, light, moisture, temperature) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const readingValues = [
      plantationId,
      humidity,
      light,
      moisture,
      temperature,
    ];

    const readingResult = await pool.query(createReadingQuery, readingValues);

    res.json({
      plantation: plantationResult.rows[0],
      reading: readingResult.rows[0],
    });
  } catch (error) {
    console.error("Error creating plantation and reading:", error);
    res.status(500).json({
      error: "An error occurred while creating the plantation and reading.",
    });
  }
});

//GET all readings for a specific plantation
app.get("/plantations/:id/readings", async (req, res) => {
  try {
    const { id } = req.params;

    const query = "SELECT * FROM readings WHERE plantation_id = $1";
    const result = await pool.query(query, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving readings:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the readings." });
  }
});

//GET the readings between a certain interval of time
app.get("/plantations/:id/readings", async (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time } = req.query;

    const query =
      "SELECT * FROM readings WHERE plantation_id = $1 AND timestamp >= $2 AND timestamp <= $3";
    const result = await pool.query(query, [id, start_time, end_time]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving readings:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the readings." });
  }
});

//POST data from the readings received from the sensor's
app.post("/readings", async (req, res) => {
  try {
    const { plantation_id, humidity, light, moisture, temperature, timestamp } =
      req.body;

    const query =
      "INSERT INTO readings (plantation_id, humidity, light, moisture, temperature, timestamp) VALUES ($1, $2, $3, $4, $5, $6)";
    const values = [
      plantation_id,
      humidity,
      light,
      moisture,
      temperature,
      timestamp,
    ];

    await pool.query(query, values);

    res.status(200).json({ message: "Reading data inserted successfully" });
  } catch (error) {
    console.error("Error inserting reading data:", error);
    res.status(500).json({ error: "Failed to insert reading data" });
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});