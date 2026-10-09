import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { BARBERS } from "../../../domain/catalog";

@Component({
  selector: "altior-barber-selector",
  templateUrl: "./barber-selector.html",
  styleUrl: "./barber-selector.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarberSelector {
  readonly selected = input.required<string>();
  readonly selectedChange = output<string>();
  protected readonly barbers = BARBERS;
}
