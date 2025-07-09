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

      renderPagination();
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

      const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
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
      const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
      currentPage = Math.min(Math.max(1, page), totalPages);
      renderUsers();
    }

    function filterUsers() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      filteredUsers = users.filter(user => user.name.toLowerCase().includes(query));
      currentPage = 1;
      renderUsers();
    }

    function sortUsers() {
      const sort = document.getElementById('sortSelect').value;
      if (sort === 'name') {
        filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        filteredUsers.sort((a, b) => b.praises - a.praises);
      }
      renderUsers();
    }