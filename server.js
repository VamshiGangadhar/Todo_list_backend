const express = require("express");
const cors = require("cors");
const app = express();
const env = require("dotenv").config();

// const { query } = require("./pool");

app.use(cors());
app.use(express.json());

const PORT = process.env.DB_PORT;

app.listen(PORT, () => {
  console.log(`Server is running in the port (${PORT})`);
});

const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

app.get("/", async (req, res) => {
  try {
    const result = await pool.query({
      text: "SELECT * FROM public.todo_list ORDER BY id",
    });

    return res.status(200).json({
      message: "Found tasks",
      tasks: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});
app.post("/", async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({
        message: "Task is required",
      });
    }
    const result = await pool.query({
      text: `INSERT INTO public.todo_list (task) VALUES ($1) RETURNING *`,
      values: [task],
    });
    return res.status(200).json({
      message: "Task added",
      task: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        message: "Id is required",
      });
    }
    const result = await pool.query({
      text: `DELETE FROM public.todo_list WHERE id = $1 RETURNING *`,
      values: [id],
    });
    return res.status(200).json({
      message: "Task deleted",
      task: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

app.put("/", async (req, res) => {
  try {
    const id = req.body.id;
    const task = req.body.task;
    if (!id || !task) {
      return res.status(400).json({
        message: "Id and task are required",
      });
    }
    const checkAvailableTask = await pool.query({
      text: `SELECT * FROM public.todo_list WHERE id = $1`,
      values: [id],
    });
    if (!checkAvailableTask.rows.length) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    const result = await pool.query({
      text: `UPDATE public.todo_list SET task = $1 WHERE id = $2 RETURNING *`,
      values: [task, id],
    });
    return res.status(200).json({
      message: "Task updated",
      task: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

app.get("/message", (req, res) => {
  res.status(200).json({
    message: "Hello from server",
  });
});
