document.addEventListener("DOMContentLoaded", function () {
  const checkIdButton = document.getElementById("check_id");
  const checkIdPass = document.getElementById("check_id_pass");
  const checkIdNonPass = document.getElementById("check_id_nonpass");
  const checkEmailButton = document.getElementById("check_email");
  const checkEmailPass = document.getElementById("check_email_pass");
  const checkEmailNonPass = document.getElementById("check_email_nonpass");
  var member_id = document.getElementById("member_id");
  var change_id = document.getElementById("change_id"); //change만들차례 --> checkIdButton.addEventListener 이거써서 바꾸자
  let isIdChecked = false;
  let isEmailChecked = false;
  function setupIdCheck() {
    checkIdButton.addEventListener("click", async function () {
      const id = document.getElementById("member_id").value;

      const response = await fetch("/sign_up/check-duplicate-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ member_id: id }),
      });

      const result = await response.json();

      if (result.status == "error") {
        checkIdPass.style.display = "none";
        checkIdNonPass.style.display = "block";
        isIdChecked = false;
      } else {
        checkIdPass.style.display = "block";
        checkIdNonPass.style.display = "none";
        isIdChecked = true;
        member_id.readOnly = true;
        change_id.style.display = "block";
        check_id.style.display = "none";
      }
    });

    document.getElementById("signupForm").addEventListener("submit", function (event) {
      if (!isIdChecked) {
        event.preventDefault();
        alert("ID 중복 확인을 해주세요.");
      }
    });
  }

  function setupEmailCheck() {
    checkEmailButton.addEventListener("click", async function () {
      const email = document.getElementById("email").value;

      const response = await fetch("/sign_up/check-duplicate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const result = await response.json();
      console.log(result.status);

      if (result.status == "error") {
        checkEmailPass.style.display = "none";
        checkEmailNonPass.style.display = "block";
        isEmailChecked = false;
      } else {
        checkEmailPass.style.display = "block";
        checkEmailNonPass.style.display = "none";
        isEmailChecked = true;
      }
    });

    document.getElementById("signupForm").addEventListener("submit", function (event) {
      if (!isEmailChecked) {
        event.preventDefault();
        alert("이메일 중복 확인을 해주세요.");
      }
    });
  }

  document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    console.log(formData);
    const data = {
      id: formData.get("id"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.token) {
        localStorage.setItem("authToken", result.token);
        window.location.href = "Main.html";
      } else {
        alert("아이디 혹은 비밀번호가 잘못되었습니다. 다시 입력해주세요");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 오류가 발생했습니다.");
    }
  });

  setupIdCheck();
  setupEmailCheck();
});
