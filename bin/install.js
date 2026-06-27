#!/usr/bin/env node

/**
 * Claude Skills Installer
 *
 * Usage:
 *   npx @jbts6/claude-skills [options]
 *
 * Options:
 *   --all           Install all skills
 *   --skill <name>  Install specific skill (e.g., godot-rag)
 *   --list          List available skills
 *   --help          Show help
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Available skills
const SKILLS = {
  'godot-rag': {
    description: 'Godot Engine documentation RAG search',
    files: ['godot-rag/'],
    requiresPython: true,
    pythonPackage: 'godot-rag'
  },
  'grill-rounds': {
    description: 'Grill rounds skill',
    files: ['grill-rounds/'],
    requiresPython: false
  }
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ Error: ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function getClaudeSkillsDir() {
  const homeDir = require('os').homedir();
  return path.join(homeDir, '.claude', 'skills');
}

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    info(`Created directory: ${dir}`);
  }
}

function copyDirectory(src, dest) {
  ensureDirectoryExists(dest);

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function installSkill(skillName, skillConfig) {
  const skillsDir = getClaudeSkillsDir();
  const srcDir = __dirname;
  const parentDir = path.dirname(srcDir);

  log(`\nInstalling ${skillName}...`, 'cyan');

  for (const file of skillConfig.files) {
    const srcPath = path.join(parentDir, file);
    const destPath = path.join(skillsDir, file);

    if (!fs.existsSync(srcPath)) {
      warn(`Source not found: ${srcPath}`);
      continue;
    }

    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      ensureDirectoryExists(path.dirname(destPath));
      fs.copyFileSync(srcPath, destPath);
    }
  }

  // Check Python package if required
  if (skillConfig.requiresPython) {
    try {
      execSync(`python3 -c "import ${skillConfig.pythonPackage.replace('-', '_')}"`, { stdio: 'ignore' });
      success(`Python package '${skillConfig.pythonPackage}' is installed`);
    } catch (e) {
      warn(`Python package '${skillConfig.pythonPackage}' not found`);
      info(`Install it with: pip install ${skillConfig.pythonPackage}`);
    }
  }

  success(`Installed ${skillName} to ${skillsDir}`);
}

function listSkills() {
  log('\nAvailable Skills:', 'bright');
  log('================\n');

  for (const [name, config] of Object.entries(SKILLS)) {
    log(`  ${colors.cyan}${name}${colors.reset}`, 'cyan');
    log(`    ${config.description}`);
    if (config.requiresPython) {
      log(`    Requires: pip install ${config.pythonPackage}`, 'yellow');
    }
    log('');
  }
}

function showHelp() {
  log('\nClaude Skills Installer', 'bright');
  log('======================\n');
  log('Usage:');
  log('  npx @jbts6/claude-skills [options]\n');
  log('Options:');
  log('  --all           Install all skills');
  log('  --skill <name>  Install specific skill');
  log('  --list          List available skills');
  log('  --help          Show this help\n');
  log('Examples:');
  log('  npx @jbts6/claude-skills --all');
  log('  npx @jbts6/claude-skills --skill godot-rag');
  log('  npx @jbts6/claude-skills --list');
  log('');
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }

  if (args.includes('--list')) {
    listSkills();
    return;
  }

  if (args.includes('--all')) {
    log('\nInstalling all skills...', 'bright');
    for (const [name, config] of Object.entries(SKILLS)) {
      installSkill(name, config);
    }
    log('\n✨ All skills installed!', 'green');
    return;
  }

  const skillIndex = args.indexOf('--skill');
  if (skillIndex !== -1 && args[skillIndex + 1]) {
    const skillName = args[skillIndex + 1];
    const skillConfig = SKILLS[skillName];

    if (!skillConfig) {
      error(`Unknown skill: ${skillName}`);
    }

    installSkill(skillName, skillConfig);
    return;
  }

  error('Invalid arguments. Use --help for usage information.');
}

main();
