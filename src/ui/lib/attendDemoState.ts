export interface AttendDemoState {
  distance: number | null
  radius: number
  inRange: boolean | null
}

export const attendDemoState: AttendDemoState = {
  distance: null,
  radius: 100,
  inRange: null,
}
