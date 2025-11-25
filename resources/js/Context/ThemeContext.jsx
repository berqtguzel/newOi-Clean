import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const ThemeContext = createContext({
    theme: "light",
    setTheme: () => {},
    toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children, initial = "system" }) => {
    // SSR == client aynı render başlar
    const [theme, setTheme] = useState("light");

    // Client'ta theme güncellenir
    useEffect(() => {
        const saved = localStorage.getItem("theme");

        if (saved === "light" || saved === "dark") {
            setTheme(saved);
        } else if (initial === "dark") {
            setTheme("dark");
        } else if (
            initial === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
            setTheme("dark");
        }
    }, []);

    // HTML class güncelle
    useEffect(() => {
        const root = document.documentElement;
        const isDark = theme === "dark";
        root.classList.toggle("dark", isDark);
        root.style.colorScheme = isDark ? "dark" : "light";

        try {
            localStorage.setItem("theme", theme);
        } catch {}
    }, [theme]);

    const setThemeSafe = (next) => {
        if (next !== "light" && next !== "dark") return;
        setTheme(next);
        localStorage.setItem("theme", next);
    };

    const value = useMemo(
        () => ({
            theme,
            setTheme: setThemeSafe,
            toggleTheme: () =>
                setThemeSafe(theme === "dark" ? "light" : "dark"),
        }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};
