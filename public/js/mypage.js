let join_members = [];
document.addEventListener("DOMContentLoaded", () => {
  const loan_info = document.getElementById("loan_info");
  //현재회원정보 가져오기
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
  //회원정보 서버에서 검색후 보여주기
  async function load_member_info() {
    const data = await load_data();
    console.log(data.id);
    const searchInput = data.id;
    try {
      const response = await fetch("/search/search_Member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: searchInput }),
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
      change_Modify();
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }
  //회원 대출기록 검색후 보여주기
  async function load_loan_info() {
    const strong = document.getElementById("strong_none");
    const data = await load_data();
    const searchInput = data.id;
    try {
      const response = await fetch("/loan/search_return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: searchInput }),
      });
      const result = await response.json();

      if (result.isFalse == 1) {
        alert("반납할 책이 없습니다.");
        return;
      }
      strong.style.display = "none";
      returns = result.map((row) => ({
        member_id: row.member_id,
        b_num: row.b_num,
        b_title: row.b_title,
        s_date: row.s_date,
        e_date: row.e_date,
        b_extension: row.b_extension,
      }));

      loan_info.innerHTML = `<div class="top">
          <div class="b_num">책 번호</div>
          <div class="b_title">책 제목</div>
          <div class="s_date">대여일</div>
          <div class="e_date">반납일</div>
          <div class="e_date">연장 여부</div>
        </div>`;

      returns.forEach((item) => {
        if (item.b_extension == 1) {
          item.b_extension = "Y";
        } else {
          item.b_extension = "N";
        }
        const divItem = document.createElement("div");
        divItem.classList.add("li-item");
        divItem.innerHTML = `  
          <div class="member_id" id="id_${item.b_num}" style="display:none">${item.member_id}</div>
          <div class="b_num" id="b_num_${item.b_num}">${item.b_num}</div>
          <div class="b_title" id="b_title_${item.b_num}">${item.b_title}</div>
          <div class="s_date" id="s_date_${item.b_num}">${item.s_date}</div>
          <div class="e_date" id="e_date_${item.b_num}">${item.e_date}</div>
          <div class="e_date" id="extension_${item.b_num}">${item.b_extension}</div>
        `;
        loan_info.appendChild(divItem);
      });
    } catch (error) {
      console.error("서버오류:", error);
    }
  }
  //화면변경
  function change_Modify() {
    console.log(join_members[0]);
    document.getElementById("p_num").textContent = join_members[0].num;
    document.getElementById("p_id").textContent = join_members[0].member_id;
    document.getElementById("p_name").textContent = join_members[0].name;
    document.getElementById("p_gender").textContent = join_members[0].gender;
    document.getElementById("p_email").textContent = join_members[0].email;
    document.getElementById("p_hp").textContent = join_members[0].hp;
    document.getElementById("p_signup_date").textContent = join_members[0].signup_date;
    document.getElementById("p_birth_date").textContent = join_members[0].birthdate;
    document.getElementById("p_panalty_count").textContent = join_members[0].penalty_count;
  }
  load_member_info();
  load_loan_info();
});
