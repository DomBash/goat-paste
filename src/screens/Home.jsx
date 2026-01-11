import { useState } from "react";
import { cleanupOldRooms } from "../firebase";

export default function Home({ onGo }) {
  const [roomId, setRoomId] = useState(
    Math.random().toString(36).substring(2, 7).toUpperCase()
  );
  const [processing, setProcessing] = useState(false);

  const handleGo = async () => {
    setProcessing(true);

    // Clear rooms older than 24 hours
    await cleanupOldRooms();

    // Continue to room
    onGo(roomId);

    setProcessing(false);
  };

  return (
    <div className="home">
      <h1 className="home-title">Goat Paste</h1>

      <div className="home-form">
        <input
          placeholder="Room Code"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          disabled={processing}
        />

        <button
          className="primary"
          onClick={handleGo}
          disabled={processing}
        >
          {processing ? "Loading…" : "GO"}
        </button>
      </div>
    </div>
  );
}
