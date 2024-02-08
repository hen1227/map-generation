// room.js
class Room {
  constructor(x = 0, y = 0, initial = false) {
    // Room position
    this.x = x;
    this.y = y;

    this.initial = initial;

    if (initial) {
      // Generate random width and height between 3 and 15
      this.width = 7;
      this.height = 7;

      // Generate transitions
      this.transitions = {
        top: 3,
        right: 3,
        bottom: 3,
        left: 3,
      };
    } else {
      // Generate random width and height between 3 and 15
      this.width = Math.floor(random(roomRangeMin, roomRangeMax));
      this.height = Math.floor(random(roomRangeMin, roomRangeMax));

      // Generate transitions
      this.transitions = {
        top: Math.floor(random(1, this.width - 1)),
        right: Math.floor(random(1, this.height - 1)),
        bottom: Math.floor(random(1, this.width - 1)),
        left: Math.floor(random(1, this.height - 1)),
      };
    }

    // Track used transitions
    this.usedTransitions = {
      top: false,
      right: false,
      bottom: false,
      left: false,
    };

    // Initialize transition statuses to null (no room or hallway attached)
    this.transitionStatuses = {
      top: null,
      right: null,
      bottom: null,
      left: null,
    };

    this.lastTransitionSide = null;
  }

  draw() {
    // Draw the room with a slightly green background if it's the initial room
    if (this.initial) {
      fill(40, 95, 40);
    } else {
      fill(50); // White for regular rooms
    }
    stroke(100);
    rect(this.x, this.y, this.width * tileSize, this.height * tileSize);

    // Draw transitions
    for (let side of Object.keys(this.transitions)) {
      if (this.usedTransitions[side]) {
        fill(95, 120, 0);
      } else {
        fill(120, 95, 0);
      }

      switch (side) {
        case "top":
          rect(
            this.x + this.transitions.top * tileSize,
            this.y,
            tileSize,
            tileSize
          );
          break;
        case "right":
          rect(
            this.x + (this.width - 1) * tileSize,
            this.y + this.transitions.right * tileSize,
            tileSize,
            tileSize
          );
          break;
        case "bottom":
          rect(
            this.x + this.transitions.bottom * tileSize,
            this.y + (this.height - 1) * tileSize,
            tileSize,
            tileSize
          );
          break;
        case "left":
          rect(
            this.x,
            this.y + this.transitions.left * tileSize,
            tileSize,
            tileSize
          );
          break;
      }
    }

    fill(255); // Reset fill color
  }

  static initial() {
    return new Room(
      width / 2 - tileSize * 1.5,
      height / 2 - tileSize * 1.5,
      true
    );
  }

  // Static method to generate a room
  static generate(x = 0, y = 0) {
    return new Room(x, y);
  }

  // Check if this room collides with another room
  collidesWith(other) {
    return !(
      this.x + this.width * tileSize <= other.x ||
      this.x >= other.x + other.width * tileSize ||
      this.y + this.height * tileSize <= other.y ||
      this.y >= other.y + other.height * tileSize
    );
  }

  // Get all transition points
  getAllTransitions() {
    return Object.keys(this.transitions).map((side) => ({
      room: this,
      side: side,
    }));
  }

  // Method to update transition status
  updateTransitionStatus(side, status) {
    this.transitionStatuses[side] = status;
  }

  alignRoom(room, side) {
    let newRoom = room;
    let oppositeSide = this.getOppositeSide(side);
    // Align the new room based on the side and the transition of the current room
    switch (side) {
      case "top":
        newRoom.x =
            this.x +
            this.transitions.top * tileSize -
            newRoom.transitions[oppositeSide] * tileSize;
        newRoom.y = this.y - newRoom.height * tileSize;
        break;
      case "right":
        newRoom.x = this.x + this.width * tileSize;
        newRoom.y =
            this.y +
            this.transitions.right * tileSize -
            newRoom.transitions[oppositeSide] * tileSize;
        break;
      case "bottom":
        newRoom.x =
            this.x +
            this.transitions.bottom * tileSize -
            newRoom.transitions[oppositeSide] * tileSize;
        newRoom.y = this.y + this.height * tileSize;
        break;
      case "left":
        newRoom.x = this.x - newRoom.width * tileSize;
        newRoom.y =
            this.y +
            this.transitions.left * tileSize -
            newRoom.transitions[oppositeSide] * tileSize;
        break;
    }

    // Mark transitions as used
    this.usedTransitions[side] = true;
    newRoom.usedTransitions[oppositeSide] = true;

    newRoom.lastTransitionSide = oppositeSide;
    return newRoom;
  }

  createAndAlignNewRoom(side) {
     // Generate a new room at a temporary position
    return this.alignRoom(Room.generate(0, 0));
  }

  // Method to get the opposite side
  getOppositeSide(side) {
    switch (side) {
      case "top":
        return "bottom";
      case "right":
        return "left";
      case "bottom":
        return "top";
      case "left":
        return "right";
    }
  }

  copy() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}
