function dropdownHandler() {
    const dropdownContent = document.getElementById('dropdownContent');
    dropdownContent.classList.toggle('hidden');
}

function dropdownContentHandler(tag) {
    const dropdownButton = document.getElementById('dropdownButton');
    dropdownButton.textContent = tag.text;
}