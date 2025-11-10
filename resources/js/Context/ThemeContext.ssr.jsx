import React, { createContext, useContext, useMemo } from "react";

/**
 * SSR sırasında window/localStorage olmadığından ve
 * bazı hook'lar client'a özel olduğundan,
 * minimal ve güvenli bir ThemeProvider sağlıyoruz.
 */
const ThemeContext = createContext({
    theme: "light",
    setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/**
 * SSR-safe Provider: değerleri sabit tutar, throw ETMEZ.
 */
export const ThemeProvider = ({ children, initial = "light" }) => {
    const value = useMemo(
        () => ({ theme: initial, setTheme: () => {} }),
        [initial]
    );
    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};
