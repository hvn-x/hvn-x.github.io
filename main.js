// SEARCH BAR (Only runs if search input exists on page)
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const games = Array.from(document.getElementsByClassName('game'));

    const matchedGames = games.filter(game => game.innerText.toLowerCase().includes(searchTerm));

    games.forEach(game => game.style.display = 'none');
    matchedGames.forEach(game => game.style.display = 'block');
  });
}

// PANIC KEY (Press 'Q' to redirect)
window.addEventListener("keydown", function (e) {
  if (e.key === "q" || e.key === "Q") {
    document.title = "Gmail";
    
    let link = document.createElement('link');
    link.rel = 'icon';
    link.href = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/768px-Gmail_icon_%282020%29.svg.png';
    document.head.appendChild(link);
    
    window.location.href = "https://drive.google.com";
  }
});

// ENTER KEY FOR NEW SPLASH TEXT
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    splashText();
  }
});

// BUTTON LISTENER (Safely handled)
const crashBtn = document.querySelector('button');
if (crashBtn) {
  crashBtn.addEventListener('click', () => {
    while (true) {} // Freezes page if button clicked
  });
}

// FETCH SPLASH TEXTS
var says = [];
fetch('https://raw.githubusercontent.com/hvn-x/games/refs/heads/main/says.txt')
  .then(response => response.text())
  .then(text => {
    says = text.split('\n').filter(line => line.trim() !== '');
    splashText();
  })
  .catch(err => console.log("Splash fetch skipped or failed"));

function splashText() {
  const splashContainer = document.querySelector(".Index-SplashText");
  if (splashContainer && says.length > 0) {
    splashContainer.innerHTML = says[Math.floor(Math.random() * says.length)];
  }
}
