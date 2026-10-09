import { Appointment } from "./appointment";
import { BARBERS, SERVICES } from "./catalog";
import { dateKey, isOpenDay, shiftDate, appointmentEnd } from "./scheduling";

export function createDemoAppointments(now = new Date()): Appointment[] {
  const today = dateKey(now);
  const appointments: Appointment[] = [];
  let index = 0;
  for (let offset = -27; offset <= 0; offset++) {
    const date = shiftDate(today, offset);
    if (!isOpenDay(date)) continue;
    BARBERS.forEach((barber, barberIndex) => {
      ["09:00", "10:30", "14:00"].forEach((time, timeIndex) => {
        const ritual =
          SERVICES[
            (Math.abs(offset) + barberIndex + timeIndex) % SERVICES.length
          ];
        const ended =
          appointmentEnd({ date, time, duration: ritual.duration }) <=
          now.getTime();
        const pending = offset === 0 && barberIndex === 2 && timeIndex === 2;
        appointments.push({
          id: `demo-${++index}`,
          clientName: `Cliente demo ${String(index).padStart(3, "0")}`,
          phone: "",
          serviceId: ritual.id,
          barberId: barber.id,
          date,
          time,
          duration: ritual.duration,
          price: ritual.price,
          status:
            index % 13 === 0
              ? "cancelled"
              : ended && !pending
                ? "completed"
                : "scheduled",
          createdAt: `${date}T08:00:00-03:00`,
        });
      });
    });
  }
  const next = shiftDate(today, 1);
  if (isOpenDay(next))
    BARBERS.forEach((barber, i) => {
      const ritual = SERVICES[i];
      appointments.push({
        id: `demo-${++index}`,
        clientName: `Cliente demo ${String(index).padStart(3, "0")}`,
        phone: "",
        serviceId: ritual.id,
        barberId: barber.id,
        date: next,
        time: "10:00",
        duration: ritual.duration,
        price: ritual.price,
        status: "scheduled",
        createdAt: now.toISOString(),
      });
    });
  return appointments;
}
