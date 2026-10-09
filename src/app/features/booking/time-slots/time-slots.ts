import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { Slot } from "../../../domain/appointment";

@Component({
  selector: "altior-time-slots",
  templateUrl: "./time-slots.html",
  styleUrl: "./time-slots.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeSlots {
  readonly slots = input.required<readonly Slot[]>();
  readonly selected = input.required<string>();
  readonly selectedChange = output<string>();
}
