let users = [];
let filteredUsers = [];
let currentPage = 1;
const USERS_PER_PAGE = 9;
let totalPages = 1;

// 유저 목록 불러오기
async function fetchUsers(sort = 'name', q = '', page = 1) {
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
    name: u.name
  }));
  filteredUsers = [...users];
  totalPages = data.totalPages;
  renderUsers();
  renderPagination();
}

function renderUsers() {
  const grid = document.getElementById('profileGrid');
  grid.innerHTML = '';
  const start = (currentPage - 1) * USERS_PER_PAGE;
  const end = start + USERS_PER_PAGE;
  const pageUsers = filteredUsers.slice(start, end);

  pageUsers.forEach(user => {
    grid.innerHTML += `
      <div class="bg-white rounded shadow p-4 text-center">
        <img src="${user.photo}" alt="${user.name}" class="mx-auto mb-2 rounded-full w-24 h-24 object-cover" />
        <h2 class="text-lg font-bold">${user.name} (${user.praises})</h2>
        <button onclick="goProfile();" class="bg-gray-600 text-white px-3 py-1 rounded text-sm mr-1">칭찬</button>
        <button onclick="goView();" class="bg-gray-600 text-white px-3 py-1 rounded text-sm">보기</button>
      </div>
    `;
  });
}

function goProfile() {
    location.href = "/modal?mode=write";
}

function goView() {
    location.href = "/profile";
}


function renderPagination() {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const addBtn = (text, page, disabled = false) => {
    pagination.innerHTML += `<button onclick="goToPage(${page})" ${disabled ? 'disabled class="opacity-50"' : ''} class="px-2 py-1 hover:underline">${text}</button>`;
  };

  addBtn('<<', 1, currentPage === 1);
  addBtn('<', currentPage - 1, currentPage === 1);

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `<button onclick="goToPage(${i})" class="px-2 py-1 ${i === currentPage ? 'font-bold underline' : ''}">${i}</button>`;
  }

  addBtn('>', currentPage + 1, currentPage === totalPages);
  addBtn('>>', totalPages, currentPage === totalPages);
}

function goToPage(page) {
  currentPage = page;
  fetchUsers(document.getElementById('sortSelect').value, document.getElementById('searchInput').value, page);
}

function filterUsers() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  fetchUsers(document.getElementById('sortSelect').value, query, 1);
}

function sortUsers() {
  const sort = document.getElementById('sortSelect').value;
  fetchUsers(sort, document.getElementById('searchInput').value, 1);
}

// 페이지 로딩 시 유저 목록 불러오기
window.addEventListener('DOMContentLoaded', function () {
  fetchUsers();
});