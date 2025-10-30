module.exports = {
  extends: ["next", "next/core-web-vitals"],
  rules: {
    // Disable problematic rules for production build
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/rules-of-hooks": "error",
    "@next/next/no-img-element": "off"
  }
}