import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { Appointment } from "../../../domain/appointment";
import { shiftDate } from "../../../domain/scheduling";

@Component({
  selector: "altior-activity-chart",
  imports: [DatePipe],
  templateUrl: "./activity-chart.html",
  styleUrl: "./activity-chart.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityChart {
  readonly appointments = input.required<readonly Appointment[]>();
  readonly from = input.required<string>();
  readonly to = input.required<string>();
  protected readonly series = computed(() => {
    const days =
      Math.round(
        (Date.parse(this.to()) - Date.parse(this.from())) / 86_400_000,
      ) + 1;
    const interval = Math.max(1, Math.ceil(days / 14));
    const completed = this.appointments().filter(
      (item) => item.status === "completed",
    );
    const data = [];
    for (let offset = 0; offset < days; offset += interval) {
      const from = shiftDate(this.from(), offset);
      const to = shiftDate(
        this.from(),
        Math.min(offset + interval - 1, days - 1),
      );
      const count = completed.filter(
        (item) => item.date >= from && item.date <= to,
      ).length;
      data.push({ from, to, count });
    }
    const max = Math.max(1, ...data.map((item) => item.count));
    return data.map((item) => ({ ...item, height: (item.count / max) * 100 }));
  });
}
