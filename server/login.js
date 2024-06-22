const express = require("express");
const login = express.Router();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const pool = require("./db");

login.use(bodyParser.json());

const JWT_SECRET = "test_key"; // 임시 비밀 키

login.post("/", async (req, res) => {
  const { id, password } = req.body;
  try {
    const conn = await pool.getConnection();

    const query = "SELECT * FROM member_join WHERE member_id = ? AND password = ?";
    const rows = await conn.query(query, [id, password]);

    if (rows.length > 0) {
      const user = rows[0];
      const token = jwt.sign({ id: user.member_id, name: user.name, admin: user.admin_a }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ token });
    } else {
      res.status(401).json({ message: "잘못된 증명서" });
    }
    conn.release();
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

login.post("/verify", (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  if (!token) {
    return res.status(401).json({ valid: false, message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ valid: false, message: "Failed to authenticate token" });
    }
    // 토큰 만료가 임박하면 새로운 토큰 발급
    const now = Math.floor(Date.now() / 1000);
    const expiration = decoded.exp;
    const timeToExpire = expiration - now;

    if (timeToExpire < 30 * 60) {
      // 30분 이내로 만료될 경우
      console.log("만료얼마안남음");
      const newToken = jwt.sign({ id: decoded.id, admin: decoded.admin, name: decoded.name }, JWT_SECRET, { expiresIn: "1h" });
      return res.json({ valid: true, id: decoded.id, admin: decoded.admin, token: newToken });
    }
    res.json({ valid: true, id: decoded.id, admin: decoded.admin, name: decoded.name });
  });
});
module.exports = login;
