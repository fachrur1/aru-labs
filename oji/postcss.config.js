// OJI uses plain CSS with design tokens, not Tailwind. This local config
// overrides the repo-root PostCSS config (which would otherwise be inherited
// and inject Tailwind with an empty content list).
export default {
  plugins: {
    autoprefixer: {},
  },
};
