import type { Appointment, AppointmentStatus, Slot } from "./appointment";

export const TIME_ZONE = "America/Sao_Paulo";
export const BOOKING_HORIZON = 30;
export const WORK_WINDOWS = [
  [9 * 60, 12 * 60],
  [13 * 60, 19 * 60],
] as const;

export function dateKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"]
    .map((type) => parts.find((p) => p.type === type)!.value)
    .join("-");
}

export function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function validDate(date: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(`${date}T12:00:00Z`)) &&
    new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date
  );
}

export function isOpenDay(date: string): boolean {
  return validDate(date) && new Date(`${date}T12:00:00Z`).getUTCDay() !== 0;
}

export function minutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function timeLabel(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export function appointmentStart(
  appointment: Pick<Appointment, "date" | "time">,
): number {
  return Date.parse(`${appointment.date}T${appointment.time}:00-03:00`);
}

export function appointmentEnd(
  appointment: Pick<Appointment, "date" | "time" | "duration">,
): number {
  return appointmentStart(appointment) + appointment.duration * 60_000;
}

export function canChangeStatus(
  appointment: Appointment,
  status: Exclude<AppointmentStatus, "scheduled">,
  now = new Date(),
): boolean {
  return (
    appointment.status === "scheduled" &&
    (status === "cancelled" || appointmentEnd(appointment) <= now.getTime())
  );
}

export function availableSlots(
  date: string,
  barberId: string,
  duration: number,
  appointments: readonly Appointment[],
  now = new Date(),
): Slot[] {
  const today = dateKey(now);
  if (
    !isOpenDay(date) ||
    date < today ||
    date > shiftDate(today, BOOKING_HORIZON) ||
    duration <= 0
  )
    return [];
  const occupied = appointments.filter(
    (item) =>
      item.date === date &&
      item.barberId === barberId &&
      item.status !== "cancelled",
  );
  return WORK_WINDOWS.flatMap(([open, close]) => {
    const slots: Slot[] = [];
    for (let start = open; start + duration <= close; start += 30) {
      const time = timeLabel(start);
      const inFuture = appointmentStart({ date, time }) > now.getTime();
      const overlaps = occupied.some(
        (item) =>
          start < minutes(item.time) + item.duration &&
          start + duration > minutes(item.time),
      );
      slots.push({ time, available: inFuture && !overlaps });
    }
    return slots;
  });
}

export function nextOpenDate(now = new Date()): string {
  const today = dateKey(now);
  const lastStart = appointmentStart({ date: today, time: "18:30" });
  let date = lastStart > now.getTime() ? today : shiftDate(today, 1);
  while (!isOpenDay(date)) date = shiftDate(date, 1);
  return date;
}
