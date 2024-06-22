const express = require("express");
const search = express.Router();
const pool = require("./db");

search.post("/", async (req, res) => {
  let conn;
  const b_title = req.body.b_title;

  try {
    conn = await pool.getConnection();
    const b_titleQuery = "SELECT * FROM books WHERE b_title LIKE ?";
    const rows = await conn.query(b_titleQuery, [`%${b_title}%`]);
    if (rows.length > 0) {
      const books = []; // 결과를 저장할 빈 배열
      for (const row of rows) {
        const book = {
          b_num: row.b_num,
          b_writer: row.b_writer,
          b_info: row.b_info,
          b_title: row.b_title,
          b_publish: row.b_publish,
          b_amount: row.b_amount,
          b_image: row.b_image,
        };
        books.push(book); // 결과 배열에 책 정보 추가
      }
      console.log(books);
      res.json(books);
    } else {
      console.log("결과값이 없다.");
      res.send({ isFalse: 1 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  } finally {
    if (conn) conn.release();
  }
});

search.post("/search_Notice", async (req, res) => {
  let conn;
  const title = req.body.title;
  try {
    conn = await pool.getConnection();
    const titleQuery = "SELECT * FROM notice WHERE title LIKE ?";
    const rows = await conn.query(titleQuery, [`%${title}%`]);
    console.log(rows);
    if (rows.length > 0) {
      const notices = [];
      for (const row of rows) {
        const notice = {
          noti_num: row.noti_num,
          title: row.title,
          contents: row.contents,
          Manager_name: row.Manager_name,
          date: formatDate(row.date),
          count: row.count,
          Manager_id: row.Manager_id,
        };
        notices.push(notice);
      }
      res.json(notices);
      //  res.json(rows);
    } else {
      console.log("결과값이 없다.");
      res.send({ isFalse: 1 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  } finally {
    if (conn) conn.release();
  }
});

search.post("/join_Member", async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id,member_id, name, signup_date, gender, birthdate, email, hp, penalty_count,admin_a FROM member_join"
    );
    if (rows.length > 0) {
      const join_members = []; // 결과를 저장할 빈 배열
      for (const row of rows) {
        const join_member = {
          num: row.id,
          member_id: row.member_id,
          name: row.name,
          signup_date: formatDate(row.signup_date),
          gender: row.gender,
          birthdate: formatDate(row.birthdate),
          email: row.email,
          penalty_count: row.penalty_count,
          hp: row.hp,
          admin_a: row.admin_a,
        };
        join_members.push(join_member);
      }
      res.json(join_members);
    } else {
      console.log("결과값이 없다.");
      res.send({ isFalse: 1 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  } finally {
    if (conn) conn.release();
  }
});

search.post("/search_Member", async (req, res) => {
  let conn;
  const name = req.body.name;
  const member_id = req.body.member_id;
  console.log(member_id);
  try {
    conn = await pool.getConnection();
    let rows;

    if (member_id) {
      console.log(member_id);
      const idQuery = "SELECT * FROM member_join WHERE member_id = ?";
      rows = await conn.query(idQuery, [member_id]);
      console.log(rows);
    } else if (name) {
      const nameQuery = "SELECT * FROM member_join WHERE name LIKE ?";
      rows = await conn.query(nameQuery, [`%${name}%`]);
      console.log(rows);
    }
    console.log(rows);
    if (rows.length > 0) {
      const join_members = [];
      for (const row of rows) {
        const join_member = {
          num: row.id,
          member_id: row.member_id,
          name: row.name,
          signup_date: formatDate(row.signup_date),
          gender: row.gender,
          birthdate: formatDate(row.birthdate),
          email: row.email,
          penalty_count: row.penalty_count,
          hp: row.hp,
          admin_a: row.admin_a,
          loan_count: row.loan_count,
        };
        join_members.push(join_member);
      }
      res.json(join_members);
      //  res.json(rows);
    } else {
      console.log("결과값이 없다.");
      res.send({ isFalse: 1 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  } finally {
    if (conn) conn.release();
  }
});

function formatDate(date) {
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

module.exports = search;
