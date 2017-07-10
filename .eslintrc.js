module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "browser": true,
        "jquery": true,
        "mocha": true
    },
    "globals": {
        "angular": 1
    },
    "extends": "eslint:recommended",
    "rules": {
        "no-unused-vars": [
            "error",
            {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_"
            }
        ],
        "no-console": 0,
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "camelcase": 1,
        "brace-style": [
          1,
          "1tbs"
        ],
        "block-spacing": [
          1,
          "always"
        ],
        "array-bracket-spacing": [
          1,
          "always"
        ]
    }
};
