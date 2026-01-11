import { useEffect, useState } from "react";
import { listenToRoom, startGuess, submitGuess, passTurn, awardPoint, nextGame } from "../firebase";

export default function PlayerView({ roomId }) {
  const [room, setRoom] = useState(null);

  // UI-only state
  const [view, setView] = useState("player"); // "player" | "spymaster"
  const [myTeam, setMyTeam] = useState("blue");
  const [isMyGuess, setIsMyGuess] = useState(false);
  const [guessText, setGuessText] = useState("");

  useEffect(() => {
    if (!roomId) return;
    return listenToRoom(roomId, (snap) => {
      if (snap.exists()) setRoom(snap.data());
    });
  }, [roomId]);

  if (!room) return <div>Loading…</div>;

  const buttonsDisabled = room.isGuessing && !isMyGuess;

  return (
    <div className="player-view">
      {/* Top Left */}
      <div className="player-top-left">
        <div>Room: {roomId}</div>
        <div>Turn: {room.turn === "blue" ? "Blue" : "Red"} Team</div>
        <div>You: {myTeam === "blue" ? "Blue" : "Red"} Team</div>
      </div>

      {/* Top Right Controls */}
      <div className="player-top-right">
        <button onClick={() => setView(view === "player" ? "spymaster" : "player")}>
          {view === "player" ? "Spymaster" : "Player"}
        </button>
        <button onClick={() => setMyTeam(myTeam === "blue" ? "red" : "blue")}>
          Switch Team
        </button>
        <button onClick={() => nextGame(roomId)}>New Game</button>
      </div>

      {/* Centered Score */}
      <div className="scoreboard">
        <div className="score-labels">
          <span className="blue-label">Blue Team</span>
          <span className="red-label">Red Team</span>
        </div>
        <div className="score-numbers">
          <span className="blue-score">{room.score[0]}</span>
          <span className="dash">-</span>
          <span className="red-score">{room.score[1]}</span>
        </div>
      </div>

      {/* Main Actions */}
      <div className="player-actions">
        {view === "player" ? (
          <>
            <button
              className="action-button primary"
              disabled={buttonsDisabled || isMyGuess}
              onClick={async () => {
                await startGuess(roomId);
                setIsMyGuess(true);
              }}
            >
              Guess
            </button>

            <button
              className="action-button secondary"
              disabled={buttonsDisabled || isMyGuess}
              onClick={() => passTurn(roomId)}
            >
              Pass to {room.turn === "blue" ? "Red" : "Blue"} Team
            </button>

            {/* Guess input for the player whose turn it is */}
            {isMyGuess && (
              <div className="guess-box">
                <input
                  type="text"
                  value={guessText}
                  onChange={(e) => setGuessText(e.target.value)}
                  placeholder="Enter your guess"
                />
                <button
                  onClick={async () => {
                    await submitGuess(roomId, myTeam, guessText);
                    setGuessText("");
                    setIsMyGuess(false);
                  }}
                >
                  Submit
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Spymaster View */}
            <div className="spymaster-words">
              <div className="spy-word blue">
                <div className="word-label">Blue Team Word</div>
                <div className="word">{room.wordPair[0]}</div>
                <button onClick={() => awardPoint(roomId, "blue")}>+1 Blue</button>
              </div>
              <div className="spy-word red">
                <div className="word-label">Red Team Word</div>
                <div className="word">{room.wordPair[1]}</div>
                <button onClick={() => awardPoint(roomId, "red")}>+1 Red</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
