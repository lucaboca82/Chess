////////////////////////////////
    // Variabili Globali e Setup
    ////////////////////////////////
    let game = new Chess();
    let board = null;
    let capturedWhite = []; // Pezzi bianchi catturati (persi da Bianco, quindi presi dal Bot)
    let capturedBlack = []; // Pezzi neri catturati (persi dal Bot, quindi presi da Bianco)
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    const pieceSymbols = {
      p: { white: "♟︎", black: "♙" },
      n: { white: "♞", black: "♘" },
      b: { white: "♝", black: "♗" },
      r: { white: "♜", black: "♖" },
      q: { white: "♛", black: "♕" }
    };
    
    // Orologi: defaultTime è letto dal dropdown in secondi (default 300 = 5 minuti)
    let defaultTime = parseInt(document.getElementById("gameTime").value);
    let whiteTime = defaultTime;
    let blackTime = defaultTime;
    let clockInterval = null;
    
    // Colore del giocatore, letto dal dropdown (default "w")
    let playerColor = document.getElementById("playerColor").value;
    
    ////////////////////////////////
    // Funzioni Orologio (Clocks)
    ////////////////////////////////
    function updateClockDisplay() {
      function formatTime(s) {
        let m = Math.floor(s / 60), sec = s % 60;
        return (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
      }
      $("#clockWhite").text("Bianco: " + formatTime(whiteTime));
      $("#clockBlack").text("Nero: " + formatTime(blackTime));
    }
    
    function startClock() {
      stopClock();
      clockInterval = setInterval(() => {
        if (game.game_over()) {
          stopClock();
          return;
        }
        if (game.turn() === "w") {
          whiteTime--;
          if (whiteTime < 0) {
            stopClock();
            alert("Tempo esaurito per Bianco. Bot vince!");
            return;
          }
        } else {
          blackTime--;
          if (blackTime < 0) {
            stopClock();
            alert("Tempo esaurito per Nero. Tu vinci!");
            return;
          }
        }
        updateClockDisplay();
      }, 1000);
    }
    
    function stopClock() {
      if (clockInterval) clearInterval(clockInterval);
      clockInterval = null;
    }
    
    function resetClocks() {
      whiteTime = defaultTime;
      blackTime = defaultTime;
      updateClockDisplay();
    }
    
    ////////////////////////////////
    // Funzione per determinare il vincitore
    ////////////////////////////////
    function getWinnerName() {
      // Quando c'è checkmate, game.turn() è il colore perdente. Quindi il vincitore è l'opposto.
      const winningColor = (game.turn() === "w") ? "b" : "w";
      return (winningColor === playerColor) ? "Tu" : "Bot";
    }
    
    ////////////////////////////////
    // Aggiornamenti: Move History, Captures, Stato
    ////////////////////////////////
    function updateMoveHistory() {
      let history = game.history({ verbose: true });
      let historyHtml = "<table class='table table-bordered'><thead><tr><th>Mossa</th><th>Bianco</th><th>Bot</th></tr></thead><tbody>";
      for (let i = 0; i < history.length; i += 2) {
        let moveNumber = (i / 2) + 1;
        let whiteMoveObj = history[i];
        let blackMoveObj = history[i + 1];
        let whiteMove = whiteMoveObj
          ? whiteMoveObj.piece.toUpperCase() + whiteMoveObj.from + (whiteMoveObj.captured ? "x" : "-") + whiteMoveObj.to
          : "";
        let blackMove = blackMoveObj
          ? blackMoveObj.piece.toUpperCase() + blackMoveObj.from + (blackMoveObj.captured ? "x" : "-") + blackMoveObj.to
          : "";
        historyHtml += `<tr>
                          <td>${moveNumber}</td>
                          <td>${whiteMove}</td>
                          <td>${blackMove}</td>
                        </tr>`;
      }
      historyHtml += "</tbody></table>";
      $("#moveHistory").html(historyHtml);
    }
    
    function updateCapturedPieces() {
      let whiteCapsHTML = "";
      let blackCapsHTML = "";
      let whiteScore = 0;
      let blackScore = 0;
      
      capturedWhite.forEach(piece => {
        if(pieceSymbols[piece]){
          whiteCapsHTML += pieceSymbols[piece]["white"] + " ";
          whiteScore += pieceValues[piece];
        } else {
          whiteCapsHTML += piece + " ";
        }
      });
      capturedBlack.forEach(piece => {
        if(pieceSymbols[piece]){
          blackCapsHTML += pieceSymbols[piece]["black"] + " ";
          blackScore += pieceValues[piece];
        } else {
          blackCapsHTML += piece + " ";
        }
      });
      
      $("#capturedPieces").html(
        "<strong>Bianco ha catturato:</strong> " + blackCapsHTML + " (Totale: " + blackScore + ")<br>" +
        "<strong>Bot ha catturato:</strong> " + whiteCapsHTML + " (Totale: " + whiteScore + ")"
      );
    }
    
    function updateStatus() {
      let statusText = "";
      if (game.turn() === "w") {
        statusText = "Turno: Bianco";
      } else {
        statusText = "Turno: Bot (Nero)";
      }
      if (game.in_check()){
        statusText += " – Scacco al Re!";
      }
      $("#gameStatus").text(statusText);
    }
    
    ////////////////////////////////
    // Funzioni per evidenziare le mosse legali
    ////////////////////////////////
    function removeHighlights() {
      $('#board .square-55d63').css('background', '');
    }
    function highlightSquare(square) {
      let $square = $('#board .square-' + square);
      let background = $square.hasClass("black-3c85d") ? "#696969" : "#a9a9a9";
      $square.css("background", background);
    }
    
    ////////////////////////////////
    // Gestione Drag & Drop (turno del giocatore)
    ////////////////////////////////
    function onDragStart(source, piece, position, orientation) {
      // Il giocatore può muovere solo se è il suo turno
      if (game.game_over() || (game.turn() !== playerColor)) return false;
      removeHighlights();
      updateStatus();
    }
    
    function onDragMove(e, source, piece, position, orientation) {
      removeHighlights();
      let moves = game.moves({ square: source, verbose: true });
      if (moves.length === 0) return;
      moves.forEach(m => highlightSquare(m.to));
    }
    
    function onDrop(source, target) {
      removeHighlights();
      if (game.turn() !== playerColor) return "snapback";
      let move = game.move({
        from: source,
        to: target,
        promotion: "q"
      });
      if (move === null) return "snapback";
      
      board.position(game.fen());
      
      if (move.captured) {
        capturedBlack.push(move.captured);
        updateCapturedPieces();
      }
      
      updateMoveHistory();
      updateStatus();
      
      // Aggiorna orologio
      stopClock();
      startClock();
      
      // Se il turno passa al Bot, chiamare la mossa del bot
      if (!game.game_over() && game.turn() !== playerColor) {
        setTimeout(() => { makeBotMove(); }, 500);
      }
      
      if (game.game_over()){
        let msg = "Partita terminata: ";
        if (game.in_checkmate()) {
          msg += getWinnerName() + " ha vinto per scacco mate!";
        } else {
          msg += "Patta!";
        }
        setTimeout(() => { alert(msg); }, 200);
      }
    }
    
    function onSnapEnd() {
      board.position(game.fen());
      updateStatus();
    }
    
    ////////////////////////////////
    // Inizializza la scacchiera
    ////////////////////////////////
    function initBoard() {
      // Leggi il colore scelto
      playerColor = $("#playerColor").val();
      board = Chessboard("board", {
        draggable: true,
        dropOffBoard: "snap",
        sparePieces: false,
        position: "start",
        orientation: (playerColor === "w" ? "white" : "black"),
        pieceTheme: "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
        onDragStart: onDragStart,
        onDragMove: onDragMove,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
      });
      // Se il giocatore ha scelto Nero, il bot deve muovere per primo
      if (game.turn() !== playerColor) {
        setTimeout(() => { makeBotMove(); }, 500);
      }
    }
    
    ////////////////////////////////
    // Undo Mossa
    ////////////////////////////////
    function undoMove() {
      if (game.history().length === 0) return;
      game.undo();
      if (game.turn() !== playerColor && game.history().length > 0) {
        game.undo();
      }
      board.position(game.fen());
      updateMoveHistory();
      updateStatus();
      resetClocks();
    }
    
    ////////////////////////////////
    // Reset Partita
    ////////////////////////////////
    function resetGame() {
      game.reset();
      playerColor = $("#playerColor").val();
      resetClocks();
      capturedWhite = [];
      capturedBlack = [];
      updateCapturedPieces();
      updateMoveHistory();
      updateStatus();
      board.start();
      board.orientation((playerColor === "w" ? "white" : "black"));
      if (game.turn() !== playerColor) {
        setTimeout(() => { makeBotMove(); }, 500);
      }
      stopClock();
      startClock();
    }
    
    ////////////////////////////////
    // Inizializzazione degli orologi
    ////////////////////////////////
    function initClocks() {
      // Leggi il tempo scelto dal dropdown
      defaultTime = parseInt(document.getElementById("gameTime").value);
      whiteTime = defaultTime;
      blackTime = defaultTime;
      updateClockDisplay();
      startClock();
    }
    
    ////////////////////////////////
    // Avvio: Inizializza board, orologi e listener
    ////////////////////////////////
    $(document).ready(function() {
      playerColor = $("#playerColor").val();
      initBoard();
      initClocks();
    });
    
    // Listener per i controlli
    document.getElementById("resetGame").addEventListener("click", resetGame);
    document.getElementById("undoMove").addEventListener("click", undoMove);
    document.getElementById("gameTime").addEventListener("change", function() {
      defaultTime = parseInt(this.value);
      console.log("Tempo di partita aggiornato a:", defaultTime, "secondi");
      resetClocks();
    });
    document.getElementById("playerColor").addEventListener("change", function() {
      playerColor = this.value;
      // Ricrea la scacchiera con l'orientamento aggiornato
      board.orientation((playerColor === "w" ? "white" : "black"));
    });
    
    ////////////////////////////////
    // Funzione per l'orologio: aggiornamento display e avvio/stop
    ////////////////////////////////
    function updateClockDisplay() {
      function formatTime(s) {
        let m = Math.floor(s / 60), sec = s % 60;
        return (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
      }
      $("#clockWhite").text("Bianco: " + formatTime(whiteTime));
      $("#clockBlack").text("Nero: " + formatTime(blackTime));
    }
    
    function startClock() {
      stopClock();
      clockInterval = setInterval(() => {
        if (game.game_over()) {
          stopClock();
          return;
        }
        if (game.turn() === "w") {
          whiteTime--;
          if (whiteTime < 0) {
            stopClock();
            alert("Tempo esaurito per Bianco. Bot vince!");
            return;
          }
        } else {
          blackTime--;
          if (blackTime < 0) {
            stopClock();
            alert("Tempo esaurito per Nero. Tu vinci!");
            return;
          }
        }
        updateClockDisplay();
      }, 1000);
    }
    
    function stopClock() {
      if (clockInterval) clearInterval(clockInterval);
      clockInterval = null;
    }
    
    function resetClocks() {
      whiteTime = defaultTime;
      blackTime = defaultTime;
      updateClockDisplay();
    }
    
    ////////////////////////////////
    // Funzione per determinare il vincitore
    ////////////////////////////////
    function getWinnerName() {
      const winningColor = (game.turn() === "w" ? "b" : "w");
      return (winningColor === playerColor) ? "Tu" : "Bot";
    }
