const express = require("express");
const sign_up = express.Router();
const pool = require("./db");

//회원가입 폼의 엔드포인트로 회원가입 메서드
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

//받은 id값을 중복검사 메서드
sign_up.post("/check-duplicate-id", async (req, res) => {
  const { member_id } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const idQuery = "SELECT member_id FROM member_join WHERE member_id = ?";
    const idResult = await conn.query(idQuery, [member_id]);
    if (idResult.length > 0) {
      res.json({ status: "error", message: "name is already taken" });
    } else {
      res.json({ status: "success", message: "name is available" });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});
//받은 email값을 중복검사 메서드
sign_up.post("/check-duplicate-email", async (req, res) => {
  const { email } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const emailQuery = "SELECT email FROM member_join WHERE email = ?";
    const email1 = await conn.query(emailQuery, [email]);
    if (email1.length > 0) {
      res.json({ status: "error", message: "Email is already taken" });
    } else {
      res.json({ status: "success", message: "Email is available" });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});
//관리자 권한 변경 메서드
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
//회원 삭제 메서드
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
