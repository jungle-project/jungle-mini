let users = [];
let filteredUsers = [];
let currentPage = 1;
const USERS_PER_PAGE = 9;
let totalPages = 1;

// 유저 목록 불러오기
async function fetchUsers(sort = 'name', q = '', page = 1) {
  currentPage = page;
  const params = new URLSearchParams({ sort, q, page });
  const res = await fetch(`/api/users?${params}`);
  if (!res.ok) {
    alert('유저 목록을 불러오지 못했습니다.');
    return;
  }
  const data = await res.json();
  users = data.users.map(u => ({
    ...u,
    photo: u.profile_url || 'https://via.placeholder.com/150?text=No+Image',
    praises: u.praises || 0,
    name: u.name,
    id: u._id
  }));
  filteredUsers = [...users];       // 사실 이제 filteredUsers는 users와 동일
  totalPages = data.totalPages;
  renderUsers();
  renderPagination();
}

function renderUsers() {
  const grid = document.getElementById('profileGrid');
  grid.innerHTML = '';

  // 서버에서 이미 해당 페이지 분량만 내려주므로 slice 없이 전체를 출력
  filteredUsers.forEach(user => {
    grid.innerHTML += `
      <div class="bg-white rounded shadow p-4 text-center">
        <img src="${user.photo}" alt="${user.name}"
             class="mx-auto mb-2 rounded-full w-24 h-24 object-cover" />
        <h2 class="text-lg font-bold">${user.name} (${user.praises})</h2>
        <button class="bg-gray-600 text-white px-3 py-1 rounded text-sm mr-1"
                onclick="selectUserAndGo('${user.id}')">
          칭찬
        </button>
        <button class="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                onclick="selectUserAndView('${user.id}')">
          보기
        </button>
      </div>
    `;
  });
}

function selectUserAndGo(id) {
  const user = users.find(u => u.id === id);
  sessionStorage.setItem('selectedUser', JSON.stringify(user));
  window.location.href = '/modal?mode=write';
}

function selectUserAndView(id) {
  const user = users.find(u => u.id === id);
  sessionStorage.setItem('selectedUserProfile', JSON.stringify(user));
  window.location.href = '/profile';
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const addBtn = (text, page, disabled = false) => {
    pagination.innerHTML += `
      <button 
        onclick="goToPage(${page})" 
        ${disabled ? 'disabled class="opacity-50"' : ''} 
        class="px-2 py-1 hover:underline"
      >${text}</button>`;
  };

  addBtn('<<', 1, currentPage === 1);
  addBtn('<', currentPage - 1, currentPage === 1);

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
      <button 
        onclick="goToPage(${i})" 
        class="px-2 py-1 ${i === currentPage ? 'font-bold underline' : ''}"
      >${i}</button>`;
  }

  addBtn('>', currentPage + 1, currentPage === totalPages);
  addBtn('>>', totalPages, currentPage === totalPages);
}

function goToPage(page) {
  fetchUsers(
    document.getElementById('sortSelect').value,
    document.getElementById('searchInput').value,
    page
  );
}

function filterUsers() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  fetchUsers(
    document.getElementById('sortSelect').value,
    query,
    1
  );
}

function sortUsers() {
  fetchUsers(
    document.getElementById('sortSelect').value,
    document.getElementById('searchInput').value.trim().toLowerCase(),
    1
  );
}

// 페이지 로딩 시 1페이지 불러오기
window.addEventListener('DOMContentLoaded', () => {
  fetchUsers();
});
