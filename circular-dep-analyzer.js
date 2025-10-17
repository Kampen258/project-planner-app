#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Analysis results
const dependencies = {};
const circularDeps = [];
const analysisLog = [];

function log(message) {
    console.log(message);
    analysisLog.push(message);
}

function extractImports(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const imports = [];

        // Match various import patterns
        const importPatterns = [
            /import\s+.*?\s+from\s+['"](\..*?)['"]/g,  // Relative imports
            /import\s+['"](\..*?)['"]/g,              // Direct imports
            /import\(.*?['"](\..*?)['"]\)/g           // Dynamic imports
        ];

        importPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                imports.push(match[1]);
            }
        });

        return imports;
    } catch (error) {
        log(`Error reading ${filePath}: ${error.message}`);
        return [];
    }
}

function resolveImportPath(fromFile, importPath) {
    const fromDir = path.dirname(fromFile);
    let resolvedPath = path.resolve(fromDir, importPath);

    // Try different extensions
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
    for (const ext of extensions) {
        const fullPath = resolvedPath + ext;
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            return fullPath;
        }
    }

    // Try index files
    for (const ext of extensions.slice(1)) {
        const indexPath = path.join(resolvedPath, `index${ext}`);
        if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
            return indexPath;
        }
    }

    return null;
}

function findCircularDependencies(startFile, visited = new Set(), stack = []) {
    if (stack.includes(startFile)) {
        // Found a cycle
        const cycleStart = stack.indexOf(startFile);
        const cycle = [...stack.slice(cycleStart), startFile];
        return [cycle];
    }

    if (visited.has(startFile)) {
        return [];
    }

    visited.add(startFile);
    const newStack = [...stack, startFile];
    let allCycles = [];

    const deps = dependencies[startFile] || [];
    for (const dep of deps) {
        const cycles = findCircularDependencies(dep, visited, newStack);
        allCycles = allCycles.concat(cycles);
    }

    return allCycles;
}

function analyzeProject() {
    const srcDir = path.join(__dirname, 'src');
    const allFiles = [];

    function collectFiles(dir) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                collectFiles(fullPath);
            } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
                allFiles.push(fullPath);
            }
        }
    }

    collectFiles(srcDir);

    log(`Found ${allFiles.length} TypeScript/JavaScript files to analyze`);

    // Build dependency graph
    for (const file of allFiles) {
        const imports = extractImports(file);
        const resolvedImports = [];

        for (const imp of imports) {
            const resolved = resolveImportPath(file, imp);
            if (resolved && allFiles.includes(resolved)) {
                resolvedImports.push(resolved);
            }
        }

        dependencies[file] = resolvedImports;
    }

    log('\n=== DEPENDENCY ANALYSIS ===');

    // Find circular dependencies
    const visited = new Set();
    const allCycles = [];

    for (const file of allFiles) {
        if (!visited.has(file)) {
            const cycles = findCircularDependencies(file);
            allCycles.push(...cycles);
        }
    }

    // Remove duplicate cycles
    const uniqueCycles = [];
    for (const cycle of allCycles) {
        const normalizedCycle = cycle.slice(); // Copy cycle
        const minIndex = normalizedCycle.indexOf(Math.min(...normalizedCycle.map(f => allFiles.indexOf(f))));
        const rotatedCycle = normalizedCycle.slice(minIndex).concat(normalizedCycle.slice(0, minIndex));

        const cycleKey = rotatedCycle.join('->');
        if (!uniqueCycles.some(existing => existing.join('->') === cycleKey)) {
            uniqueCycles.push(rotatedCycle);
        }
    }

    if (uniqueCycles.length === 0) {
        log('✅ No circular dependencies found!');
    } else {
        log(`❌ Found ${uniqueCycles.length} circular dependency chains:`);

        uniqueCycles.forEach((cycle, index) => {
            log(`\n🔄 Circular Dependency ${index + 1}:`);
            const relativePaths = cycle.map(f => path.relative(__dirname, f));

            for (let i = 0; i < cycle.length; i++) {
                const current = relativePaths[i];
                const next = relativePaths[(i + 1) % cycle.length];
                log(`   ${current}`);
                if (i < cycle.length - 1) {
                    log(`   └─ imports from ─>`);
                }
            }

            // Show specific import statements
            log('\n   Specific imports:');
            for (let i = 0; i < cycle.length - 1; i++) {
                const currentFile = cycle[i];
                const nextFile = cycle[i + 1];
                const currentContent = fs.readFileSync(currentFile, 'utf8');

                // Find the specific import line
                const lines = currentContent.split('\n');
                const relativePath = path.relative(path.dirname(currentFile), nextFile).replace(/\.(ts|tsx|js|jsx)$/, '');

                lines.forEach((line, lineNum) => {
                    if (line.includes(`from '${relativePath}'`) ||
                        line.includes(`from "${relativePath}"`) ||
                        line.includes(`'${relativePath}'`) ||
                        line.includes(`"${relativePath}"`)) {
                        log(`   Line ${lineNum + 1} in ${path.relative(__dirname, currentFile)}: ${line.trim()}`);
                    }
                });
            }
        });
    }

    // Analysis summary
    log('\n=== SUMMARY ===');
    log(`Total files analyzed: ${allFiles.length}`);
    log(`Files with dependencies: ${Object.keys(dependencies).filter(f => dependencies[f].length > 0).length}`);
    log(`Circular dependency chains found: ${uniqueCycles.length}`);

    // Top files with most dependencies
    const filesByDepCount = Object.entries(dependencies)
        .map(([file, deps]) => ({ file, count: deps.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    log('\n=== FILES WITH MOST DEPENDENCIES ===');
    filesByDepCount.forEach(({ file, count }) => {
        if (count > 0) {
            log(`${count} deps: ${path.relative(__dirname, file)}`);
        }
    });

    return uniqueCycles;
}

// Run the analysis
const cycles = analyzeProject();

// Write results to file
fs.writeFileSync(
    path.join(__dirname, 'circular-dependency-analysis.txt'),
    analysisLog.join('\n')
);

log('\n📝 Full analysis saved to circular-dependency-analysis.txt');

// Exit with error code if circular dependencies found
process.exit(cycles.length > 0 ? 1 : 0);