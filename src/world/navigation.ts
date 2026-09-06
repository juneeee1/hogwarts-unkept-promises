export type PlaceId = 'bridge' | 'courtyard' | 'hall' | 'library' | 'potions' | 'astronomy';
export const PLACES: { id: PlaceId; name: string; en: string; description: string; position: [number, number, number]; yaw: number }[] = [
  { id: 'bridge', name: '高架石桥', en: 'THE VIADUCT', description: '越过黑湖的薄雾，城堡的灯火正在等你。', position: [0, 2.05, 84], yaw: 0 },
  { id: 'courtyard', name: '钟楼庭院', en: 'THE COURTYARD', description: '月光落在石廊间。沿着烛火，推开礼堂的大门。', position: [0, 2.05, 18], yaw: 0 },
  { id: 'hall', name: '大礼堂', en: 'THE GREAT HALL', description: '四张长桌，数百支悬浮蜡烛，还有一片施了魔法的星空。', position: [0, 2.05, -7], yaw: 0 },
  { id: 'library', name: '图书馆', en: 'THE LIBRARY', description: '书脊上的金字在闪烁。请放轻脚步。', position: [-27, 2.05, -8], yaw: 0 },
  { id: 'potions', name: '魔药教室', en: 'POTIONS CLASSROOM', description: '玻璃瓶映出幽绿的光，坩埚里仍有未散尽的蒸气。', position: [27, 2.05, -8], yaw: 0 },
  { id: 'astronomy', name: '天文塔', en: 'THE ASTRONOMY TOWER', description: '站在群星之下，看黑湖环抱整座城堡。', position: [30, 34.05, -47], yaw: Math.PI },
];
export type Obstacle = { x: number; z: number; w: number; d: number; minY: number; maxY: number };
export const RADIUS = 0.38;
export function insideWalkable(x: number, z: number, y: number) {
  if (y > 20) return Math.hypot(x - 30, z + 47) < 5.9;
  if (z >= 29 && z <= 103) return Math.abs(x) < 4.65;
  return x > -38 && x < 38 && z > -57 && z < 32;
}
export function canMove(x: number, z: number, y: number, obstacles: Obstacle[]) {
  if (!insideWalkable(x, z, y)) return false;
  return !obstacles.some(o => y > o.minY && y - 1.65 < o.maxY && Math.abs(x-o.x) < o.w/2+RADIUS && Math.abs(z-o.z) < o.d/2+RADIUS);
}
export function placeAt(x: number, z: number, y: number): PlaceId {
  if (y > 20) return 'astronomy';
  if (z > 31) return 'bridge';
  if (z > 1) return 'courtyard';
  if (x < -15) return 'library';
  if (x > 15) return 'potions';
  return 'hall';
}
