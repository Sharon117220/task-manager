const express = require("express");
const router = express.Router();
const controller = require("../controllers/taskController");
const auth = require('../middleware/authMiddleware');

router.get("/", auth, controller.getAllTasks);
router.get("/:id", auth, controller.getTaskById);
router.post("/", auth, controller.createTask);
router.put("/:id", auth, controller.updateTask);
router.delete("/:id", auth, controller.deleteTask);

module.exports = router;
