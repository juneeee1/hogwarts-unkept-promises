export type PlaceId = 'bridge' | 'courtyard' | 'hall' | 'library' | 'potions' | 'astronomy' | 'stairs' | 'shelter' | 'study';
export const PLACES: { id: PlaceId; name: string; en: string; description: string; position: [number, number, number]; yaw: number }[] = [
  { id: 'bridge', name: '高架石桥', en: 'THE VIADUCT', description: '越过黑湖的薄雾，城堡的灯火正在等你。', position: [0, 2.05, 84], yaw: 0 },
  { id: 'courtyard', name: '钟楼庭院', en: 'THE COURTYARD', description: '月光落在石廊间。沿着烛火，推开礼堂的大门。', position: [0, 2.05, 18], yaw: 0 },
  { id: 'hall', name: '大礼堂', en: 'THE GREAT HALL', description: '四张长桌，数百支悬浮蜡烛，还有一片施了魔法的星空。', position: [0, 2.05, -7], yaw: 0 },
  { id: 'library', name: '图书馆', en: 'THE LIBRARY', description: '书脊上的金字在闪烁。请放轻脚步。', position: [-27, 2.05, -8], yaw: 0 },
  { id: 'potions', name: '魔药教室', en: 'POTIONS CLASSROOM', description: '玻璃瓶映出幽绿的光，坩埚里仍有未散尽的蒸气。', position: [27, 2.05, -8], yaw: 0 },
  { id: 'stairs', name: '移动楼梯', en: 'THE GRAND STAIRCASE', description: '肖像在灯下低语。走上石阶，等一条新的路缓缓接拢。', position: [0, 2.05, -63], yaw: 0 },
  { id: 'astronomy', name: '天文塔', en: 'THE ASTRONOMY TOWER', description: '站在群星之下，看黑湖环抱整座城堡。', position: [32.6, 34.05, -44.6], yaw: .35 },
];
export const STORY_PLACES:typeof PLACES=[
  {id:'shelter',name:'棚屋接应处',en:'THE SHACK APPROACH',description:'',position:[87,2.05,5],yaw:0},
  {id:'study',name:'晨光中的研究室',en:'THE MORNING STUDY',description:'',position:[87,2.05,-27],yaw:0},
];
export const ALL_PLACES=[...PLACES,...STORY_PLACES];
export const STAIR_ROOM = {minX:-12.4,maxX:12.4,minZ:-93.4,maxZ:-60.6};
export type Obstacle = { x: number; z: number; w: number; d: number; minY: number; maxY: number };
export const RADIUS = 0.38;
export function insideWalkable(x: number, z: number, y: number) {
  if (x>70) return x>81.4&&x<92.6&&((z> -6.6&&z<6.6)||(z> -36.6&&z< -25.4));
  if (z < -59 && Math.abs(x) < 12.4) return z > -93.4;
  if (z <= -56 && z >= -61 && Math.abs(x) < 2.15 && y < 5) return true;
  if (y > 20) return Math.hypot(x - 30, z + 47) < 5.9;
  if (z >= 29 && z <= 103) return Math.abs(x) < 4.65;
  return x > -38 && x < 38 && z > -57 && z < 32;
}
export function canMove(x: number, z: number, y: number, obstacles: Obstacle[]) {
  if (!insideWalkable(x, z, y)) return false;
  return !obstacles.some(o => y > o.minY && y - 1.65 < o.maxY && Math.abs(x-o.x) < o.w/2+RADIUS && Math.abs(z-o.z) < o.d/2+RADIUS);
}
export function placeAt(x: number, z: number, y: number): PlaceId {
  if(x>70)return z< -20?'study':'shelter';
  if (z < -59 && Math.abs(x) < 14) return 'stairs';
  if (y > 20) return 'astronomy';
  if (z > 31) return 'bridge';
  if (z > 1) return 'courtyard';
  if (x < -15) return 'library';
  if (x > 15) return 'potions';
  return 'hall';
}
