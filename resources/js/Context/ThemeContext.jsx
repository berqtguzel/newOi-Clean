import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const ThemeContext = createContext({
    theme: "light",
    setTheme: (_t) => {},
    toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children, initial = "system" }) => {
    const getInitial = () => {
        if (typeof window === "undefined") {
            return initial === "dark" ? "dark" : "light";
        }

        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") return saved;
        if (
            initial === "dark" ||
            (initial === "system" &&
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            return "dark";
        }
        return "light";
    };

    const [theme, setThemeState] = useState(getInitial);

    useEffect(() => {
        if (typeof document === "undefined") return;
        const root = document.documentElement;
        const isDark = theme === "dark";
        root.classList.toggle("dark", isDark);

        root.style.colorScheme = isDark ? "dark" : "light";
        try {
            localStorage.setItem("theme", theme);
        } catch {}
    }, [theme]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => {
            const saved = localStorage.getItem("theme");
            if (!saved || saved === "system") {
                setThemeState(mq.matches ? "dark" : "light");
            }
        };
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);

    const setTheme = (next) => {
        if (next !== "light" && next !== "dark") return;
        setThemeState(next);
        try {
            localStorage.setItem("theme", next);
        } catch {}
    };

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};
