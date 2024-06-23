const express = require("express");
const loan = express.Router();
const pool = require("./db");
//도서 대여 메서드
loan.post("/", async (req, res) => {
  let conn;
  const member_id = req.body.member_id;
  const b_num = req.body.b_num;
  const b_title = req.body.b_title;
  const loan_date = new Date();
  try {
    conn = await pool.getConnection();
    //중복도서 검색
    const checkDuplicateQuery = `
      SELECT * FROM book_loan
      WHERE user_id = ? AND b_num = ?;
    `;
    const rows = await conn.query(checkDuplicateQuery, [member_id, b_num]);

    if (rows.length > 0) {
      // 중복 도서 대출 시 오류 반환
      return res.send({ isFalse: 1 });
    }

    //loan_count증가
    const updateMemberQuery = `
    UPDATE member_join
    SET loan_count = loan_count + 1
    WHERE member_id = ?;
  `;
    //책 재고수량 감소
    const updateBookQuery = `
      UPDATE books
      SET b_amount = b_amount - 1
      WHERE b_num = ?;
    `;
    //대출테이블에 기록
    const insertLoanQuery = `
    INSERT INTO book_loan (user_id, b_num, b_title, s_date, e_date)
    VALUES (?, ?, ?, ?, ?);
  `;
    const s_date = loan_date.toISOString().split("T")[0];
    const e_date = new Date(loan_date);
    e_date.setDate(loan_date.getDate() + 7); // 7일 추가
    const e_dateFormatted = e_date.toISOString().split("T")[0];

    await conn.query(updateMemberQuery, [member_id]);
    await conn.query(updateBookQuery, [b_num]);
    await conn.query(insertLoanQuery, [member_id, b_num, b_title, s_date, e_dateFormatted]);
    res.status(200).send({ s_date, e_dateFormatted, member_id });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  } finally {
    if (conn) conn.release();
  }
});
//도서 반납 메서드
loan.post("/return_book", async (req, res) => {
  const id = req.body.id;
  const b_num = req.body.b_num;
  const e_date = req.body.e_date;
  const currentDate = new Date();
  const currentDate_Format = formatDate(currentDate);
  let conn;
  try {
    conn = await pool.getConnection();

    // book_loan 테이블에서 행 삭제
    const deleteLoanQuery = `
        DELETE FROM book_loan
        WHERE user_id = ? AND b_num = ?;
        `;
    // member_join 테이블에서 loan_count 감소
    const updateMemberQuery = `
        UPDATE member_join
        SET loan_count = loan_count - 1
        WHERE member_id = ?;
        `;
    // books 테이블에서 b_amount 증가
    const updateBookQuery = `
        UPDATE books
        SET b_amount = b_amount + 1
        WHERE b_num = ?;
         `;
    if (e_date < currentDate_Format) {
      // penalty_count 증가
      const updatePenaltyQuery = `
        UPDATE member_join
        SET penalty_count = penalty_count + 1
        WHERE member_id = ?;
        `;
      await conn.query(updatePenaltyQuery, [id]);
    }

    await conn.query(deleteLoanQuery, [id, b_num]);
    await conn.query(updateMemberQuery, [id]);
    await conn.query(updateBookQuery, [b_num]);
    res.status(200).send("반납이 성공적으로 처리되었습니다");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  } finally {
    if (conn) conn.release();
  }
});
//대여기록 보내는 메서드
loan.post("/search_return", async (req, res) => {
  const member_id = req.body.member_id;
  let conn;
  try {
    conn = await pool.getConnection();

    const wrongid_checkQuery = `
    SELECT * FROM member_join
    WHERE member_id = ?;
  `;
    const wrongid_check = await conn.query(wrongid_checkQuery, [member_id]);

    if (wrongid_check.length == 0) {
      console.log("유저데이터없음.");
      res.send({ isFalse: 2 });
      return;
    }
    const search_member_loanQuery = `
    SELECT * FROM book_loan
    WHERE user_id = ?;
  `;
    const rows = await conn.query(search_member_loanQuery, [member_id]);
    if (rows.length > 0) {
      const loan_datas = [];
      for (const row of rows) {
        const loan_data = {
          member_id: row.user_id,
          b_num: row.b_num,
          b_title: row.b_title,
          s_date: formatDate(row.s_date),
          e_date: formatDate(row.e_date),
          b_extension: row.b_extension,
        };
        loan_datas.push(loan_data);
      }
      res.json(loan_datas);
    } else {
      console.log("결과값이 없다.");
      res.send({ isFalse: 1 });
      return;
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
module.exports = loan;
