const fs = require("fs");
const path = require("path");

// Read the old cabinet data
const cabinetPath = path.join(__dirname, "..", "data", "cabinets.json");
const data = JSON.parse(fs.readFileSync(cabinetPath, "utf8"));

// Function to convert old animation format to keyframe format
function convertAnimation(oldAnimation) {
  if (!oldAnimation || !oldAnimation.objects) return null;

  // Group objects by timeline (delay + time they appear)
  const timeline = new Map();

  oldAnimation.objects.forEach((obj) => {
    const delay = obj.delay || 0;
    const duration = obj.duration !== undefined ? obj.duration : 1000;

    // Initial keyframe (delay time)
    if (!timeline.has(delay)) {
      timeline.set(delay, { time: delay, objects: [] });
    }

    // Create initial state
    const initialState = {
      name: obj.name,
    };

    // If duration is 0 or undefined with position/rotation/scale, put everything in initial state
    if (duration === 0) {
      if (obj.visible !== undefined) {
        initialState.visible = obj.visible;
      }
      if (obj.position) {
        initialState.position = obj.position;
      }
      if (obj.rotation) {
        initialState.rotation = obj.rotation;
      }
      if (obj.scale) {
        initialState.scale = obj.scale;
      }

      // Only add if there's something to set
      if (Object.keys(initialState).length > 1) {
        timeline.get(delay).objects.push(initialState);
      }
    } else {
      // If there's animation, split into start and end
      // Start state (at delay time) - only visibility
      if (obj.visible !== undefined) {
        timeline.get(delay).objects.push({
          name: obj.name,
          visible: obj.visible,
        });
      }

      // End keyframe (if there's animation duration)
      const endTime = delay + duration;
      if (!timeline.has(endTime)) {
        timeline.set(endTime, {
          time: endTime,
          objects: [],
          easing: obj.easing || "power2.out",
        });
      }

      const endState = {
        name: obj.name,
      };

      if (obj.position) {
        endState.position = obj.position;
      }
      if (obj.rotation) {
        endState.rotation = obj.rotation;
      }
      if (obj.scale) {
        endState.scale = obj.scale;
      }

      if (Object.keys(endState).length > 1) {
        timeline.get(endTime).objects.push(endState);
      }
    }
  });

  // Convert timeline map to sorted array of keyframes
  const keyframes = Array.from(timeline.values())
    .sort((a, b) => a.time - b.time)
    .filter((kf) => kf.objects.length > 0);

  // Convert camera animation
  let camera = null;
  if (oldAnimation.camera) {
    camera = {
      keyframes: [
        {
          time: 0,
          position: oldAnimation.camera.position,
          target: oldAnimation.camera.target,
        },
      ],
    };
  }

  return {
    duration: oldAnimation.duration,
    keyframes,
    ...(camera && { camera }),
  };
}

// Convert all cabinets
data.cabinets.forEach((cabinet) => {
  cabinet.steps.forEach((step) => {
    if (step.animation) {
      step.animation = convertAnimation(step.animation);
    }
  });
});

// Write the converted data back
fs.writeFileSync(cabinetPath, JSON.stringify(data, null, 2), "utf8");
console.log("Converted cabinets.json to keyframe format");
