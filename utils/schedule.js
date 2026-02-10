const WEEKDAY_LABELS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const weekdayOptions = WEEKDAY_LABELS.map((label, value) => ({
  label,
  value,
}));

export const monthDayOptions = Array.from({ length: 31 }, (_, index) => index + 1);

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dayDiff = (from, to) => {
  const millis = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.max(0, Math.round(millis / (1000 * 60 * 60 * 24)));
};

export const getDaysUntilNextContribution = (card, fromDate = new Date()) => {
  if (card.cadence === 'Diaria') {
    return 1;
  }

  if (card.cadence === 'Semanal') {
    const targetWeekday = Number(card.contributionWeekday);
    if (Number.isNaN(targetWeekday)) {
      return null;
    }
    const todayWeekday = fromDate.getDay();
    const rawDiff = (targetWeekday - todayWeekday + 7) % 7;
    return rawDiff === 0 ? 7 : rawDiff;
  }

  if (card.cadence === 'Mensual') {
    const targetDay = Number(card.contributionMonthDay);
    if (Number.isNaN(targetDay) || targetDay < 1) {
      return null;
    }

    const year = fromDate.getFullYear();
    const month = fromDate.getMonth();
    const lastDayCurrentMonth = new Date(year, month + 1, 0).getDate();
    const dayInCurrentMonth = Math.min(targetDay, lastDayCurrentMonth);

    const thisMonthTarget = new Date(year, month, dayInCurrentMonth);

    if (startOfDay(fromDate).getTime() < thisMonthTarget.getTime()) {
      return dayDiff(fromDate, thisMonthTarget);
    }

    const nextMonthDate = new Date(year, month + 1, 1);
    const nextYear = nextMonthDate.getFullYear();
    const nextMonth = nextMonthDate.getMonth();
    const lastDayNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    const dayInNextMonth = Math.min(targetDay, lastDayNextMonth);
    const nextTarget = new Date(nextYear, nextMonth, dayInNextMonth);

    return dayDiff(fromDate, nextTarget);
  }

  return null;
};

export const formatContributionSchedule = (card) => {
  if (card.cadence === 'Semanal' && Number.isInteger(card.contributionWeekday)) {
    return `Todos los ${WEEKDAY_LABELS[card.contributionWeekday]}`;
  }

  if (card.cadence === 'Mensual' && Number.isInteger(card.contributionMonthDay)) {
    return `Cada mes el día ${card.contributionMonthDay}`;
  }

  if (card.cadence === 'Diaria') {
    return 'Todos los días';
  }

  return card.cadence;
};
