import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map, timer } from "rxjs";
import { Appointment } from "../../domain/appointment";
import { AppointmentStore } from "../../domain/appointment-store";
import { BARBERS, SERVICES } from "../../domain/catalog";
import {
  BOOKING_HORIZON,
  dateKey,
  nextOpenDate,
  shiftDate,
} from "../../domain/scheduling";
import { WorkspaceHeader } from "../../shared/workspace-header/workspace-header";
import { BarberSelector } from "./barber-selector/barber-selector";
import { TimeSlots } from "./time-slots/time-slots";

@Component({
  selector: "altior-booking",
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    WorkspaceHeader,
    BarberSelector,
    TimeSlots,
  ],
  templateUrl: "./booking.html",
  styleUrl: "./booking.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Booking {
  protected readonly store = inject(AppointmentStore);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly injector = inject(Injector);
  private readonly stepTitle = viewChild<ElementRef<HTMLElement>>("stepTitle");
  private readonly now = toSignal(
    timer(0, 30_000).pipe(map(() => new Date())),
    { initialValue: new Date() },
  );
  protected readonly services = SERVICES;
  protected readonly step = signal(1);
  protected readonly serviceId = signal(
    SERVICES.some(
      (item) => item.id === this.route.snapshot.queryParamMap.get("servico"),
    )
      ? this.route.snapshot.queryParamMap.get("servico")!
      : "corte",
  );
  protected readonly barberId = signal("");
  protected readonly date = signal(nextOpenDate());
  protected readonly time = signal("");
  protected readonly today = computed(() => dateKey(this.now()));
  protected readonly maxDate = computed(() =>
    shiftDate(this.today(), BOOKING_HORIZON),
  );
  protected readonly error = signal("");
  protected readonly confirmed = signal<Appointment | null>(null);
  protected readonly service = computed(
    () => SERVICES.find((item) => item.id === this.serviceId())!,
  );
  protected readonly barber = computed(() =>
    BARBERS.find((item) => item.id === this.barberId()),
  );
  protected readonly slots = computed(() =>
    this.barberId()
      ? this.store.slots(
          this.date(),
          this.barberId(),
          this.serviceId(),
          this.now(),
        )
      : [],
  );
  protected readonly hasAvailableSlots = computed(() =>
    this.slots().some((slot) => slot.available),
  );
  protected readonly canContinue = computed(() =>
    this.slots().some((slot) => slot.time === this.time() && slot.available),
  );
  protected readonly form = this.fb.nonNullable.group({
    clientName: [
      "",
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(80),
        Validators.pattern(/.*\S.*\S.*/),
      ],
    ],
    phone: [
      "",
      [
        Validators.required,
        Validators.pattern(
          /^\s*(?:\+55\s*)?\(?\d{2}\)?[\s-]*\d{4,5}[\s-]*\d{4}\s*$/,
        ),
      ],
    ],
  });

  protected selectService(id: string) {
    this.serviceId.set(id);
    this.time.set("");
    this.error.set("");
  }
  protected selectBarber(id: string) {
    this.barberId.set(id);
    this.time.set("");
    this.error.set("");
  }
  protected selectDate(value: string) {
    this.date.set(value);
    this.time.set("");
    this.error.set("");
  }
  protected goToStep(value: number) {
    this.step.set(value);
    this.error.set("");
    this.focusStep();
  }

  protected confirm() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { clientName, phone } = this.form.getRawValue();
    const digits = phone.replace(/\D/g, "");
    const result = this.store.book({
      clientName,
      phone:
        digits.length > 11 && digits.startsWith("55")
          ? digits.slice(2)
          : digits,
      serviceId: this.serviceId(),
      barberId: this.barberId(),
      date: this.date(),
      time: this.time(),
    });
    if (!result.ok) {
      this.goToStep(2);
      this.error.set(result.message);
      return;
    }
    this.confirmed.set(result.appointment);
    this.focusStep();
  }

  protected startAgain() {
    this.confirmed.set(null);
    this.time.set("");
    this.form.reset();
    this.goToStep(1);
  }

  private focusStep() {
    afterNextRender(
      () => {
        window.scrollTo({ top: 0, behavior: "instant" });
        this.stepTitle()?.nativeElement.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }
}
