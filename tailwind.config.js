import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./suitability-land-for-RE/**/*.html",
    "./suitability-land-for-RE/**/*.{js,ts}",
    "./meet/**/*.{html,js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "surface-container-low": "var(--color-surface-container-low)",
        "primary-container": "var(--color-primary-container)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "outline": "var(--color-outline)",
        "inverse-on-surface": "var(--color-inverse-on-surface)",
        "on-primary": "var(--color-on-primary)",
        "outline-variant": "var(--color-outline-variant)",
        "surface-dim": "var(--color-surface-dim)",
        "on-surface": "var(--color-on-surface)",
        "surface-container-high": "var(--color-surface-container-high)",
        "background": "var(--color-background)",
        "surface-container": "var(--color-surface-container)",
        "on-primary-container": "var(--color-on-primary-container)",
        "surface-tint": "var(--color-surface-tint)",
        "surface-variant": "var(--color-surface-variant)",
        "on-secondary-fixed": "var(--color-on-secondary-fixed)",
        "error": "var(--color-error)",
        "tertiary-fixed": "var(--color-tertiary-fixed)",
        "surface": "var(--color-surface)",
        "inverse-surface": "var(--color-inverse-surface)",
        "primary": "var(--color-primary)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        "on-error": "var(--color-on-error)",
        "primary-fixed": "var(--color-primary-fixed)",
        "on-error-container": "var(--color-on-error-container)",
        "secondary-fixed": "var(--color-secondary-fixed)"
      },
      borderRadius: {
        DEFAULT: "1rem", 
        lg: "0.5rem", 
        xl: "0.75rem", 
        full: "9999px"
      },
      spacing: {
        "section-gap": "120px", 
        base: "8px", 
        "margin-desktop": "64px", 
        "margin-mobile": "20px", 
        gutter: "24px", 
        "container-max": "1280px"
      },
      fontFamily: {
        "display-lg": ["Montserrat", "sans-serif"], 
        "body-lg": ["Montserrat", "sans-serif"], 
        "headline-md": ["Montserrat", "sans-serif"],
        "headline-sm": ["Montserrat", "sans-serif"], 
        "mono-technical": ["Montserrat", "sans-serif"], 
        "body-md": ["Montserrat", "sans-serif"],
        "display-lg-mobile": ["Montserrat", "sans-serif"], 
        "label-caps": ["Montserrat", "sans-serif"], 
        headline: ["Montserrat", "sans-serif"],
        "typewriter": ["Courier Prime", "Courier New", "Courier", "monospace"],
        "montserrat": ["Montserrat", "sans-serif"],
        display: ["Montserrat", "sans-serif"], 
        body: ["Montserrat", "sans-serif"], 
        label: ["Montserrat", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["64px", {lineHeight: "72px", letterSpacing: "-0.02em", fontWeight: "700"}],
        "body-lg": ["18px", {lineHeight: "28px", fontWeight: "400"}],
        "headline-md": ["32px", {lineHeight: "40px", fontWeight: "600"}],
        "headline-sm": ["24px", {lineHeight: "32px", fontWeight: "600"}],
        "mono-technical": ["14px", {lineHeight: "20px", fontWeight: "500"}],
        "body-md": ["16px", {lineHeight: "24px", fontWeight: "400"}],
        "display-lg-mobile": ["40px", {lineHeight: "48px", letterSpacing: "-0.01em", fontWeight: "700"}],
        "label-caps": ["12px", {lineHeight: "16px", letterSpacing: "0.1em", fontWeight: "600"}]
      }
    }
  },
  plugins: [
    typography,
    forms,
    containerQueries
  ],
}
