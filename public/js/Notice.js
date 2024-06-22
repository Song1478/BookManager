let notices = [];

document.addEventListener("DOMContentLoaded", async () => {
  const boardPage = document.getElementById("board_page");
  const board = document.getElementById("board");
  const itemsPerPage = 15;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const formattedDate = `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
  const form = document.getElementById("searchForm");
  const reg_btn = document.getElementById("regist-Notice");
  const fix_btn = document.getElementById("fix-Notice");
  load_Notice();
  //페이지 로드되고 바로 공지사항 로드
  async function load_Notice() {
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
        Manager_id: row.Manager_id,
      }));
      notices.sort((a, b) => b.noti_num - a.noti_num);
      display_notice_list(1);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }

  //공지사항 검색
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (document.querySelector("#search_bar").value == "") {
      alert("검색어를 입력해주세요");
      return;
    }
    const searchInput = document.getElementById("search_bar").value;
    try {
      const response = await fetch("/search/search_Notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: searchInput }),
      });
      const result = await response.json();

      if (result.isFalse == 1) {
        alert("검색 결과가 없습니다!");
        return;
      }

      notices = result.map((row) => ({
        noti_num: row.noti_num,
        title: row.title,
        contents: row.contents,
        Manager_name: row.Manager_name,
        date: row.date,
        count: row.count,
        Manager_id: row.Manager_id,
      }));

      notices.sort((a, b) => b.noti_num - a.noti_num);
      display_notice_list(1);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  });

  //공지사항 리스트 생성
  function display_notice_list(page) {
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
        <div class="num" id="num_${item.noti_num}">${item.noti_num}</div>
        <div class="title" id="title_${item.noti_num}"><a onclick="notice_modal(${item.noti_num})" style="cursor: pointer">${item.title}</a></div>
        <div class="writer" id="writer_${item.noti_num}">${item.Manager_name}</div>
        <div class="date" id="date_${item.noti_num}">${item.date}</div>
        <div class="count" id="count_${item.noti_num}">${item.count}</div>
        <div class="cont" id="cont_${item.noti_num}" style="display: none">${item.contents}</div>
      `;
      board.appendChild(divItem);
    });
    // 페이지네이션 버튼 생성
    createPaginationButtons();
  }

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
      const currentPage = getCurrentPage();
      if (currentPage > 1) display_notice_list(currentPage - 1);
    });

    const nextPageBtn = document.createElement("a");
    nextPageBtn.href = "#";
    nextPageBtn.className = "bt next";
    nextPageBtn.textContent = ">";
    nextPageBtn.addEventListener("click", () => {
      const currentPage = getCurrentPage();
      if (currentPage < totalPages) display_notice_list(currentPage + 1);
    });

    const lastPageBtn = document.createElement("a");
    lastPageBtn.href = "#";
    lastPageBtn.className = "bt last";
    lastPageBtn.textContent = ">>";
    lastPageBtn.addEventListener("click", () => display_notice_list(totalPages));

    // 페이지 버튼 생성
    for (let i = 1; i <= totalPages; i++) {
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

  // 현재 페이지 번호를 가져오는 함수
  function getCurrentPage() {
    return parseInt(document.querySelector(".num.on").dataset.page);
  }
  //토큰 확인
  async function load_data() {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch("/login/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("Error:", error);
      window.location.href = "Notice.html";
    }
  }
  //공지사항 등록
  reg_btn.addEventListener("click", async function () {
    const data = await load_data();
    const title_data = document.getElementById("nt_title").value;
    const cont_data = document.getElementById("subject").value;
    const notice_obj = {
      title: title_data,
      contents: cont_data,
      Manager_name: data.name,
      date: formattedDate,
      count: 0,
      Manager_id: data.id,
    };

    if (title_data == "" && cont_data == "") {
      alert("내용을 입력해주세요!");
      return;
    }

    try {
      const response = await fetch("/getNotice/addNotice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notice_obj),
      });

      const numData = await response.json();
      if (numData && numData.length > 0) {
        const notiNum = numData[0].noti_num;
        alert(`${notiNum}번 공지사항이 등록 완료되었습니다.`);
        document.getElementById("Notice-add-modal-wrap").style.display = "none";
        window.location.href = "Notice.html";
      } else {
        console.log("등록오류");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  });
  fix_btn.addEventListener("click", async function () {
    //token이용해서 id가 관리자의 id와 동일한지 확인.
    const data = await load_data();
    const num = document.getElementById("noti_num").textContent; //이게 지금은 문자열, 오류나서 숫자로바꿔야할수도?
    const title = document.getElementById("nt_title").value;
    const contents = document.getElementById("subject").value;
    console.log("실행");

    const fix_data = {
      noti_num: num,
      title: title,
      contents: contents,
      date: formattedDate,
      Manager_id: data.id,
    };

    try {
      const response = await fetch("/getNotice/fixNotice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fix_data),
      });

      const result = await response.json();

      if (result.isFalse == 1) {
        alert("글 작성자가 아니기에 수정권한이 없습니다.");
        document.getElementById("Notice-add-modal-wrap").style.display = "none";
        return;
      }

      alert(`${data.name}님의 제목:${result.title}의 공지사항이 수정되었습니다.`);
      document.getElementById("Notice-add-modal-wrap").style.display = "none";
      window.location.href = "Notice.html";
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  });
});
