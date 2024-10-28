import { useContext, useEffect, useReducer } from "react";
import { UserContext } from "../../Context/UserContext";

const BackgroundMusic = () => {
  const musicRef = useReducer(null);
  const { username } = useContext(UserContext);  // Retrieve username from UserContext

  useEffect(() => {
    if (username) {
      // Create a new audio element
      musicRef.current = new Audio('/Tetris.mp3');
      musicRef.current.loop = true; // Loop the music
      musicRef.current.volume = 0.5; // Set the volume to 50%
      musicRef.current.play();
      
      // Clean up function
      return () => {
        if (musicRef.current) {
          musicRef.current.pause();
          musicRef.current.currentTime = 0;
        }
      };
    }
    }, [username]);
    
    return null; // nothing to render
};

export default BackgroundMusic;

