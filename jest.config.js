module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'babel-jest',
    '^.+\\.tsx$': 'babel-jest',
  },
  transformIgnorePatterns: [
    "/node_modules/(?!@nestjs/common).+\\.js$" // Asegúrate de que Jest no ignore los módulos de NestJS
  ],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};