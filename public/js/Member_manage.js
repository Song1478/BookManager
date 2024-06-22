let join_members = [];

document.addEventListener("DOMContentLoaded", async () => {
  const join_btn = document.getElementById("join_member_btn");
  const join_member_list = document.getElementById("join_member_List");
  const form = document.getElementById("searchForm");
  const admin_btn = document.getElementById("modify_admin_btn");
  const itemsPerPage = 15;
  const list_Page = document.getElementById("list_Page");
  const delete_btn = document.getElementById("delete_btn");
  join_btn.addEventListener("click", async function () {
    try {
      const response = await fetch("/search/join_Member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      join_members = result.map((row) => ({
        num: row.num,
        member_id: row.member_id,
        name: row.name,
        signup_date: row.signup_date,
        gender: row.gender,
        birthdate: row.birthdate,
        email: row.email,
        penalty_count: row.penalty_count,
        hp: row.hp,
        admin_a: row.admin_a,
      }));
      console.log(join_members);
      display_Member_list(1);
    } catch (error) {
      console.error("서버통신오류", error);
    }
  });
  //회원검색
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (document.querySelector("#search_Bar").value == "") {
      alert("검색어를 입력해주세요");
      return;
    }
    const searchInput = document.getElementById("search_Bar").value;
    try {
      const response = await fetch("/search/search_Member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: searchInput }),
      });
      const result = await response.json();

      if (result.isFalse == 1) {
        alert("검색 결과가 없습니다!");
        return;
      }

      join_members = result.map((row) => ({
        num: row.num,
        member_id: row.member_id,
        name: row.name,
        signup_date: row.signup_date,
        gender: row.gender,
        birthdate: row.birthdate,
        email: row.email,
        penalty_count: row.penalty_count,
        hp: row.hp,
        admin_a: row.admin_a,
      }));
      display_Member_list(1);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  });

  //회원 리스트 생성
  function display_Member_list(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = join_members.slice(startIndex, endIndex);
    join_member_list.innerHTML = `<div class="top">
          
          <div class="id">회원 ID</div>
          <div class="name">이름</div>
          <div class="gender">성별</div>
          <div class="email">이메일 주소</div>
          <div class="hp">회원 전화번호</div>
          <div class="signup_date">신청일</div>
          <div class="birthdate">생년월일</div>
          <div class="panalty_count">위반 횟수</div>
          <div class="modify">수정</div>
        </div>`;

    currentItems.forEach((item) => {
      const divItem = document.createElement("div");
      divItem.classList.add("li-item");
      divItem.innerHTML = `
          <div id=num_${item.num} style="display:none">${item.num}</div>
          <div id=admin_${item.num} style="display:none">${item.admin_a}</div>
          <div class="id" id="id_${item.num}">${item.member_id}</div>
          <div class="name" id="name_${item.num}">${item.name}</div>
          <div class="gender" id="gender_${item.num}">${item.gender}</div>
          <div class="email" id="email_${item.num}">${item.email}</div>
          <div class="hp" id="hp_${item.num}">${item.hp}</div>
          <div class="signup_date" id="signup_date_${item.num}">${item.signup_date}</div>
          <div class="birthdate" id="birth_date_${item.num}">${item.birthdate}</div>
          <div class="panalty_count" id="panalty_count_${item.num}">${item.penalty_count}</div>
          <div class="modify"><input type="button" class="btn" id="modify_btn_${item.num}" value="수정" onclick="change_Modify(${item.num})"></div>
          `;
      join_member_list.appendChild(divItem);
    });
    createPaginationButtons();
  }

  //페이지네이션 생성
  function createPaginationButtons() {
    const totalPages = Math.ceil(join_members.length / itemsPerPage);

    list_Page.querySelectorAll(".bt,.num_p").forEach((btn) => btn.remove());

    const firstPageBtn = document.createElement("a");
    firstPageBtn.href = "#";
    firstPageBtn.className = "bt first";
    firstPageBtn.textContent = "<<";
    firstPageBtn.addEventListener("click", () => display_Member_list(1));

    const prevPageBtn = document.createElement("a");
    prevPageBtn.href = "#";
    prevPageBtn.className = "bt prev";
    prevPageBtn.textContent = "<";
    prevPageBtn.addEventListener("click", () => {
      const currentPage = getCurrentPage();
      if (currentPage > 1) display_Member_list(currentPage - 1);
    });

    const nextPageBtn = document.createElement("a");
    nextPageBtn.href = "#";
    nextPageBtn.className = "bt next";
    nextPageBtn.textContent = ">";
    nextPageBtn.addEventListener("click", () => {
      const currentPage = getCurrentPage();
      if (currentPage < totalPages) display_Member_list(currentPage + 1);
    });

    const lastPageBtn = document.createElement("a");
    lastPageBtn.href = "#";
    lastPageBtn.className = "bt last";
    lastPageBtn.textContent = ">>";
    lastPageBtn.addEventListener("click", () => display_Member_list(totalPages));

    // 페이지 버튼 생성
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("a");
      pageBtn.href = "#";
      pageBtn.className = "num_p";
      pageBtn.textContent = i;
      pageBtn.dataset.page = i;
      pageBtn.addEventListener("click", (e) => {
        e.preventDefault();
        display_Member_list(i);
      });
      list_Page.appendChild(pageBtn);
    }
    // 이전 페이지, 다음 페이지, 첫 페이지, 마지막 페이지 버튼을 추가합니다.
    list_Page.prepend(firstPageBtn, prevPageBtn);
    list_Page.append(nextPageBtn, lastPageBtn);
  }
  function getCurrentPage() {
    return parseInt(document.querySelector(".num.on").dataset.page);
  }

  admin_btn.addEventListener("click", async function () {
    const member_id = document.getElementById("p_id").textContent;

    try {
      await fetch("/sign_up/change_admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: member_id }),
      });
      alert("변경성공");
      location.reload();
    } catch (error) {
      console.error("서버통신오류", error);
    }
  });
  delete_btn.addEventListener("click", async function () {
    const id = document.getElementById("p_id").textContent;
    try {
      await fetch("/sign_up/delete_member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: id }),
      });
      alert("삭제성공");
      location.reload();
    } catch (error) {
      console.error("서버통신오류", error);
    }
  });
});
