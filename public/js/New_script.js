let currentPage = 1;
const itemsPerPage = 5;
const pagesPerGroup = 5;
let notices = [];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  const notice_btn = document.getElementById("load_notice_btn");
  const boardPage = document.getElementById("board_page");

  const board = document.getElementById("board");
  //폼제출코드
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    //메인페이지의 입력창의 입력값 가져오기
    const searchInput = document.getElementById("booksearch_input").value;
    //미입력 검사기
    if (searchInput === "") {
      alert("검색어를 입력해주세요");
      return;
    }
    try {
      //시간 설정 데이터가 쌓이지않게 쿠키가 1회 읽혀지고 삭제되게 짧은 시간설정.
      var expiresTime = new Date();
      expiresTime.setTime(expiresTime.getTime() + 3 * 1000);
      //쿠키 데이터 설정 입력값과 이 쿠키 데이터가 메인 페이지에서 넘어온것임을 확인하는 변수.
      document.cookie = "Search_text=" + searchInput + "; expires=" + expiresTime.toUTCString() + "; path=/";
      document.cookie = "main_search=1; expires=" + expiresTime.toUTCString() + "; path=/";
      //쿠키삭제
      setTimeout(function () {
        document.cookie = "Search_text=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "main_search=1; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }, 3 * 1000);
      //검색결과 페이지로 이동.
      window.location.href = "SearchResult.html";
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  });
  //공지사항 로드 메서드
  notice_btn.addEventListener("click", async () => {
    try {
      const response = await fetch("/getNotice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      notices = result.map((row) => ({
        noti_num: row.noti_num,
        title: row.title,
        contents: row.contents,
        Manager_name: row.Manager_name,
        date: row.date,
        count: row.count,
      }));
      notices.sort((a, b) => b.noti_num - a.noti_num);
      display_notice_list(1);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  });
  //공지사항 리스트 생성
  function display_notice_list(page) {
    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = notices.slice(startIndex, endIndex);

    board.innerHTML = `<div class="top">
    <div class="num">번호</div>
    <div class="title">제목</div>
    <div class="writer">글쓴이</div>
    <div class="date">작성일</div>
    <div class="count">조회</div>
  </div>`;
    currentItems.forEach((item) => {
      const divItem = document.createElement("div");
      divItem.classList.add("li-item");
      divItem.innerHTML = `
      <div class="num">${item.noti_num}</div>
      <div class="title"><a onclick="display_notice(${item.noti_num})" style="cursor: pointer">${item.title}</a></div>
      <div class="writer">${item.Manager_name}</div>
      <div class="date">${item.date}</div>
      <div class="count">${item.count}</div>
    `;
      board.appendChild(divItem);
    });
    // 페이지네이션 버튼 생성
    createPaginationButtons();
  }
  //페이지네이션 버튼 생성하기
  function createPaginationButtons() {
    const totalPages = Math.ceil(notices.length / itemsPerPage);
    boardPage.querySelectorAll(".bt,.num_p").forEach((btn) => btn.remove());

    const firstPageBtn = document.createElement("a");
    firstPageBtn.href = "#";
    firstPageBtn.className = "bt first";
    firstPageBtn.textContent = "<<";
    firstPageBtn.addEventListener("click", () => display_notice_list(1));

    const prevPageBtn = document.createElement("a");
    prevPageBtn.href = "#";
    prevPageBtn.className = "bt prev";
    prevPageBtn.textContent = "<";
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) display_notice_list(currentPage - 1);
    });

    const nextPageBtn = document.createElement("a");
    nextPageBtn.href = "#";
    nextPageBtn.className = "bt next";
    nextPageBtn.textContent = ">";
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) display_notice_list(currentPage + 1);
    });

    const lastPageBtn = document.createElement("a");
    lastPageBtn.href = "#";
    lastPageBtn.className = "bt last";
    lastPageBtn.textContent = ">>";
    lastPageBtn.addEventListener("click", () => display_notice_list(totalPages));

    const startPage = Math.floor((currentPage - 1) / pagesPerGroup) * pagesPerGroup + 1;
    const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

    // 페이지 버튼 생성
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("a");
      pageBtn.href = "#";
      pageBtn.className = "num_p";
      pageBtn.textContent = i;
      pageBtn.dataset.page = i;
      pageBtn.addEventListener("click", (e) => {
        e.preventDefault();
        display_notice_list(i);
      });
      boardPage.appendChild(pageBtn);
    }

    // 이전 페이지, 다음 페이지, 첫 페이지, 마지막 페이지 버튼을 추가합니다.
    boardPage.prepend(firstPageBtn, prevPageBtn);
    boardPage.append(nextPageBtn, lastPageBtn);
  }
});
//공지사항 띄우기-----------------------------------------------
function display_notice(k) {
  var notice = document.getElementById("board_view_wrap");
  //공지사항 로드를 통해 가져온 객체 배열에서 (k)번의 공지사항을 골라냄.
  const filternotice = notices.filter((item) => item.noti_num === k);
  const filter_item = filternotice[0];
  const div_title = document.getElementById("div_title");
  const dd_noti_num = document.getElementById("dd_noti_num");
  const dd_writer = document.getElementById("dd_writer");
  const dd_date = document.getElementById("dd_date");
  const dd_count = document.getElementById("dd_count");
  const div_contents = document.getElementById("div_contents");
  //(k)번의 공지사항의 데이터를  밑의 형식에따라
  div_title.textContent = filter_item.title;
  dd_noti_num.textContent = filter_item.noti_num;
  dd_writer.textContent = filter_item.writer;
  dd_date.textContent = filter_item.date;
  dd_count.textContent = filter_item.count;
  div_contents.textContent = filter_item.contents;

  if (notice.style.display == "none") {
    notice.style.display = "block";
  }
}
function close_board() {
  var notice = document.getElementById("board_view_wrap");
  if (notice.style.display == "block") {
    notice.style.display = "none";
  }
}
//tool button함수---------------------------------------------------
function change_section(i) {
  var notice = document.getElementById("notice_N_dayoff");
  var adress = document.getElementById("adress");
  var introduce = document.getElementById("infomation");
  switch (i) {
    case 0:
      notice.style.display = "block";
      adress.style.display = "none";
      introduce.style.display = "none";
      break;
    case 1:
      notice.style.display = "none";
      adress.style.display = "block";
      introduce.style.display = "none";
      break;
    case 2:
      notice.style.display = "none";
      adress.style.display = "none";
      introduce.style.display = "block";
      break;
  }
}

