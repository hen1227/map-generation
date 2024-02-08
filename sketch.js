// sketch.js
let tileSize = 9;

let numberOfRooms = 60;

let roomRangeMin = 4;
let roomRangeMax = 12;

let initialRoom;
let rooms = [];
let transitionQueue = [];
let failedTransitions = [];
let hallways = [];

let possibleRooms = [];

function setup() {
  createCanvas(800, 800);
  // frameRate(10); // Slow down the frame rate

  initialRoom = Room.initial();
  rooms.push(initialRoom);
  transitionQueue.push(...initialRoom.getAllTransitions());

  let room = Room.generate()
  for(let i = 0; i < numberOfRooms; i++){
    possibleRooms.push(room.copy())
  }
}

function draw() {
  background(17.85);

  // Draw all rooms
  for (let room of rooms) {
    room.draw();
  }

  // Try to add a new room at each frame from the queue
  if (transitionQueue.length > 0) {
    let currentTransition = transitionQueue.shift();

    if (possibleRooms.length === 0) {
        console.log("No more rooms to add");
      failedTransitions.push(...transitionQueue);
      transitionQueue = [];
        return;
    }
    // Take the index item and remove from the array
    let index = floor(Math.random() * possibleRooms.length)
    let newRoom = possibleRooms[index];

    console.log(possibleRooms.length)

    possibleRooms.splice(index, 1);

    newRoom = currentTransition.room.alignRoom(
        newRoom,
        currentTransition.side
    );

    // Check for collision with existing rooms
    let collision = rooms.some((existingRoom) =>
        newRoom.collidesWith(existingRoom)
    );

    if (!collision) {
      rooms.push(newRoom);
      for(let transition of newRoom.getAllTransitions()) {
        // Check if within screen bounds
        if (
            transition.room.x < 0 ||
            transition.room.y < 0 ||
            transition.room.x + transition.room.width * tileSize > width ||
            transition.room.y + transition.room.height * tileSize > height
        ) {
          continue;
        }

        transitionQueue.push(transition);
      }
      currentTransition.room.updateTransitionStatus(
          currentTransition.side,
          "room"
      );
      newRoom.updateTransitionStatus(newRoom.lastTransitionSide, "room");
    } else {
      failedTransitions.push(currentTransition);
    }
  } else {
    // console.log("All transitions have been processed")
    // console.log(failedTransitions)
    for(let transition of failedTransitions) {
      // Try to find a nearby failed transition to connect with a hallway
      let nearbyTransitions = findNearbyTransitions(
          transition
      );

      for (let nearbyTransition of nearbyTransitions) {
        let startPos = getAdjustedStartPosition(
            transition.room,
            transition.side
        );
        let endPos = getAdjustedStartPosition(
            nearbyTransition.room,
            nearbyTransition.side
        );

        let newHallway = new Hallway(
            startPos,
            endPos,
            rooms,
            hallways,
            transition.room,
            nearbyTransition.room
        );

        if (newHallway.path) {
          hallways.push(newHallway);

          transition.room.updateTransitionStatus(
              transition.side,
              "hallway"
          );
          nearbyTransition.room.updateTransitionStatus(
              nearbyTransition.side,
              "hallway"
          );
        }
      }
    }
  }

  // Draw hallways
  for (let hallway of hallways) {
    hallway.draw();
  }

  // Overlaying grid spaced by tileSize/3
  // stroke(100, 50);
  // strokeWeight(1);
  // let startPos = tileSize/6;
  // for (let x = startPos; x < width; x += tileSize/3) {
  //     line(x, 0, x, height);
  // }
  // for (let y = startPos; y < height; y += tileSize/3) {
  //     line(0, y, width, y);
  // }

  if (transitionQueue.length !== 0) {
    fill(250);
    text("Press Enter to place tunnels", 10, 10);
  }else {
    fill(250);
    text("Press Enter to restart", 10, 10);
  }
}

function getAdjustedStartPosition(room, side) {
  let position = getTransitionPosition(room, side);
  switch (side) {
    case "top":
      position.y -= tileSize; // Move up
      break;
    case "bottom":
      position.y += tileSize; // Move down
      break;
    case "left":
      position.x -= tileSize; // Move left
      break;
    case "right":
      position.x += tileSize; // Move right
      break;
  }
  return position;
}

function getTransitionPosition(room, side) {
  let x = room.x;
  let y = room.y;

  switch (side) {
    case "top":
      x += room.transitions.top * tileSize;
      break;
    case "right":
      x += (room.width - 1) * tileSize;
      y += room.transitions.right * tileSize;
      break;
    case "bottom":
      x += room.transitions.bottom * tileSize;
      y += (room.height - 1) * tileSize;
      break;
    case "left":
      y += room.transitions.left * tileSize;
      break;
  }

  return createVector(x, y);
}

function keyPressed() {
  if (keyCode === ENTER) {
    if (transitionQueue.length === 0) {
      reset();
    } else {
      failedTransitions.push(...transitionQueue);
      transitionQueue = [];
    }
  }
}

function reset() {
  rooms = [];
  transitionQueue = [];
  failedTransitions = [];
  hallways = [];

  initialRoom = Room.initial();
  rooms.push(initialRoom);

  for(let i = 0; i < numberOfRooms; i++){
    possibleRooms.push(Room.generate(0, 0))
  }

  transitionQueue.push(...initialRoom.getAllTransitions());
}

function findNearbyTransitions(
    currentTransition,
    maxDistance = 8 * tileSize
) {
  let transitions = []

  for (let transition of failedTransitions) {
    if (transition.room === currentTransition.room) {
      continue;
    }

    let currentPos = getTransitionPosition(
        currentTransition.room,
        currentTransition.side
    );

    let otherPos = getTransitionPosition(
        transition.room,
        transition.side
    );

    let distance = dist(currentPos.x, currentPos.y, otherPos.x, otherPos.y);
    if (distance <= maxDistance) {
      transitions.push(transition);
    }
  }

  return transitions
}

function areOppositeSides(side1, side2) {
  return (
      (side1 === "top" && side2 === "bottom") ||
      (side1 === "bottom" && side2 === "top") ||
      (side1 === "left" && side2 === "right") ||
      (side1 === "right" && side2 === "left")
  );
}
