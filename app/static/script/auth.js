// 로그인 기능
async function login() {
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('이메일과 비밀번호를 입력해주세요.');
        return;
    }
    
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('로그인 성공!');
            window.location.href = '/main'; // 메인 페이지로 이동
        } else {
            alert(data.msg || '로그인에 실패했습니다.');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        alert('로그인 중 오류가 발생했습니다.');
    }
}

// 회원가입 기능
async function signup() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!name || !email || !password || !confirmPassword) {
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
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
            window.location.href = '/login';
        } else {
            alert(data.msg || '회원가입에 실패했습니다.');
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        alert('회원가입 중 오류가 발생했습니다.');
    }
}

// 비밀번호 찾기 기능
async function requestPasswordReset() {
    const email = document.getElementById('send-email').value;
    
    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }
    
    try {
        const response = await fetch('/auth/request-reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.');
            modelCancel(); // 모달 닫기
        } else {
            alert(data.msg || '비밀번호 재설정 요청에 실패했습니다.');
        }
    } catch (error) {
        console.error('비밀번호 재설정 오류:', error);
        alert('비밀번호 재설정 중 오류가 발생했습니다.');
    }
}

// 로그아웃 기능
async function logout() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('로그아웃되었습니다.');
            window.location.href = '/';
        } else {
            alert('로그아웃에 실패했습니다.');
        }
    } catch (error) {
        console.error('로그아웃 오류:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
    }
}

// 모달 관련 함수들
function findPasswordHandler() {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
}

function modelCancel() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
}

// 사용자 정보 가져오기
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user-info', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const userInfo = await response.json();
            if (userInfo.is_authenticated) {
                // 사용자 이름 표시
                const userNameElement = document.querySelector('.font-normal');
                if (userNameElement) {
                    userNameElement.textContent = userInfo.name;
                }
            }
        }
    } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
    }
}

// 페이지 로드 시 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 버튼 이벤트 리스너
    const loginBtn = document.querySelector('button[type="button"]');
    if (loginBtn && loginBtn.textContent.includes('로그인')) {
        loginBtn.onclick = login;
    }
    
    // 회원가입 폼 제출 이벤트 리스너
    const signupForm = document.querySelector('form[action*="signup"]');
    if (signupForm) {
        signupForm.onsubmit = function(e) {
            e.preventDefault();
            signup();
        };
    }
    
    // 비밀번호 재설정 이메일 인증 버튼 이벤트 리스너
    const resetBtn = document.querySelector('a[onclick=""]');
    if (resetBtn && resetBtn.textContent.includes('이메일인증')) {
        resetBtn.onclick = requestPasswordReset;
    }
    
    // 메인 페이지에서 사용자 정보 로드
    if (window.location.pathname === '/main' || window.location.pathname === '/honor') {
        loadUserInfo();
    }
}); 