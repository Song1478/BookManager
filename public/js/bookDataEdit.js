let books = [];
let currentPage = 1;
const itemsPerPage = 10;
const pagesPerGroup = 5;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  const boardPage = document.getElementById("board_page");
  const board = document.getElementById("board");
  const reg_btn = document.getElementById("regist-book");
  const fix_btn = document.getElementById("fix-book");
  const del_btn = document.getElementById("delete-book");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const searchInput = document.getElementById("search_bar").value;

    if (searchInput === "") {
      alert("검색어를 입력해주세요");
      return;
    }
    try {
      const response = await fetch("/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ b_title: searchInput }),
      });
      const result = await response.json();

      if (books.isFalse == 1) {
        alert("검색 결과가 없습니다!");
        return;
      }

      books = result.map((row) => ({
        b_num: row.b_num,
        b_title: row.b_title,
        b_info: row.b_info,
        b_writer: row.b_writer,
        b_publish: row.b_publish,
        b_amount: row.b_amount,
      }));

      display_book_list(1);
      console.log(books);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  });
  function display_book_list(page) {
    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = books.slice(startIndex, endIndex);

    board.innerHTML = `<div class="top">
      <div class="b_num">책 번호</div>
      <div class="b_title">책 제목</div>
      <div class="b_writer">저자</div>
      <div class="b_publish">출판사</div>
      <div class="b_amount">수량</div>
    </div>`;
    currentItems.forEach((item) => {
      const divItem = document.createElement("div");
      divItem.classList.add("li-item");
      divItem.innerHTML = `
        <div class="b_num" id="b_num_${item.b_num}">${item.b_num}</div>
        <div class="b_title" id="b_title_${item.b_num}"><a onclick="book_modal(${item.b_num})" style="cursor: pointer">${item.b_title}</a></div>
        <div class="b_writer" id="b_writer_${item.b_num}">${item.b_writer}</div>
        <div class="b_publish" id="b_publish_${item.b_num}">${item.b_publish}</div>
        <div class="b_amount" id="b_amount_${item.b_num}">${item.b_amount}</div>
        <div class="b_info" id="b_info_${item.b_num}" style="display: none">${item.b_info}</div>
      `;
      board.appendChild(divItem);
    });
    createPaginationButtons();
  }
  //페이지 생성버튼
  function createPaginationButtons() {
    const totalPages = Math.ceil(books.length / itemsPerPage);
    boardPage.querySelectorAll(".bt,.num_p").forEach((btn) => btn.remove());

    const firstPageBtn = document.createElement("a");
    firstPageBtn.href = "#";
    firstPageBtn.className = "bt first";
    firstPageBtn.textContent = "<<";
    firstPageBtn.addEventListener("click", () => display_book_list(1));

    const prevPageBtn = document.createElement("a");
    prevPageBtn.href = "#";
    prevPageBtn.className = "bt prev";
    prevPageBtn.textContent = "<";
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) display_book_list(currentPage - 1);
    });

    const nextPageBtn = document.createElement("a");
    nextPageBtn.href = "#";
    nextPageBtn.className = "bt next";
    nextPageBtn.textContent = ">";
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) display_book_list(currentPage + 1);
    });

    const lastPageBtn = document.createElement("a");
    lastPageBtn.href = "#";
    lastPageBtn.className = "bt last";
    lastPageBtn.textContent = ">>";
    lastPageBtn.addEventListener("click", () => display_book_list(totalPages));

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
        display_book_list(i);
      });
      if (i === currentPage) {
        pageBtn.classList.add("on");
      }
      boardPage.appendChild(pageBtn);
    }
    // 이전 페이지, 다음 페이지, 첫 페이지, 마지막 페이지 버튼을 추가합니다.
    boardPage.prepend(firstPageBtn, prevPageBtn);
    boardPage.append(nextPageBtn, lastPageBtn);
  }
  //공지사항 등록
  reg_btn.addEventListener("click", async function () {
    const b_title = document.getElementById("book_title").value;
    const b_writer = document.getElementById("book_writer").value;
    const b_publish = document.getElementById("book_publish").value;
    const b_info = document.getElementById("subject").value;
    const b_amount = document.getElementById("book_amount").value;

    const book_obj = {
      b_title: b_title,
      b_writer: b_writer,
      b_publish: b_publish,
      b_info: b_info,
      b_amount: b_amount,
    };

    if (b_title == "" || b_writer == "" || b_publish == "" || b_info == "" || b_amount == "") {
      alert("내용을 입력해주세요!");
      return;
    }
    try {
      const response = await fetch("/book/addbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(book_obj),
      });

      const numData = await response.json();
      if (numData || numData.length > 0) {
        const b_Num = numData[0].b_num;
        alert(`${b_Num}번 도서가 등록 완료되었습니다.`);
        document.getElementById("book-add-modal-wrap").style.display = "none";
        window.location.href = "bookDataEdit.html";
      } else {
        console.log("등록오류");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  });
  fix_btn.addEventListener("click", async function () {
    const b_num = document.getElementById("book_num").textContent;
    const b_title = document.getElementById("book_title").value;
    const b_writer = document.getElementById("book_writer").value;
    const b_publish = document.getElementById("book_publish").value;
    const b_info = document.getElementById("subject").value;
    const b_amount = document.getElementById("book_amount").value;

    const book_obj = {
      b_num: b_num,
      b_title: b_title,
      b_writer: b_writer,
      b_publish: b_publish,
      b_info: b_info,
      b_amount: b_amount,
    };
    console.log(book_obj);
    try {
      const response = await fetch("/book/fixbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(book_obj),
      });
      console.log("왜안됨?");
      const result = await response.text();
      alert(result);
      location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  });
  del_btn.addEventListener("click", async function () {
    const b_num = document.getElementById("book_num").textContent;
    try {
      const response = await fetch("/book/deletebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ b_num: b_num }),
      });
      const result = await response.text();
      alert(result);
      location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  });
});
