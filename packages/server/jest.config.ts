export default {
    roots: ["./src", "./test"],
    collectCoverageFrom: ["./src/**/*.ts"],
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    moduleDirectories: ["<rootDir>", "node_modules"],
    testTimeout: 30000,
};
