const express = require("express");
const sign_up = express.Router();
const pool = require("./db");

sign_up.post("/", async (req, res) => {
  const { member_id, password, name, gender, birthdate, email, hp } = req.body;
  const signup_date = new Date();
  let conn;
  try {
    conn = await pool.getConnection();

    const query = `INSERT INTO member_join (member_id, password, name, gender, birthdate, email, hp, signup_date) VALUES (?,?,?,?,?,?,?,?)`;

    await conn.query(query, [member_id, password, name, gender, birthdate, email, hp, signup_date]);

    console.log("데이터베이스에 값이 성공적으로 삽입되었습니다.");
    res.send(`<script> alert("${name}님 회원가입에 성공하셨습니다"); 
    window.location.href = 'Login.html';
    </script>`);
  } catch (e) {
    console.error("쿼리 실행 오류:", e);
    res.send("데이터베이스 오류");
  } finally {
    // 연결 해제
    if (conn) {
      conn.release();
    }
  }
});

async function checkDuplicateId(member_id) {
  let conn;
  try {
    console.log(member_id);
    conn = await pool.getConnection();
    const idQuery = "SELECT member_id FROM member_join WHERE member_id = ?";
    console.log(await conn.query(idQuery, [member_id]));
    const [idResult] = await conn.query(idQuery, [member_id]);
    if (idResult) {
      console.log("중복이 있습니다", idResult);
      return false;
    } else {
      console.log("중복이 없습니다.");
      return true;
    }
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}
async function checkDuplicateEmail(email) {
  let conn;
  try {
    conn = await pool.getConnection();
    const emailQuery = "SELECT email FROM member_join WHERE email = ?";
    const [email1] = await conn.query(emailQuery, [email]);
    if (email1) {
      console.log("중복이 있습니다", email1);
      return false;
    } else {
      console.log("중복이 없습니다.");
      return true;
    }
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

sign_up.post("/check-duplicate-id", async (req, res) => {
  const { member_id } = req.body;

  try {
    const nameExists = await checkDuplicateId(member_id);

    if (nameExists === false) {
      res.json({ status: "error", message: "name is already taken" });
    } else {
      res.json({ status: "success", message: "name is available" });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

sign_up.post("/check-duplicate-email", async (req, res) => {
  const { email } = req.body;

  try {
    const emailExists = await checkDuplicateEmail(email);
    console.log(emailExists);
    if (emailExists === false) {
      res.json({ status: "error", message: "Email is already taken" });
    } else {
      res.json({ status: "success", message: "Email is available" });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

sign_up.post("/change_admin", async (req, res) => {
  const { member_id } = req.body;
  let conn;

  try {
    conn = await pool.getConnection();

    const query = "UPDATE member_join SET admin_a = 1 WHERE member_id = ?";
    await conn.query(query, member_id);
    console.log("관리자로 변경 성공.");
    res.send();
  } catch (error) {
    console.error("쿼리 실행 오류", error);
  } finally {
    if (conn) {
      conn.release();
    }
  }
});
sign_up.post("/delete_member", async (req, res) => {
  const { member_id } = req.body;
  let conn;

  try {
    conn = await pool.getConnection();

    const query = "DELETE FROM member_join WHERE member_id = ?";
    await conn.query(query, member_id);
    console.log("삭제성공");
    res.send();
  } catch (error) {
    console.error("쿼리 실행 오류", error);
  } finally {
    if (conn) {
      conn.release();
    }
  }
});

module.exports = sign_up;
