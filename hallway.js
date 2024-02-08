// Hallway.js
class Hallway {
  constructor(start, end, rooms, existingHallways, startRoom, endRoom) {
    this.start = start;
    this.end = end;
    this.rooms = rooms;
    this.existingHallways = existingHallways;
    this.startRoom = startRoom;
    this.endRoom = endRoom;
    this.path = this.calculateFlexiblePath();
  }

  calculateFlexiblePath() {

    let debugVisuals = true; // Set to true to enable debugging visuals

    // Debugging visuals for the adjusted start and end points
    // if (debugVisuals) {
    //   fill(0, 255, 0); // Start point in green
    //   ellipse(this.start.x, this.start.y, 10, 10); // Visualize the start point
    //
    //   fill(255, 0, 0); // End point in red
    //   ellipse(this.end.x, this.end.y, 10, 10); // Visualize the end point
    // }

    strokeWeight(3);
    // stroke(255,0,255);
    // line(this.start.x + tileSize/2, this.start.y + tileSize/2, this.end.x + tileSize/2, this.end.y + tileSize/2);

    // Attempt to create a straight path first if it's purely horizontal or vertical
    if (this.start.x === this.end.x || this.start.y === this.end.y) {

      // line(this.start.x, this.start.y, this.end.x, this.end.y);
      if (this.isValidPath([this.start, this.end])) {
        return [this.start, this.end];
      }
    }

    // Attempt to create an L-shaped path
    let lShapedPaths = [
      [this.start, createVector(this.end.x, this.start.y), this.end],
      [this.start, createVector(this.start.x, this.end.y), this.end],
    ];
    for (let path of lShapedPaths) {
      // stroke(0, 255,0);
      // line(path[0].x + tileSize/2, path[0].y + tileSize/2, path[1].x + tileSize/2, path[1].y + tileSize/2);
      // line(path[1].x + tileSize/2, path[1].y + tileSize/2, path[2].x + tileSize/2, path[2].y + tileSize/2);
      if (this.isValidPath(path)) {
        return path;
      }
    }

    // Attempt to create an 'S'-shaped path with a single intermediary straight segment
    let sShapedPaths = [
      // Horizontal-Vertical-Horizontal
      [
        this.start,
        createVector(this.start.x, floor((this.start.y + this.end.y) / 2)),
        createVector(this.end.x, floor((this.start.y + this.end.y) / 2)),
        this.end,
      ],
      // Vertical-Horizontal-Vertical
      [
        this.start,
        createVector(floor((this.start.x + this.end.x) / 2), this.start.y),
        createVector(floor((this.start.x + this.end.x) / 2), this.end.y),
        this.end,
      ],
    ];
    for (let path of sShapedPaths) {
      // stroke(0,0,255);
      // line(path[0].x, path[0].y, path[1].x, path[1].y);
      if (this.isValidPath(path)) {
        return path;
      }
    }
    strokeWeight(1);

    // If no valid path is found, return null
    return null;
  }

  isValidPath(path) {
    // return true
    // Ensure no segment of the path intersects any room
    for (let i = 0; i < path.length - 1; i++) {
      let start = path[i];
      let end = path[i + 1];
      if (this.rooms.some(room => this.lineIntersectsRoom(start, end, room, true))) {
        return false; // Path intersects a room
      }
    }
    return true; // Path is clear
  }

  lineIntersectsRoom(start, end, room, offset = false) {
    if (offset) {
      return lineIntersectsRect(start.x + tileSize/2, start.y + tileSize/2, end.x + tileSize/2, end.y + tileSize/2, room);
    }

    // Ensure this logic robustly checks for intersections
    return lineIntersectsRect(start.x, start.y, end.x, end.y, room);
  }

  draw() {
    // Drawing logic remains the same
    // stroke(255,0,255);
    stroke(50);
    strokeWeight(tileSize);
    noFill();
    strokeCap(PROJECT);
    beginShape();
    for (let point of this.path) {
      vertex(point.x + tileSize/2, point.y + tileSize/2);
    }

    endShape();
    strokeWeight(1);
  }
}

function lineIntersectsRect(x1, y1, x2, y2, room) {
  // Convert room's top-left corner and dimensions to pixel coordinates
  let rectX = room.x;
  let rectY = room.y;
  let rectWidth = room.width * tileSize;
  let rectHeight = room.height * tileSize;

  // Check if either end of the line is inside the rectangle
  if ((x1 >= rectX && x1 <= rectX + rectWidth && y1 >= rectY && y1 <= rectY + rectHeight) ||
      (x2 >= rectX && x2 <= rectX + rectWidth && y2 >= rectY && y2 <= rectY + rectHeight)) {
    return true;
  }

  // Calculate line segment direction
  let deltaX = x2 - x1;
  let deltaY = y2 - y1;

  // Check intersections with rectangle boundaries
  // Top boundary
  let t = deltaY !== 0 ? (rectY - y1) / deltaY : -1;
  if (t >= 0 && t <= 1) {
    let xi = x1 + t * deltaX;
    if (xi >= rectX && xi <= rectX + rectWidth) return true;
  }

  // Bottom boundary
  t = deltaY !== 0 ? (rectY + rectHeight - y1) / deltaY : -1;
  if (t >= 0 && t <= 1) {
    let xi = x1 + t * deltaX;
    if (xi >= rectX && xi <= rectX + rectWidth) return true;
  }

  // Left boundary
  t = deltaX !== 0 ? (rectX - x1) / deltaX : -1;
  if (t >= 0 && t <= 1) {
    let yi = y1 + t * deltaY;
    if (yi >= rectY && yi <= rectY + rectHeight) return true;
  }

  // Right boundary
  t = deltaX !== 0 ? (rectX + rectWidth - x1) / deltaX : -1;
  if (t >= 0 && t <= 1) {
    let yi = y1 + t * deltaY;
    if (yi >= rectY && yi <= rectY + rectHeight) return true;
  }

  // No intersection found
  return false;
}
