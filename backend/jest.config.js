// jest.config.js

module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: [
    "json",
    "text",
    "lcov"
  ],
  collectCoverageFrom: [
    "models/**/*.js",
    "sockets/**/*.js"
  ]
};