//Calender 기능----------------------------------------------------------
const nowDate = new Date();
const nowYear = nowDate.getFullYear();
let currentMonth = nowDate.getMonth();
window.onload = defineCalendar(nowYear, currentMonth + 1);

let selectedDay;
let HoliDays;
/**
 * 한국천문연구원 특일정보 API 통신 함수
 * @param {number} year 찾고자하는 년도
 * @param {number} month 찾고자하는 달
 */
function defineCalendar(year, month) {
  const parser = new DOMParser();
  const xhr = new XMLHttpRequest();
  const url = "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo";
  const holidayArray = [];
  let xmlDoc;
  let queryParams =
    "?" +
    encodeURIComponent("serviceKey") +
    "=" +
    "A172v6vRQ4lqsLTzDqEUDszd%2BiLL5YuAC1%2F%2F57FwMuYKrmF7bxn4R2q4l%2B86cZuuspKxeAGRcwByTcXXCqWNAw%3D%3D";
  queryParams += "&" + encodeURIComponent("solYear") + "=" + encodeURIComponent(`${year}`); // 조회할 년도
  queryParams += "&" + encodeURIComponent("solMonth") + "=" + encodeURIComponent(`${month}`); // 조회할 달
  console.log(url + queryParams);

  xhr.open("GET", url + queryParams);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4) {
      xmlDoc = parser.parseFromString(this.response, "text/xml");
      const items = xmlDoc.querySelectorAll("item");
      for (var i = 0; i < items.length; i++) {
        const dateString = items[i].getElementsByTagName("locdate")[0].textContent;
        const dateName = items[i].getElementsByTagName("dateName")[0].textContent;
        holidayArray.push({
          dateString: dateString,
          dateName: dateName,
        });
      }
    }
    createCalendar(year, month, holidayArray);
  };
  xhr.send("");
}

/**
 * HTML 페이지에 달력을 생성하는 함수
 * @param {number} year 생성하고자 하는 년도
 * @param {number} month 생성하고자 하는 달
 * @param {Array} holidayArray defineCalendar 에서 가져온 휴일 배열
 */
function createCalendar(year, month, holidayArray) {
  const calendar = document.getElementById("cal-items"); // 달력 DOM 객체
  const firstDay = new Date(year, month - 1, 1); // 해당 월의 첫번째 날
  const lastDay = new Date(year, month, 0); // 해당 월의 마지막 날

  const firstDayOfWeek = firstDay.getDay(); // 첫번째날의 요일을 가져옴
  const lastDate = lastDay.getDate(); // 마지막째날의 날짜를 가져옴

  const totalDays = lastDate + firstDayOfWeek;
  const totalWeeks = Math.ceil(totalDays / 7); // 해당 달에 몇주가 있는지 계산

  let date = 1;

  HoliDays = holidayArray;

  calendar.innerHTML = ""; // 초기화

  for (var row = 0; row < totalWeeks; row++) {
    const tableRow = document.createElement("tr");
    for (var col = 0; col < 7; col++) {
      const tableCell = document.createElement("td");
      const dayoffString = col == 0 ? " dayoff" : "";

      if (row == 0 && col < firstDay.getDay()) {
        // 이전 달의 날짜
      } else if (date <= lastDate) {
        // 현재 달의 날짜
        tableCell.innerHTML = `<div id="date-${date}" class="cal-item${dayoffString}" onclick="getEvent(${year}, ${
          month - 1
        }, ${date})"><span class="date-num">${date}</span><div id="date-${date}-plan" class="plan-container"></div></div>`;
        date++;
      } else {
        // 다음 달의 날짜
      }
      tableRow.appendChild(tableCell);
    }
    calendar.appendChild(tableRow);
  }
  for (var i = 0; i < holidayArray.length; i++) {
    const dateNum = Number(holidayArray[i].dateString.slice(-2));
    document.getElementById(`date-${dateNum}`).classList.add("dayoff");
  }
}

function prevMonth() {
  if (currentMonth < 1) {
    return;
  }
  currentMonth--;
  document.getElementById("month-title").innerHTML = ` ${currentMonth + 1}월의 도서관 휴관일`;
  defineCalendar(nowYear, currentMonth + 1);
}

function nextMonth() {
  if (currentMonth >= 11) {
    return;
  }
  currentMonth++;
  document.getElementById("month-title").innerHTML = ` ${currentMonth + 1}월의 도서관 휴관일`;
  defineCalendar(nowYear, currentMonth + 1);
}
