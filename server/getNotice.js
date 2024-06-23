const express = require("express");
const getNotice = express.Router();
const pool = require("./db");

getNotice.post("/", async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT noti_num, title, contents, Manager_name, date ,Manager_id, count FROM notice");
    if (rows.length > 0) {
      const notices = []; // 결과를 저장할 빈 배열
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
      console.log(notices);
      res.json(notices);
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

getNotice.post("/addNotice", async (req, res) => {
  let conn;
  const { title, contents, Manager_name, date, count, Manager_id } = req.body;
  console.log(title + contents + Manager_id);

  try {
    conn = await pool.getConnection();
    const query = `INSERT INTO notice (title, contents, Manager_name, date, count, Manager_id) VALUES (?,?,?,?,?,?)`;
    await conn.query(query, [title, contents, Manager_name, date, count, Manager_id]);
    const resQuery =
      "SELECT noti_num FROM notice WHERE title = ? AND contents = ?  AND Manager_name = ? AND date = ? AND count = ? AND Manager_id = ?";
    const find = await conn.query(resQuery, [title, contents, Manager_name, date, count, Manager_id]);

    console.log(find);
    console.log("데이터베이스에 값이 성공적으로 삽입되었습니다.");
    res.send(find);
  } catch (error) {
    console.error("쿼리 실행 오류:", error);
    res.send("데이터베이스 오류");
  } finally {
    if (conn) {
      conn.release();
    }
  }
});

getNotice.post("/fixNotice", async (req, res) => {
  let conn;
  const { noti_num, title, contents, date, Manager_id } = req.body;
  console.log("실행");
  const isManager = await check_Manager(Manager_id, noti_num);
  console.log(isManager);
  if (isManager == 1) {
    console.log("글쓴이가 아닙니다. 권한없음.");
    res.send({ isFalse: 1 });
    return;
  }
  //맞는지 확인되었다면,본격적인 교체작업 진행.
  try {
    conn = await pool.getConnection();

    const query = "UPDATE notice SET title = ?, contents = ?, date= ? WHERE noti_num = ?";
    await conn.query(query, [title, contents, date, noti_num]);
    console.log("데이터베이스에 값이 성공적으로 교체되었습니다.");
    res.status(200).send({ title });
  } catch (error) {
    console.error("쿼리 실행 오류:", error);
  } finally {
    if (conn) {
      conn.release();
    }
  }
});
//글쓴이가 맞는지 체크
async function check_Manager(id, num) {
  const conn = await pool.getConnection();
  var isManager = 0;
  try {
    const query = "SELECT Manager_id FROM notice WHERE noti_num = ?";
    const row = await conn.query(query, num);

    if (row.length > 0) {
      const Manager_id = row[0].Manager_id;
      console.log(Manager_id);
      if (Manager_id == id) {
        console.log("일치합니다");
      } else {
        console.log("일치하지않습니다");
        isManager = 1;
      }
    } else {
      res.status(401).json({ message: "잘못된 증명서" });
    }
    return isManager;
  } catch (error) {
    console.error("쿼리 실행 오류:", error);
  }

  const query = "SELECT Manager_id FROM notice WHERE noti_num = ?";
  const row = await conn.query(query, num);

  console.log(row);
  console.log(id);
  if (row.length > 0) {
    const Manager_id = row[0];
    console.log(Manager_id);
    if (Manager_id == id) {
      console.log("일치합니다");
      return isManager;
    } else {
      console.log("일치하지않습니다");
      isManager = 1;
      console.log(isManager);
      return isManager;
    }
  } else {
    res.status(401).json({ message: "잘못된 증명서" });
  }
}
getNotice.post("/deletenotice", async (req, res) => {
  const { noti_num } = req.body;
  let conn;

  try {
    conn = await pool.getConnection();

    // DELETE 쿼리 실행
    const deleteQuery = "DELETE FROM notice WHERE noti_num = ?";
    await conn.query(deleteQuery, noti_num);

    res.send(`책 번호 ${noti_num}이(가) 삭제되었습니다.`);
  } catch (error) {
    console.error("쿼리 실행 오류:", error);
    res.status(500).send("서버 오류 발생");
  } finally {
    if (conn) {
      conn.release();
    }
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

module.exports = getNotice;
