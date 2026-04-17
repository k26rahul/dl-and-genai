const fs = require('fs');
const path = require('path');

const srcPath = 'c:/k26rahul/Code/Work/dl-and-genai/viz/src/visualizations/real-world-neural-network-training.jsx';
const dirPath = 'c:/k26rahul/Code/Work/dl-and-genai/viz/src/visualizations/real-world-neural-network-training';

if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

const content = fs.readFileSync(srcPath, 'utf-8');
const lines = content.split('\n');

// 1. Extract Educational Section
// Starts exactly at line 1230: {/* ========================================== */} (Wait, 1230 from view_file, let's grep lines 1229-1234)
// Let's do a reliable string match instead of lines array
const edStartToken = "{/* ========================================== */}";
const edContentToken = "EDUCATIONAL SECTION (Order 4 Mobile, Full)";

const parts = content.split(edContentToken);
// The start of the comment block is just before it
const chunk1 = parts[0];
const blockStartIndex = chunk1.lastIndexOf("{/* ========================================== */}");

const beforeEduSection = content.substring(0, blockStartIndex);
const eduSectionAndAfter = content.substring(blockStartIndex);

// End of edu section is right before the final closing tags
const tailIndex = eduSectionAndAfter.lastIndexOf("      </div>\n    </div>\n  );\n}");
const educationalMarkup = eduSectionAndAfter.substring(0, tailIndex);

fs.writeFileSync(path.join(dirPath, 'educational-section.jsx'), 
`import React from 'react';\n\nexport default function EducationalSection() {\n  return (\n    <>\n${educationalMarkup.trimRight()}\n    </>\n  );\n}\n`);


// 2. Extract Visualization
// We want to strip the outer layout
// The return block starts at:  return (\n    <div className='min-h-screen bg-slate-50
// And the inner wrapper is  <div className='max-w-7xl mx-auto'>
// Let's just find the first <div className='flex flex-col lg:grid ...'>
const gridStartToken = "<div className='flex flex-col lg:grid lg:grid-cols-12 gap-3 md:gap-5 mb-4 md:mb-6'>";
let gridStartIndex = beforeEduSection.lastIndexOf(gridStartToken);

// But we also have a Header! "Real-World Neural Network Training"
const headerStartToken = "{/* Header */}";
let headerStartIndex = beforeEduSection.lastIndexOf(headerStartToken);

// Let's keep Visualization exactly as the original component, but swap out the end return block to only return its children.
// Wait, actually, the user said "The entire visualization code should be separate". That means the states, variables, and the grid!
// If we just cut `educationalMarkup`, and then wrap it in the 3rd file, NO, the states won't be accessible to the 3rd file. But the 3rd file doesn't need states!

// Let's replace the outer layout of Visualization.
let vizContent = beforeEduSection + "\n          </div>\n    </>\n  );\n}\n";

// Replace empty state spinner wrappers
vizContent = vizContent.replace(
  /<div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-500'>/,
  "<div className='flex flex-col items-center justify-center gap-3 text-slate-500 py-20'>"
);

// We need to replace the `return (\n    <div className='min-h-screen...` 
// with `return (\n <>\n `
const returnStartStr = "  return (\n    <div className='min-h-screen bg-slate-50 text-slate-800 p-2 md:p-4 font-sans'>\n      <div className='max-w-7xl mx-auto'>\n        {/* Header */}";
const headerReplacement = "  return (\n    <>\n        {/* Header */}";

if(vizContent.includes(returnStartStr)) {
    vizContent = vizContent.replace(returnStartStr, headerReplacement);
} else {
    // maybe spacings differ, let's just use regex
    vizContent = vizContent.replace(
      /return \(\s*<div className='min-h-screen[^>]*>\s*<div className='max-w-7xl[^>]*>/,
      "return (\n    <>"
    );
}

vizContent = vizContent.replace(
  "export default function RealWorldNeuralNetworkTraining() {",
  "export default function Visualization() {"
);

fs.writeFileSync(path.join(dirPath, 'visualization.jsx'), vizContent);

// 3. Create index.jsx
// It imports Visualization and EducationalSection
const indexContent = `import React from 'react';
import Visualization from './visualization';
import EducationalSection from './educational-section';

export default function RealWorldNeuralNetworkTraining() {
  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-2 md:p-4 font-sans'>
      <div className='max-w-7xl mx-auto'>
        <Visualization />
        <EducationalSection />
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(dirPath, 'index.jsx'), indexContent);

// 4. Update the main routing file
const routerPath = 'c:/k26rahul/Code/Work/dl-and-genai/viz/src/visualizations.js';
let routerContent = fs.readFileSync(routerPath, 'utf-8');
routerContent = routerContent.replace(
  "import RealWorldNNTraining from './visualizations/real-world-neural-network-training.jsx'",
  "import RealWorldNNTraining from './visualizations/real-world-neural-network-training/index.jsx'"
);
fs.writeFileSync(routerPath, routerContent);

console.log("Refactoring complete");
