export function normalizeLanguage(language, otherLanguage) {
    if (language === "Other" && otherLanguage) {
        return otherLanguage.trim();
    }
    return language || "English";
}
