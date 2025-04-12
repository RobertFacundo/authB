module.exports = {
  preset: 'ts-jest',  // Usar ts-jest como preset
  testEnvironment: 'node',  // Establece el entorno de prueba en Node
  transform: {
    '^.+\\.ts$': 'ts-jest',  // Transforma archivos .ts con ts-jest
    '^.+\\.tsx$': 'ts-jest', // Transforma archivos .tsx con ts-jest
  },
  moduleFileExtensions: ['ts', 'js', 'json'],  // Extensiones de archivo que Jest reconocerá
  testPathIgnorePatterns: ['/node_modules/'], // Ignorar node_modules
  transformIgnorePatterns: ['/node_modules/'], // Ignorar transformaciones en node_modules
  collectCoverageFrom: ['**/*.(ts|tsx)'], // Incluir archivos .ts y .tsx en la cobertura
  coverageDirectory: './coverage',  // Carpeta donde se guardarán los informes de cobertura
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',          // Mapea el alias src/* a la ruta real
  },
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.json',              // Asegúrate de que Jest use tu tsconfig
  //   },
  // },
};