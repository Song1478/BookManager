process.env.TZ = "Asia/Seoul";

const express = require("express");
const app = express();
const sign_up = require("./sign_up");
const search = require("./search");
const getNotice = require("./getNotice");
const login = require("./login");
const loan = require("./loan");
const book = require("./book");

const port = 3000;

// URL-encoded 형식의 본문 데이터를 파싱하는 미들웨어 설정
app.use(express.urlencoded({ extended: true }));

// JSON 형식의 본문 데이터를 파싱하는 미들웨어 설정 (JSON 요청도 처리하는 경우 유용)
app.use(express.json());
app.use(express.static("public"));

app.use("/sign_up", sign_up);
app.use("/search", search);
app.use("/getNotice", getNotice);
app.use("/login", login);
app.use("/loan", loan);
app.use("/book", book);

app.listen(port, () => {
  console.log(`서버가 ${port} 포트에서 실행 중입니다.`);
});
