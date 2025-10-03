/**
 * Debug utility to check if custom Tailwind colors are properly loaded
 * Use this in browser console to diagnose CSS issues
 */

export const debugTailwindColors = () => {
  console.log('🎨 Debugging Tailwind Custom Colors');
  
  // Create a test element to check computed styles
  const testDiv = document.createElement('div');
  testDiv.style.position = 'absolute';
  testDiv.style.left = '-9999px';
  testDiv.style.top = '-9999px';
  document.body.appendChild(testDiv);
  
  const colorsToTest = [
    'bg-grub-red',
    'bg-grub-red-light', 
    'bg-grub-red-dark',
    'text-grub-red',
    'from-grub-red',
    'to-grub-red-dark'
  ];
  
  const results = {};
  
  colorsToTest.forEach(colorClass => {
    testDiv.className = colorClass;
    const computedStyle = window.getComputedStyle(testDiv);
    
    if (colorClass.startsWith('bg-')) {
      results[colorClass] = {
        backgroundColor: computedStyle.backgroundColor,
        isCustomColor: computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && computedStyle.backgroundColor !== 'transparent'
      };
    } else if (colorClass.startsWith('text-')) {
      results[colorClass] = {
        color: computedStyle.color,
        isCustomColor: computedStyle.color !== 'rgb(0, 0, 0)' && computedStyle.color !== 'rgba(0, 0, 0, 0)'
      };
    } else if (colorClass.startsWith('from-') || colorClass.startsWith('to-')) {
      results[colorClass] = {
        backgroundImage: computedStyle.backgroundImage,
        isCustomColor: computedStyle.backgroundImage !== 'none'
      };
    }
  });
  
  // Clean up
  document.body.removeChild(testDiv);
  
  console.table(results);
  
  // Check if any custom colors are missing
  const missingColors = Object.entries(results).filter(([_, value]) => !value.isCustomColor);
  
  if (missingColors.length > 0) {
    console.error('❌ Missing custom colors:', missingColors.map(([key]) => key));
    console.log('💡 This suggests CSS purging removed your custom colors');
  } else {
    console.log('✅ All custom colors are properly loaded');
  }
  
  return results;
};

// Auto-run in development
if (import.meta.env.DEV) {
  window.debugTailwindColors = debugTailwindColors;
  console.log('🔧 Debug utility loaded. Run debugTailwindColors() in console to test colors.');
}
