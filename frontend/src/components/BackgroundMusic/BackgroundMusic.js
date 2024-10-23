import { useContext, useEffect, useReducer } from "react";
import { UserContext } from "../../Context/UserContext";

const BackgroundMusic = ({ setMusicRef }) => {
  const musicRef = useReducer(null);
  const { username } = useContext(UserContext);

  useEffect(() => {
    if (username) {
      musicRef.current = new Audio('/Tetris.mp3');
      musicRef.current.loop = true;
      musicRef.current.volume = 0.5; // Volume par défaut
      musicRef.current.play();

      setMusicRef(musicRef); // Passer la référence à la musique

      return () => {
        if (musicRef.current) {
          musicRef.current.pause();
          musicRef.current.currentTime = 0;
        }
      };
    }
  }, [username, setMusicRef]);

  return null; // Nothing to render
};

export default BackgroundMusic;
