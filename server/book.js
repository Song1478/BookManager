const express = require("express");
const book = express.Router();
const pool = require("./db");

//도서 등록 메서드
book.post("/addbook", async (req, res) => {
  let conn;
  const { b_title, b_writer, b_publish, b_info, b_amount } = req.body;

  try {
    conn = await pool.getConnection();
    const query = `INSERT INTO books (b_title, b_writer, b_publish, b_info, b_amount) VALUES (?,?,?,?,?)`;
    await conn.query(query, [b_title, b_writer, b_publish, b_info, b_amount]);
    const resQuery =
      "SELECT b_num FROM books WHERE b_title = ? AND b_writer = ?  AND b_publish = ? AND b_info = ? AND b_amount = ? ";
    const find = await conn.query(resQuery, [b_title, b_writer, b_publish, b_info, b_amount]);

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
//도서 수정 메서드
book.post("/fixbook", async (req, res) => {
  let conn;
  const { b_num, b_title, b_writer, b_publish, b_info, b_amount } = req.body;

  try {
    conn = await pool.getConnection();
    const query = "UPDATE books SET b_title = ?, b_writer = ?, b_publish= ?, b_info= ?, b_amount= ? WHERE b_num = ?";
    await conn.query(query, [b_title, b_writer, b_publish, b_info, b_amount, b_num]);

    const resQuery = "SELECT b_amount FROM books WHERE b_num = ? ";
    const find = await conn.query(resQuery, [b_num]);

    console.log("데이터베이스에 값이 성공적으로 교체되었습니다.");
    console.log(find);
    res.send("수정완료");
  } catch (error) {
    console.error("쿼리 실행 오류:", error);
  } finally {
    if (conn) {
      conn.release();
    }
  }
});
//도서 삭제 메서드
book.post("/deletebook", async (req, res) => {
  const { b_num } = req.body;
  let conn;

  try {
    conn = await pool.getConnection();

    // DELETE 쿼리 실행
    const deleteQuery = "DELETE FROM books WHERE b_num = ?";
    await conn.query(deleteQuery, b_num);

    res.send(`책 번호 ${b_num}이(가) 삭제되었습니다.`);
  } catch (error) {
    console.error("쿼리 실행 오류:", error);
    res.status(500).send("서버 오류 발생");
  } finally {
    if (conn) {
      conn.release();
    }
  }
});

module.exports = book;
