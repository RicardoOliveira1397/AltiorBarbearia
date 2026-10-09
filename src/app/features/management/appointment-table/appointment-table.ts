import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { toSignal } from "@angular/core/rxjs-interop";
import { map, timer } from "rxjs";
import { Appointment, AppointmentStatus } from "../../../domain/appointment";
import { BARBERS, SERVICES, STATUS_LABELS } from "../../../domain/catalog";
import { canChangeStatus } from "../../../domain/scheduling";

@Component({
  selector: "altior-appointment-table",
  imports: [CurrencyPipe, DatePipe],
  templateUrl: "./appointment-table.html",
  styleUrl: "./appointment-table.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentTable {
  private readonly now = toSignal(
    timer(0, 30_000).pipe(map(() => new Date())),
    { initialValue: new Date() },
  );
  readonly appointments = input.required<readonly Appointment[]>();
  readonly changeStatus = output<{
    id: string;
    status: Exclude<AppointmentStatus, "scheduled">;
  }>();
  protected readonly search = signal("");
  protected readonly status = signal<AppointmentStatus | "">("");
  protected readonly page = signal(1);
  protected readonly pendingCancellation = signal("");
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statuses: readonly AppointmentStatus[] = [
    "scheduled",
    "completed",
    "cancelled",
  ];
  protected readonly filtered = computed(() =>
    this.appointments()
      .filter(
        (item) =>
          (!this.status() || item.status === this.status()) &&
          item.clientName
            .toLocaleLowerCase("pt-BR")
            .includes(this.search().trim().toLocaleLowerCase("pt-BR")),
      )
      .sort((a, b) =>
        `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`),
      ),
  );
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / 8)),
  );
  protected readonly currentPage = computed(() =>
    Math.min(this.page(), this.pageCount()),
  );
  protected readonly rows = computed(() =>
    this.filtered()
      .slice((this.currentPage() - 1) * 8, this.currentPage() * 8)
      .map((item) => ({
        ...item,
        barber: BARBERS.find((barber) => barber.id === item.barberId)!,
        service: SERVICES.find((service) => service.id === item.serviceId)!,
        canComplete: canChangeStatus(item, "completed", this.now()),
      })),
  );

  protected filterStatus(value: AppointmentStatus | "") {
    this.status.set(value);
    this.page.set(1);
    this.pendingCancellation.set("");
  }
  protected searchClient(value: string) {
    this.search.set(value);
    this.page.set(1);
  }
  protected cancel(id: string) {
    this.changeStatus.emit({ id, status: "cancelled" });
    this.pendingCancellation.set("");
  }
}
