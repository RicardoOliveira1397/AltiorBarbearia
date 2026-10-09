import { Barber, Ritual } from "./appointment";

// Catalog and professionals are illustrative until the Altior team confirms them.
export const SERVICES: readonly Ritual[] = [
  {
    id: "corte",
    name: "Corte",
    description: "Forma, textura e personalidade. Feito para você.",
    duration: 30,
    price: 55,
    includesHaircut: true,
    image: "atelier",
    alt: "Acabamento de um corte masculino",
  },
  {
    id: "barba",
    name: "Barba",
    description: "Presença no desenho. Precisão no acabamento.",
    duration: 30,
    price: 45,
    includesHaircut: false,
    image: "craft",
    alt: "Barba sendo aparada com tesoura",
  },
  {
    id: "combo",
    name: "Corte + barba",
    description: "Seu visual em harmonia. O ritual completo.",
    duration: 60,
    price: 90,
    includesHaircut: true,
    image: "portrait",
    alt: "Atendimento com atenção na cadeira do barbeiro",
  },
  {
    id: "infantil",
    name: "Corte infantil",
    description:
      "Os pequenos também têm estilo. Cuidado e atenção em cada detalhe.",
    duration: 30,
    price: 45,
    includesHaircut: true,
    image: "detail",
    alt: "Tesoura, pente e instrumentos do ofício",
  },
];

export const BARBERS: readonly Barber[] = [
  {
    id: "lucas",
    name: "Lucas",
    initials: "LC",
    signature: "Precisão no traço.",
    color: "#b7bea1",
  },
  {
    id: "rafael",
    name: "Rafael",
    initials: "RF",
    signature: "Estilo em cada detalhe.",
    color: "#d2b99a",
  },
  {
    id: "andre",
    name: "André",
    initials: "AN",
    signature: "Cuidado que acompanha.",
    color: "#a7b7bc",
  },
];

export const STATUS_LABELS = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
} as const;
