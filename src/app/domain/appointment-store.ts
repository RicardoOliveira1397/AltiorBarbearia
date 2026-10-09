import { Injectable, OnDestroy, signal } from "@angular/core";
import {
  Appointment,
  AppointmentStatus,
  BookingRequest,
  BookingResult,
} from "./appointment";
import { BARBERS, SERVICES } from "./catalog";
import { createDemoAppointments } from "./demo-data";
import { availableSlots, canChangeStatus, validDate } from "./scheduling";

const STORAGE_KEY = "altior-demo-appointments-v1";
const phonePattern = /^\d{10,11}$/;

@Injectable({ providedIn: "root" })
export class AppointmentStore implements OnDestroy {
  private readonly state = signal<readonly Appointment[]>([]);
  readonly appointments = this.state.asReadonly();
  private readonly persistence = signal(true);
  readonly persistent = this.persistence.asReadonly();
  private readonly storageChanged = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      const saved = this.read();
      if (saved) this.state.set(saved);
    }
  };

  constructor() {
    const saved = this.read();
    this.state.set(saved ?? createDemoAppointments());
    if (!saved) this.persist();
    window.addEventListener("storage", this.storageChanged);
  }

  slots(date: string, barberId: string, serviceId: string, now = new Date()) {
    const ritual = SERVICES.find((item) => item.id === serviceId);
    return ritual
      ? availableSlots(
          date,
          barberId,
          ritual.duration,
          this.appointments(),
          now,
        )
      : [];
  }

  book(request: BookingRequest): BookingResult {
    const saved = this.read();
    if (saved) this.state.set(saved);
    const ritual = SERVICES.find((item) => item.id === request.serviceId);
    const barber = BARBERS.find((item) => item.id === request.barberId);
    const clientName = request.clientName.trim();
    const phone = request.phone.replace(/\D/g, "");
    if (
      !ritual ||
      !barber ||
      clientName.length < 2 ||
      clientName.length > 80 ||
      !phonePattern.test(phone)
    )
      return {
        ok: false,
        message: "Revise o nome, o telefone e as opções do seu atendimento.",
      };
    if (
      !this.slots(request.date, barber.id, ritual.id).some(
        (slot) => slot.time === request.time && slot.available,
      )
    )
      return {
        ok: false,
        message:
          "Esse horário não está mais disponível. Escolha outro horário para continuar.",
      };
    const appointment: Appointment = {
      ...request,
      id: crypto.randomUUID(),
      clientName,
      phone,
      duration: ritual.duration,
      price: ritual.price,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };
    this.state.update((items) => [...items, appointment]);
    this.persist();
    return { ok: true, appointment };
  }

  updateStatus(
    id: string,
    status: Exclude<AppointmentStatus, "scheduled">,
  ): boolean {
    const saved = this.read();
    if (saved) this.state.set(saved);
    const appointment = this.appointments().find((item) => item.id === id);
    if (!appointment || !canChangeStatus(appointment, status)) return false;
    this.state.update((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    this.persist();
    return true;
  }

  restoreDemo() {
    this.state.set(createDemoAppointments());
    this.persist();
  }

  private read(): Appointment[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data: unknown = JSON.parse(raw);
      if (
        !data ||
        typeof data !== "object" ||
        !("version" in data) ||
        data.version !== 1 ||
        !("appointments" in data) ||
        !Array.isArray(data.appointments)
      )
        return null;
      if (
        data.appointments.length > 5000 ||
        !data.appointments.every(isAppointment)
      )
        return null;
      return data.appointments;
    } catch {
      this.persistence.set(false);
      return null;
    }
  }

  private persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, appointments: this.appointments() }),
      );
      this.persistence.set(true);
    } catch {
      this.persistence.set(false);
    }
  }

  ngOnDestroy() {
    window.removeEventListener("storage", this.storageChanged);
  }
}

function isAppointment(value: unknown): value is Appointment {
  if (!value || typeof value !== "object") return false;
  const item = value as Appointment;
  return (
    typeof item.id === "string" &&
    typeof item.clientName === "string" &&
    item.clientName.length <= 80 &&
    typeof item.phone === "string" &&
    SERVICES.some((service) => service.id === item.serviceId) &&
    BARBERS.some((barber) => barber.id === item.barberId) &&
    typeof item.date === "string" &&
    validDate(item.date) &&
    typeof item.time === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time) &&
    typeof item.duration === "number" &&
    Number.isFinite(item.duration) &&
    item.duration > 0 &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    ["scheduled", "completed", "cancelled"].includes(item.status) &&
    typeof item.createdAt === "string"
  );
}
