function dropdownHandler() {
    const dropdownButton = document.getElementById('dropdownButton');
    dropdownContent.classList.toggle('hidden');
}

function dropdownContentHandler(tag) {
    const dropdownButton = document.getElementById('dropdownButton');
    dropdownButton.textContent = tag.text;
}