const fs = require("fs");
const path = require("path");

// Read all cabinet files from data/cabinets/
const cabinetsDir = path.join(__dirname, "..", "data", "cabinets");
const files = fs.readdirSync(cabinetsDir).filter((f) => f.endsWith(".json"));

console.log(`Found ${files.length} cabinet file(s)`);

// Extract metadata from each cabinet
const cabinets = files.map((file) => {
  const filePath = path.join(cabinetsDir, file);
  const cabinet = JSON.parse(fs.readFileSync(filePath, "utf8"));

  return {
    id: cabinet.id,
    name: cabinet.name,
    category: cabinet.category,
    estimatedTime: cabinet.estimatedTime,
    image: cabinet.image,
    model: cabinet.model,
    description: cabinet.description,
    stepCount: cabinet.steps?.length || 0,
  };
});

// Sort by ID
cabinets.sort((a, b) => a.id.localeCompare(b.id));

// Write index file
const indexPath = path.join(__dirname, "..", "data", "cabinets-index.json");
fs.writeFileSync(indexPath, JSON.stringify({ cabinets }, null, 2), "utf8");

console.log("✅ Generated cabinets-index.json");
console.log(`   ${cabinets.length} cabinet(s) indexed`);
cabinets.forEach((c) => {
  console.log(`   - ${c.id}: ${c.stepCount} step(s)`);
});
