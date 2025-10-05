#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Icon name mappings for kebab-case conversion
const iconMappings = {
  'ChevronDown': 'chevron-down',
  'ChevronUp': 'chevron-up', 
  'MessageCircle': 'message-circle',
  'ExternalLink': 'external-link',
  'EyeOff': 'eye-off',
  'CheckCircle': 'check-circle',
  'ArrowLeft': 'arrow-left',
  'ChevronLeft': 'chevron-left',
  'ChevronRight': 'chevron-right',
  'TrendingUp': 'trending-up',
  'MapPin': 'map-pin',
  'CreditCard': 'credit-card',
  'DollarSign': 'dollar-sign',
  'ShoppingBag': 'shopping-bag',
  'AlertCircle': 'alert-circle',
  'RefreshCw': 'refresh-cw',
  'ChefHat': 'chef-hat'
};

function convertToCamelCase(str) {
  return iconMappings[str] || str.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '');
}

function fixLucideImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find lucide-react import statements
  const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]lucide-react['"];?/g;
  
  let newContent = content;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const iconsString = match[1];
    
    // Parse individual icons
    const icons = iconsString.split(',').map(icon => icon.trim());
    
    // Generate individual imports
    const individualImports = icons.map(icon => {
      const kebabCase = convertToCamelCase(icon);
      return `import ${icon} from 'lucide-react/dist/esm/icons/${kebabCase}';`;
    }).join('\n');
    
    // Replace the bulk import with individual imports
    newContent = newContent.replace(fullMatch, individualImports);
  }
  
  // Write back if changed
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Find all relevant files
const patterns = [
  'apps/**/*.{js,jsx,ts,tsx}',
  'packages/**/*.{js,jsx,ts,tsx}'
];

let totalFixed = 0;

patterns.forEach(pattern => {
  const files = glob.sync(pattern, { cwd: __dirname });
  
  files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fixLucideImports(fullPath)) {
      totalFixed++;
    }
  });
});

console.log(`\n✅ Fixed ${totalFixed} files with lucide-react imports`);
