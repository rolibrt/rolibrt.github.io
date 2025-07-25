const Direction = Object.freeze({
  EAST: { vec: [1, 0, 0], corners: [[1, 0, 1], [1, 1, 1], [1, 1, 0], [1, 0, 0]] },
  WEST: { vec: [-1, 0, 0], corners: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]] },
  SOUTH: { vec: [0, 0, 1], corners: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]] },
  NORTH: { vec: [0, 0, -1], corners: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]] },
  UP: { vec: [0, 1, 0], corners: [[1, 1, 0], [1, 1, 1], [0, 1, 1], [0, 1, 0]] },
  DOWN: { vec: [0, -1, 0], corners: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]] },
});

const AllDirections = Object.freeze(Object.values(Direction));

const HorizontalDirections = Object.freeze([Direction.EAST, Direction.SOUTH, Direction.WEST, Direction.NORTH]);

export { Direction, AllDirections, HorizontalDirections };