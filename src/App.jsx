import { useState} from "react";
import Home from "./screens/Home";
import SpymasterView from "./screens/SpymasterView";
import PlayerView from "./screens/PlayerView";
import { roomExists, createRoom, listenToRoom, } from "./firebase";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [roomId, setRoomId] = useState(null);  // current room ID
  const [room, setRoom] = useState(null);      // room document data

  // Listen to Firestore changes
  const listenRoom = (rid) => {
    listenToRoom(rid, (docSnap) => setRoom(docSnap.data()));
  };

  const handleGo = async (roomId) => {
    var exists = await roomExists(roomId);
    if (!exists) {
      await createRoom(roomId);
    }
    setRoomId(roomId);
    setScreen("player");
    listenRoom(roomId);
  };

  return (
    <>
      {screen === "home" && <Home onGo={handleGo} />}
      {screen === "spymaster" && <SpymasterView room={room} roomId={roomId} />}
      {screen === "player" && <PlayerView room={room} roomId={roomId} />}
    </>
  );
}
