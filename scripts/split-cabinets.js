const fs = require("fs");
const path = require("path");

// Read the original cabinets.json
const cabinetsPath = path.join(__dirname, "..", "data", "cabinets.json");
const data = JSON.parse(fs.readFileSync(cabinetsPath, "utf8"));

// Create cabinets directory
const cabinetsDir = path.join(__dirname, "..", "data", "cabinets");
if (!fs.existsSync(cabinetsDir)) {
  fs.mkdirSync(cabinetsDir, { recursive: true });
}

// Create index file with just metadata
const index = {
  cabinets: data.cabinets.map((cabinet) => ({
    id: cabinet.id,
    name: cabinet.name,
    category: cabinet.category,
    estimatedTime: cabinet.estimatedTime,
    image: cabinet.image,
    model: cabinet.model,
    description: cabinet.description,
    stepCount: cabinet.steps.length,
  })),
};

// Write index file
fs.writeFileSync(
  path.join(__dirname, "..", "data", "cabinets-index.json"),
  JSON.stringify(index, null, 2),
  "utf8"
);

// Write individual cabinet files
data.cabinets.forEach((cabinet) => {
  const cabinetFile = path.join(cabinetsDir, `${cabinet.id}.json`);
  fs.writeFileSync(cabinetFile, JSON.stringify(cabinet, null, 2), "utf8");
  console.log(`Created ${cabinet.id}.json`);
});

console.log("\nCabinet files split successfully!");
console.log("- Created cabinets-index.json (metadata only)");
console.log(
  `- Created ${data.cabinets.length} individual cabinet file(s) in data/cabinets/`
);
