module.exports = ctx => ({
  plugins: {
    "postcss-easy-media-query": {
      breakpoints: {
        mobile: 380,
        tablet: 600,
        desktop: 1024
      }
    },
    "postcss-text-remove-gap": {
      defaultFontFamily: "Open Sans",
      defaultLineHeight: "0"
    },
    "postcss-nested": {},
    "postcss-sorting": {
      order: ["custom-properties", "dollar-variables", "declarations", "at-rules", "rules"],
      "properties-order": "alphabetical",
      "unspecified-properties-position": "bottom"
    },
    "postcss-utilities": {},
    "postcss-cssnext": {}
  }
});

// "postcss-nested": {},
// "postcss-sorting": {
//   order: ["custom-properties", "dollar-variables", "declarations", "at-rules", "rules"],
//   "properties-order": "alphabetical",
//   "unspecified-properties-position": "bottom"
// },
// "postcss-utilities": {},
// "postcss-cssnext": {}
