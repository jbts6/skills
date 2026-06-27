#!/usr/bin/env node

/**
 * Multi-Platform AI Skills Installer
 *
 * Usage:
 *   npx @jbts6/claude-skills [options]
 *
 * Options:
 *   --all           Install all skills
 *   --skill <name>  Install specific skill (e.g., godot-rag)
 *   --target <name> Install to specific target (claude, codex, opencode, all)
 *   --list          List available skills
 *   --interactive   Interactive mode (default when no args)
 *   --help          Show help
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Available skills
const SKILLS = {
  'godot-rag': {
    description: 'Godot Engine documentation RAG search',
    files: ['godot-rag/'],
    requiresPython: true,
    pythonPackage: 'godot-rag'
  },
  'grill-rounds': {
    description: 'Multi-round, multi-session GDD/design document grilling protocol',
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

// Supported targets and their skill directories
const TARGETS = {
  claude: {
    name: 'Claude Code',
    getDir: () => path.join(require('os').homedir(), '.claude', 'skills'),
    marker: 'SKILL.md'
  },
  codex: {
    name: 'Codex',
    getDir: () => path.join(require('os').homedir(), '.codex', 'skills'),
    marker: 'SKILL.md'
  },
  opencode: {
    name: 'OpenCode',
    getDir: () => path.join(require('os').homedir(), '.opencode', 'skills'),
    marker: 'SKILL.md'
  }
};

function getSkillsDir(target = 'claude') {
  const targetConfig = TARGETS[target];
  if (!targetConfig) {
    error(`Unknown target: ${target}. Available: ${Object.keys(TARGETS).join(', ')}`);
  }
  return targetConfig.getDir();
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

function installSkill(skillName, skillConfig, targets = ['claude']) {
  const srcDir = __dirname;
  const parentDir = path.dirname(srcDir);

  log(`\nInstalling ${skillName}...`, 'cyan');

  for (const target of targets) {
    const skillsDir = getSkillsDir(target);
    const targetName = TARGETS[target].name;

    log(`  → ${targetName}: ${skillsDir}`, 'cyan');

    for (const file of skillConfig.files) {
      const srcPath = path.join(parentDir, file);
      const destPath = path.join(skillsDir, file);

      if (!fs.existsSync(srcPath)) {
        warn(`  Source not found: ${srcPath}`);
        continue;
      }

      if (fs.statSync(srcPath).isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        ensureDirectoryExists(path.dirname(destPath));
        fs.copyFileSync(srcPath, destPath);
      }
    }

    success(`  Installed ${skillName} to ${targetName}`);
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

// Interactive prompt helpers
function createReadline() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function prompt(question) {
  const rl = createReadline();
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function promptSelect(message, choices, multi = false) {
  log(`\n${message}`, 'bright');
  log('='.repeat(message.length), 'bright');

  choices.forEach((choice, index) => {
    const prefix = multi ? `[${choice.checked ? 'x' : ' '}]` : `${index + 1}.`;
    const indicator = choice.detected ? ' (detected)' : '';
    log(`  ${prefix} ${choice.name}${indicator}`);
  });

  if (multi) {
    log('\n  Tips: Enter numbers separated by commas (e.g., 1,3), "a" for all, "i" to invert', 'dim');
  }

  return choices;
}

async function promptSelectSingle(message, choices) {
  promptSelect(message, choices, false);

  while (true) {
    const answer = await prompt('\nSelect (number or name): ');

    // Check if input is a number
    const num = parseInt(answer);
    if (!isNaN(num) && num >= 1 && num <= choices.length) {
      return choices[num - 1].value;
    }

    // Check if input matches a choice name/value
    const match = choices.find(c =>
      c.value.toLowerCase() === answer.toLowerCase() ||
      c.name.toLowerCase() === answer.toLowerCase()
    );
    if (match) {
      return match.value;
    }

    log('Invalid selection. Please try again.', 'red');
  }
}

async function promptSelectMultiple(message, choices) {
  // Initialize checked state
  let items = choices.map(c => ({ ...c, checked: c.checked || false }));

  const displayItems = () => {
    promptSelect(message, items, true);
  };

  displayItems();

  while (true) {
    const answer = await prompt('\nSelect (numbers, "a" all, "i" invert, "d" done): ');

    if (answer.toLowerCase() === 'd' || answer === '') {
      const selected = items.filter(i => i.checked);
      if (selected.length === 0) {
        log('Please select at least one option.', 'red');
        continue;
      }
      return selected.map(i => i.value);
    }

    if (answer.toLowerCase() === 'a') {
      const allChecked = items.every(i => i.checked);
      items = items.map(i => ({ ...i, checked: !allChecked }));
      displayItems();
      continue;
    }

    if (answer.toLowerCase() === 'i') {
      items = items.map(i => ({ ...i, checked: !i.checked }));
      displayItems();
      continue;
    }

    // Parse comma-separated numbers
    const numbers = answer.split(',').map(s => s.trim());
    let valid = true;

    for (const numStr of numbers) {
      const num = parseInt(numStr);
      if (isNaN(num) || num < 1 || num > items.length) {
        log(`Invalid number: ${numStr}`, 'red');
        valid = false;
        break;
      }
    }

    if (valid) {
      for (const numStr of numbers) {
        const num = parseInt(numStr);
        items[num - 1].checked = !items[num - 1].checked;
      }
      displayItems();
    }
  }
}

function showHelp() {
  log('\nMulti-Platform AI Skills Installer', 'bright');
  log('==================================\n');
  log('Usage:');
  log('  npx @jbts6/claude-skills [options]\n');
  log('Options:');
  log('  --all              Install all skills');
  log('  --skill <name>     Install specific skill');
  log('  --target <name>    Install to specific target (claude, codex, opencode, all)');
  log('  --list             List available skills');
  log('  --interactive      Interactive mode (default when no args)');
  log('  --help             Show this help\n');
  log('Targets:');
  log('  claude             Claude Code (default)');
  log('  codex              OpenAI Codex');
  log('  opencode           OpenCode');
  log('  all                All supported platforms\n');
  log('Examples:');
  log('  npx @jbts6/claude-skills                    # Interactive mode');
  log('  npx @jbts6/claude-skills --all              # Install all to Claude Code');
  log('  npx @jbts6/claude-skills --skill godot-rag  # Install specific skill');
  log('  npx @jbts6/claude-skills --skill godot-rag --target codex');
  log('  npx @jbts6/claude-skills --all --target all # Install all to all platforms');
  log('  npx @jbts6/claude-skills --list             # List available skills');
  log('');
}

function parseTargets(args) {
  const targetIndex = args.indexOf('--target');
  if (targetIndex === -1 || !args[targetIndex + 1]) {
    return ['claude']; // Default to Claude Code
  }

  const target = args[targetIndex + 1];
  if (target === 'all') {
    return Object.keys(TARGETS);
  }

  if (!TARGETS[target]) {
    error(`Unknown target: ${target}. Available: ${Object.keys(TARGETS).join(', ')}`);
  }

  return [target];
}

async function interactiveMode() {
  const BANNER = `
  ╔═══════════════════════════════════════════════════╗
  ║     Multi-Platform AI Skills Installer            ║
  ║     Claude Code • Codex • OpenCode                ║
  ╚═══════════════════════════════════════════════════╝
`;
  log(BANNER, 'cyan');

  // Step 1: Select skills
  const skillChoices = Object.entries(SKILLS).map(([name, config]) => ({
    name: `${name} - ${config.description}`,
    value: name,
    checked: false,
    detected: false
  }));

  const selectedSkills = await promptSelectMultiple(
    'Select skills to install:',
    skillChoices
  );

  // Step 2: Select targets
  const detectedPlatforms = detectInstalledPlatforms();
  const targetChoices = Object.entries(TARGETS).map(([id, config]) => ({
    name: config.name,
    value: id,
    checked: detectedPlatforms.has(id),
    detected: detectedPlatforms.has(id)
  }));

  const selectedTargets = await promptSelectMultiple(
    'Select target platforms:',
    targetChoices
  );

  // Step 3: Confirm
  log('\n📋 Installation Summary:', 'bright');
  log('─'.repeat(40));
  log('Skills:', 'cyan');
  selectedSkills.forEach(s => log(`  • ${s}`));
  log('\nTargets:', 'cyan');
  selectedTargets.forEach(t => log(`  • ${TARGETS[t].name}`));
  log('─'.repeat(40));

  const confirm = await prompt('\nProceed with installation? (Y/n): ');
  if (confirm.toLowerCase() === 'n') {
    log('Installation cancelled.', 'yellow');
    return;
  }

  // Step 4: Install
  log('\n🚀 Installing...', 'bright');
  for (const skillName of selectedSkills) {
    const skillConfig = SKILLS[skillName];
    installSkill(skillName, skillConfig, selectedTargets);
  }

  log('\n✨ Installation complete!', 'green');
}

function detectInstalledPlatforms() {
  const detected = new Set();
  const homeDir = require('os').homedir();

  for (const [id, config] of Object.entries(TARGETS)) {
    const dir = config.getDir();
    if (fs.existsSync(dir)) {
      detected.add(id);
    }
  }

  return detected;
}

function main() {
  const args = process.argv.slice(2);

  // Default to interactive mode when no args
  if (args.length === 0 || args.includes('--interactive')) {
    interactiveMode().catch(err => {
      error(`Interactive mode failed: ${err.message}`);
    });
    return;
  }

  if (args.includes('--help')) {
    showHelp();
    return;
  }

  if (args.includes('--list')) {
    listSkills();
    return;
  }

  const targets = parseTargets(args);

  if (args.includes('--all')) {
    log('\nInstalling all skills...', 'bright');
    for (const [name, config] of Object.entries(SKILLS)) {
      installSkill(name, config, targets);
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

    installSkill(skillName, skillConfig, targets);
    return;
  }

  error('Invalid arguments. Use --help for usage information.');
}

main();
