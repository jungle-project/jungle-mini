function navButtonHandler(name) {
    const mainView = document.getElementById('mainView');
    const honorView = document.getElementById('honorView');
    const mainButton = document.getElementById('mainButton');
    const honorButton = document.getElementById('honorButton');

    if (name === 'main') {
        mainView.className = 'visible inline-block';
        honorView.className = 'invisible hidden';
        mainButton.className = 'hover:bg-blue-300 bg-blue-500 text-white px-4 py-2 rounded';
        honorButton.className = 'hover:bg-blue-200 px-4 py-2 rounded';
    } else {
        mainView.className = 'invisible hidden';
        honorView.className = 'visible inline-block';
        honorButton.className = 'hover:bg-blue-300 bg-blue-500 text-white px-4 py-2 rounded';
        mainButton.className = 'hover:bg-blue-200 px-4 py-2 rounded';
    }
}