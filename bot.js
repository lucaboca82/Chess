// Funzione per creare il Worker di Stockfish usando stockfish.min.js da cdnjs
function createStockfishWorker(callback) {
  fetch("https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/9.0.0/stockfish.min.js")
    .then(response => {
      if (!response.ok) {
        throw new Error("Errore di rete: " + response.status);
      }
      return response.text();
    })
    .then(scriptText => {
      scriptText = scriptText.trim();
      let blob = new Blob([scriptText], { type: 'text/javascript' });
      let blobURL = URL.createObjectURL(blob);
      let worker = new Worker(blobURL);
      callback(worker);
    })
    .catch(err => {
      console.error("Impossibile caricare Stockfish:", err);
    });
}

// Variabile globale per il worker Stockfish
var engine = null;

// Crea il Worker usando l'URL modificato
createStockfishWorker(function(worker) {
  engine = worker;
  console.log("Stockfish engine caricato tramite Blob URL.");
  engine.postMessage("uci");
  engine.onmessage = onEngineMessage;
});

// Recupera il valore ELO dal dropdown (definito in index_bot_final.php)
var botElo = parseInt(document.getElementById("botElo").value);
document.getElementById("botElo").addEventListener("change", function() {
  botElo = parseInt(this.value);
  console.log("Difficoltà del bot (ELO) impostata a:", botElo);
});

// Converte l'ELO (1200-3200) in Stockfish Skill Level (0-20)
function convertEloToSkill(elo) {
  let skill = Math.round((elo - 1200) * 20 / 2000);
  if (skill < 0) skill = 0;
  if (skill > 20) skill = 20;
  return skill;
}

// Gestione dei messaggi dall'engine Stockfish
function onEngineMessage(event) {
  var line = event.data;
  console.log("Stockfish:", line);
  if (line.startsWith("bestmove")) {
    var parts = line.split(" ");
    var bestMove = parts[1];
    if (bestMove && bestMove !== "(none)") {
      processBestMove(bestMove);
    }
  }
}

// Funzione per far muovere il bot
function makeBotMove() {
  if (!engine) {
    console.log("Engine non ancora pronto. Riprovo tra 100ms.");
    setTimeout(makeBotMove, 100);
    return;
  }
  console.log("Chiamo il bot per la mossa con posizione:", game.fen());
  
  engine.postMessage("uci");
  
  // Delay per permettere all'engine di prepararsi
  setTimeout(() => {
    let computedSkill = convertEloToSkill(botElo);
    console.log("Skill Level calcolato da ELO:", computedSkill);
    engine.postMessage("ucinewgame");
    engine.postMessage("setoption name Skill Level value " + computedSkill);
    engine.postMessage("position fen " + game.fen());
    // Imposta movetime: ad esempio, 500ms + 50ms per ogni punto di skill
    let movetime = 500 + 50 * computedSkill;
    engine.postMessage("go movetime " + movetime);
    console.log("Comando 'go movetime " + movetime + "' inviato a Stockfish.");
  }, 500);
}

// Funzione che applica la mossa restituita da Stockfish
function processBestMove(bestMove) {
  console.log("Best move ricevuta dal bot:", bestMove);
  let from = bestMove.substring(0,2);
  let to = bestMove.substring(2,4);
  let promotion = bestMove.length > 4 ? bestMove.substring(4,5) : "q";
  
  let move = game.move({
    from: from,
    to: to,
    promotion: promotion
  });
  
  if (move === null) {
    console.log("La mossa calcolata non è valida:", bestMove);
    return;
  }
  
  board.position(game.fen());
  
  if (move.captured) {
    // Il bot gioca con i pezzi neri, quindi ha catturato un pezzo bianco
    capturedWhite.push(move.captured);
    if (typeof updateCapturedPieces === "function") {
      updateCapturedPieces();
    }
  }
  
  if (typeof updateMoveHistory === "function") {
    updateMoveHistory();
  }
  if (typeof updateStatus === "function") {
    updateStatus();
  }
  
  if (game.game_over()) {
    let msg = "Partita terminata: ";
    if (game.in_checkmate()) {
      msg += (typeof getWinnerName === "function" ? getWinnerName() : "unknown") + " ha vinto per scacco mate!";
    } else {
      msg += "Patta!";
    }
    setTimeout(() => { alert(msg); }, 200);
  }
}
