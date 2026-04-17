const router = require("express").Router();
const db = require("../db");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [user] = await db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password]
  );

  if (!user.length) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    id: user[0].id,
    name: user[0].name,
    role: user[0].role
  });
});

module.exports = router;
