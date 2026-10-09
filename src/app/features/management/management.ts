import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AppointmentStatus } from "../../domain/appointment";
import { AppointmentStore } from "../../domain/appointment-store";
import { BARBERS, SERVICES } from "../../domain/catalog";
import { dateKey, shiftDate, validDate } from "../../domain/scheduling";
import { filterAppointments, summarize } from "../../domain/reporting";
import { WorkspaceHeader } from "../../shared/workspace-header/workspace-header";
import { StatCard } from "../../shared/stat-card/stat-card";
import { ActivityChart } from "./activity-chart/activity-chart";
import { AppointmentTable } from "./appointment-table/appointment-table";

@Component({
  selector: "altior-management",
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    WorkspaceHeader,
    StatCard,
    ActivityChart,
    AppointmentTable,
  ],
  templateUrl: "./management.html",
  styleUrl: "./management.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Management {
  protected readonly store = inject(AppointmentStore);
  private readonly route = inject(ActivatedRoute);
  private readonly requestedDate =
    this.route.snapshot.queryParamMap.get("data");
  protected readonly today = dateKey();
  protected readonly view = signal<"overview" | "schedule">(
    this.requestedDate && validDate(this.requestedDate)
      ? "schedule"
      : "overview",
  );
  protected readonly from = signal(
    this.requestedDate && validDate(this.requestedDate)
      ? this.requestedDate
      : shiftDate(this.today, -6),
  );
  protected readonly to = signal(
    this.requestedDate && validDate(this.requestedDate)
      ? this.requestedDate
      : this.today,
  );
  protected readonly preset = signal(this.requestedDate ? "custom" : "week");
  protected readonly barberId = signal("");
  protected readonly serviceId = signal("");
  protected readonly message = signal("");
  protected readonly confirmRestore = signal(false);
  protected readonly services = SERVICES;
  protected readonly barbers = BARBERS;
  protected readonly validPeriod = computed(
    () =>
      validDate(this.from()) &&
      validDate(this.to()) &&
      this.from() <= this.to(),
  );
  protected readonly records = computed(() =>
    this.validPeriod()
      ? filterAppointments(this.store.appointments(), {
          from: this.from(),
          to: this.to(),
          barberId: this.barberId(),
          serviceId: this.serviceId(),
        })
      : [],
  );
  protected readonly summary = computed(() =>
    summarize(this.records(), SERVICES),
  );
  protected readonly maxServiceCount = computed(() =>
    Math.max(1, ...this.summary().services.map((item) => item.count)),
  );
  protected readonly team = computed(() =>
    BARBERS.map((barber) => ({
      ...barber,
      ...summarize(
        this.records().filter((item) => item.barberId === barber.id),
        SERVICES,
      ),
    })),
  );

  protected choosePeriod(preset: "today" | "week" | "month") {
    this.preset.set(preset);
    this.from.set(
      shiftDate(
        this.today,
        preset === "month" ? -29 : preset === "week" ? -6 : 0,
      ),
    );
    this.to.set(this.today);
  }

  protected setDate(field: "from" | "to", value: string) {
    this[field].set(value);
    this.preset.set("custom");
  }

  protected changeStatus(change: {
    id: string;
    status: Exclude<AppointmentStatus, "scheduled">;
  }) {
    const changed = this.store.updateStatus(change.id, change.status);
    this.message.set(
      changed
        ? change.status === "completed"
          ? "Atendimento concluído. Os indicadores foram atualizados."
          : "Agendamento cancelado. O horário está disponível novamente."
        : "Não foi possível alterar esse registro. Verifique a situação e o horário.",
    );
  }

  protected restoreDemo() {
    this.store.restoreDemo();
    this.confirmRestore.set(false);
    this.barberId.set("");
    this.serviceId.set("");
    this.choosePeriod("today");
    this.message.set(
      "Dados demonstrativos restaurados. Você pode testar a agenda novamente.",
    );
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}
