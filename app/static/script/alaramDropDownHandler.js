function alaramDropDownHandler(type) {
    const alaramDropBoxContent = document.getElementById('alaramDropBoxContent');

    if (type == 'visible') {
        alaramDropBoxContent.classList.add('hidden');
    } else {
        alaramDropBoxContent.classList.remove('hidden');
    }
}
