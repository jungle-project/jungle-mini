/* ---------------- 로그인 ---------------- */
async function login() {
    // 로그인 페이지의 이메일·패스워드 input ID에 맞춰 주세요.
    const email    = document.getElementById('email')?.value.trim();   // ← 'username' → 'email'
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
        alert('이메일과 비밀번호를 입력해주세요.');
        return;
    }

    try {
        const res = await fetch('/auth/login', {
            method      : 'POST',
            headers     : { 'Content-Type': 'application/json' },
            credentials : 'include',
            body        : JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert('로그인 성공!');
            location.href = '/main';
        } else {
            alert(data.msg || '로그인에 실패했습니다.');
        }
    } catch (err) {
        console.error('로그인 오류:', err);
        alert('로그인 중 오류가 발생했습니다.');
    }
}


/* ---------------- 회원가입 ---------------- */
async function signup() {
    const name            = document.getElementById('grid-first-name')?.value.trim();
    const emailLocalPart  = document.getElementById('email')?.value.trim();
    const emailDomainPart = document.getElementById('dropdownButton')?.dataset.value || '';
    const email           = emailLocalPart + emailDomainPart;          // dropdownHandler가 dataset.value 채워둔다고 가정

    const password        = document.getElementById('grid-password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    if (!name || !emailLocalPart || !emailDomainPart || !password || !confirmPassword) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    if (password.length < 8) {
        alert('비밀번호는 최소 8자 이상이어야 합니다.');
        return;
    }

    try {
        const res = await fetch('/auth/register', {
            method  : 'POST',
            headers : { 'Content-Type': 'application/json' },
            body    : JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
            location.href = '/login';
        } else {
            alert(data.msg || '회원가입에 실패했습니다.');
        }
    } catch (err) {
        console.error('회원가입 오류:', err);
        alert('회원가입 중 오류가 발생했습니다.');
    }
}


/* ---------------- 비밀번호 재설정 ---------------- */
async function requestPasswordReset() {
    const email = document.getElementById('send-email')?.value.trim();
    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }

    try {
        const res  = await fetch('/auth/request-reset', {
            method  : 'POST',
            headers : { 'Content-Type': 'application/json' },
            body    : JSON.stringify({ email })
        });
        const data = await res.json();

        if (res.ok) {
            alert('비밀번호 재설정 이메일을 발송했습니다. 메일함을 확인하세요.');
            modelCancel();
        } else {
            alert(data.msg || '비밀번호 재설정 요청에 실패했습니다.');
        }
    } catch (err) {
        console.error('비밀번호 재설정 오류:', err);
        alert('비밀번호 재설정 중 오류가 발생했습니다.');
    }
}


/* ---------------- 기타(변경 無) ---------------- */
async function logout() { /* … 그대로 … */ }
function findPasswordHandler() { /* … 그대로 … */ }
function modelCancel() { /* … 그대로 … */ }
async function loadUserInfo() { /* … 그대로 … */ }


/* ---------- 페이지 로드 시 ---------- */
document.addEventListener('DOMContentLoaded', () => {
    // 로그인 버튼
    const loginBtn = document.querySelector('button[data-action="login"]');
    if (loginBtn) loginBtn.onclick = login;

    // 회원가입 버튼(폼 submit 막고 직접 호출)
    const signupBtn = document.querySelector('button[data-action="signup"]');
    if (signupBtn) signupBtn.onclick = signup;

    // 비밀번호 찾기 모달 버튼
    const pwBtn = document.querySelector('button[data-action="pw-reset"]');
    if (pwBtn) pwBtn.onclick = requestPasswordReset;

    // 메인·칭호 페이지에서 사용자 정보 갱신
    if (['/main', '/honor'].includes(location.pathname)) {
        loadUserInfo();
    }
});
