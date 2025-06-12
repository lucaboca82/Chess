# Chess Webgame ♟️
#### Author: Bocaletto Luca

Welcome to **Chess** Webgame Single Player – a comprehensive chess platform that brings official tournament features directly to your browser!

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white&style=for-the-badge)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge)
![PHP](https://img.shields.io/badge/PHP-777BB4?logo=php&logoColor=white&style=for-the-badge)
![WebGame](https://img.shields.io/badge/WebGame-HTML5%20Game-blue?style=for-the-badge)
![Project Completed](https://img.shields.io/badge/Project-Completed-green?style=for-the-badge)
![GPL v3](https://img.shields.io/badge/License-GPLv3-blue?style=for-the-badge)

[![Test Online](https://img.shields.io/badge/Test%20Online-Click%20Here-brightgreen?style=for-the-badge)](https://bocaletto-luca.github.io/Chess/)

## ✨ Overview

Chess WebApp Single Player features:
- **Real-Time Clocks**: Each side has its own clock, with customizable time control.
- **ELO-Based AI**: Select your bot difficulty (ELO 1200–3200) – our app converts your choice to Stockfish’s Skill Level.
- **Game History and Captures**: Full move history and a capture display panel.
- **Undo Move**: Reverse the last pair of moves to improve your play.
- **Color Selection**: Choose to play as White or Black.

Developed by **Bocaletto Luca**  
GitHub Page: [bocaletto-luca](https://github.com/bocaletto-luca) • Official Site: [bocalettoluca.altervista.org](https://bocalettoluca.altervista.org) • GitHub Site: [bocaletto-luca.github.io](https://bocaletto-luca.github.io)


## 🚀 Technologies Used

- **[JavaScript](https://www.javascript.com/)**
- **[HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)**
- **[CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS)**
- **[Chess.js](https://github.com/jhlywa/chess.js)** – Chess logic engine.
- **[Chessboard.js](https://chessboardjs.com/)** – Interactive chessboard.
- **[Stockfish](https://stockfishchess.org/)** – Powerful chess engine integrated via WebWorker.

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bocaletto-luca/chess.git

Place all files on your Apache (or similar) web server.

Open `index_bot_final.php` in your browser (ensure the page is served via HTTP/HTTPS).

🎮 **Usage**

- **Select Color:** Choose whether you want to play as White or Black.
- **Select Bot Difficulty:** Pick an ELO value between 1200 and 3200 – the app converts it to a Skill Level (0–20) for Stockfish.
- **Set Game Time:** Choose your preferred time control for each side.
- **Game Interaction:** Make your move by dragging pieces. The bot responds automatically, and you can view game history and a capture log.
- **Undo/Reset:** Use the Undo Move button to cancel the last move pair or Reset to restart the game.

📄 **License**

This project is released under the GPLv3 License. See
