export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface Ritual {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly duration: number;
  readonly price: number;
  readonly includesHaircut: boolean;
  readonly image: string;
  readonly alt: string;
}

export interface Barber {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly signature: string;
  readonly color: string;
}

export interface Appointment {
  readonly id: string;
  readonly clientName: string;
  readonly phone: string;
  readonly serviceId: string;
  readonly barberId: string;
  readonly date: string;
  readonly time: string;
  readonly duration: number;
  readonly price: number;
  readonly status: AppointmentStatus;
  readonly createdAt: string;
}

export interface BookingRequest {
  readonly clientName: string;
  readonly phone: string;
  readonly serviceId: string;
  readonly barberId: string;
  readonly date: string;
  readonly time: string;
}

export type BookingResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; message: string };
export interface Slot {
  readonly time: string;
  readonly available: boolean;
}
