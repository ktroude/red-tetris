import React, { createContext, useState } from 'react';

export const GamemodeContext = createContext();

export const GamemodeProvider = ({ children }) => {
    const [gamemode, setGamemode] = useState("CLASSIC");

    const GamemodeType = ["CLASSIC", "GRAVITY"];

    return (
        <GamemodeContext.Provider value={{ gamemode, setGamemode, GamemodeType }}>
            {children}
        </GamemodeContext.Provider>
    );
};
