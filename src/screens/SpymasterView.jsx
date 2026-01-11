import { useEffect, useState } from "react";
import { listenToRoom } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";

export default function SpymasterView({ roomId }) {
  const [room, setRoom] = useState(null);
  const [clueWord, setClueWord] = useState("");
  const [clueNumber, setClueNumber] = useState("");

  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = listenToRoom(roomId, (docSnap) => {
      if (docSnap.exists()) setRoom(docSnap.data());
    });
    return () => unsubscribe();
  }, [roomId]);

  const handleSubmitClue = async () => {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, { clue: { word: clueWord, number: Number(clueNumber) }, state: "guess" });
  };

  if (!room) return <div>Loading...</div>;

  return (
    <div className="spymaster">
      <h2>Spymaster</h2>
      <div className="word-pair">
        {room.wordPair?.map((w, i) => <div key={i}>{w}</div>)}
      </div>
      <input placeholder="Clue Word" value={clueWord} onChange={(e) => setClueWord(e.target.value)} />
      <input placeholder="Number" type="number" value={clueNumber} onChange={(e) => setClueNumber(e.target.value)} />
      <button className="primary" onClick={handleSubmitClue}>Submit Clue</button>
    </div>
  );
}
