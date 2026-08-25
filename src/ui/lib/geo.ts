/**
 * Ported directly from the real AttendSmart source (attendanceService.ts).
 * Same Haversine great-circle formula, same signature — not a simplified
 * stand-in. Distance is in meters.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180
  const phi2 = (lat2 * Math.PI) / 180
  const dPhi = ((lat2 - lat1) * Math.PI) / 180
  const dLambda = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export interface ClassWindow {
  id: string
  name: string
  code: string
  startTime: string // "HH:MM"
  endTime: string // "HH:MM"
}

/** Same ongoing-class check as the real checkAttendance(): startTime <= now <= endTime. */
export function findOngoingClasses(classes: ClassWindow[], currentTime: string): ClassWindow[] {
  return classes.filter((cls) => cls.startTime <= currentTime && cls.endTime >= currentTime)
}

export function minutesToClock(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
