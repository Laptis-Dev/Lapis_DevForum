"use strict";
function applySystemTheme() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}
function applySystemPreferences() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-contrast', isHighContrast ? 'high' : 'normal');
}
applySystemTheme();
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
if (darkModeMediaQuery.addEventListener) {
    darkModeMediaQuery.addEventListener('change', applySystemTheme);
}
else {
    darkModeMediaQuery.addListener(applySystemTheme);
}
