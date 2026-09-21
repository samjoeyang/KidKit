/* ============================================================================
   标准盲打指法：字母 → 哪只手哪个手指
   ========================================================================== */

export type FingerName = 'pinky' | 'ring' | 'middle' | 'index'
export type FingerKey = `L-${FingerName}` | `R-${FingerName}`

export const FINGER_MAP: Record<string, FingerKey> = {
  q: 'L-pinky',
  a: 'L-pinky',
  z: 'L-pinky',
  w: 'L-ring',
  s: 'L-ring',
  x: 'L-ring',
  e: 'L-middle',
  d: 'L-middle',
  c: 'L-middle',
  r: 'L-index',
  f: 'L-index',
  v: 'L-index',
  t: 'L-index',
  g: 'L-index',
  b: 'L-index',
  y: 'R-index',
  h: 'R-index',
  n: 'R-index',
  u: 'R-index',
  j: 'R-index',
  m: 'R-index',
  i: 'R-middle',
  k: 'R-middle',
  o: 'R-ring',
  l: 'R-ring',
  p: 'R-pinky',
}

export const FINGER_COLORS: Record<FingerName, string> = {
  pinky: '#FF6F9C',
  ring: '#FFD35C',
  middle: '#58C97B',
  index: '#6FC3FF',
}

export const FINGER_NAMES_ZH: Record<FingerName, string> = {
  pinky: '小指',
  ring: '无名指',
  middle: '中指',
  index: '食指',
}

export const HAND_NAMES_ZH: Record<'L' | 'R', string> = {
  L: '左手',
  R: '右手',
}
