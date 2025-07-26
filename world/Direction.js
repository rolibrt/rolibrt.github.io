const Direction = Object.freeze({
  EAST: { name: 'EAST', vec: [1, 0, 0], corners: [[1, 0, 1], [1, 1, 1], [1, 1, 0], [1, 0, 0]] },
  WEST: { name: 'WEST', vec: [-1, 0, 0], corners: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]] },
  SOUTH: { name: 'SOUTH', vec: [0, 0, 1], corners: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]] },
  NORTH: { name: 'NORTH', vec: [0, 0, -1], corners: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]] },
  UP: { name: 'UP', vec: [0, 1, 0], corners: [[1, 1, 0], [1, 1, 1], [0, 1, 1], [0, 1, 0]] },
  DOWN: { name: 'DOWN', vec: [0, -1, 0], corners: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]] },
});

const AllDirections = Object.freeze(Object.values(Direction));

const HorizontalDirections = Object.freeze([Direction.EAST, Direction.SOUTH, Direction.WEST, Direction.NORTH]);

export { Direction, AllDirections, HorizontalDirections };