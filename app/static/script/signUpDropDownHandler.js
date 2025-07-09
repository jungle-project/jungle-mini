/* ▼ 드롭다운 열기/닫기 */
function dropdownHandler() {
    document.getElementById('dropdownContent')
            .classList.toggle('hidden');
}

/* ▼ 도메인 선택 시 실행 */
function dropdownContentHandler(tag) {
    const dropdownButton  = document.getElementById('dropdownButton');
    const selectedDomain  = tag.textContent.trim();   // "@gmail.com" 등

    // 1) 버튼 라벨 교체
    dropdownButton.textContent = selectedDomain;

    // 2) JS에서 읽을 수 있게 dataset에 저장
    dropdownButton.dataset.value = selectedDomain;

    // 3) 드롭다운 닫기
    document.getElementById('dropdownContent')
            .classList.add('hidden');
}
