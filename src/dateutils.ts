import {DateTime} from 'luxon';
const {toMarkingFormat} = require('./interface');

const latinNumbersPattern = /[0-9]/g;

function isValidDateTime(date: any) {
  return date && DateTime.isDateTime(date) && (date as DateTime).isValid;
}

export function sameMonth(a?: DateTime, b?: DateTime) {
  if (!isValidDateTime(a) || !isValidDateTime(b)) {
    return false;
  }
  return a?.hasSame(b as DateTime, 'month');
}

export function sameDate(a?: DateTime, b?: DateTime) {
  if (!isValidDateTime(a) || !isValidDateTime(b)) {
    return false;
  }
  return a?.hasSame(b as DateTime, 'day');
}

export function sameWeek(a: string, b: string, firstDayOfWeek: number) {
  const weekDates = getWeekDates(a, firstDayOfWeek, 'yyyy-MM-dd');
  return (weekDates as string[] | undefined)?.includes(b);
}

export function isPastDate(date: string) {
  const d = DateTime.fromISO(date);

  if (isToday(d)) return false;
  return d.diffNow('day').days < 0;
}

export function isToday(date?: DateTime | string) {
  if (!date) return true;
  const d = DateTime.isDateTime(date) ? date : DateTime.fromISO(date);
  return sameDate(d, DateTime.now());
}

export function isGTE(a: DateTime, b: DateTime) {
  return b.diff(a, 'days').days < 1;
}

export function isLTE(a: DateTime, b: DateTime) {
  return a.diff(b, 'days').days < 1;
}

export function formatNumbers(date: any) {
  const numbers = getLocale().numbers;
  return numbers ? date.toString().replace(latinNumbersPattern, (char: any) => numbers[+char]) : date;
}

function fromTo(a: DateTime, b: DateTime): DateTime[] {
  const days: DateTime[] = [];
  let from = a,
    to = b;
  for (; from.toMillis() <= to.toMillis(); from = from.plus({days: 1})) {
    days.push(from);
  }
  return days;
}

export function month(date: DateTime) {
  // exported for tests only
  const firstDay = date.startOf('month');
  const lastDay = date.endOf('month');

  return fromTo(firstDay, lastDay);
}

export function weekDayNames(firstDayOfWeek = 0) {
  let weekDaysNames = getLocale().dayNamesShort;
  const dayShift = firstDayOfWeek % 7;
  if (dayShift) {
    weekDaysNames = weekDaysNames.slice(dayShift).concat(weekDaysNames.slice(0, dayShift));
  }
  return weekDaysNames;
}

export function page(dt: DateTime, firstDayOfWeek = 0, showSixWeeks = false) {
  const days = month(dt);
  let before: DateTime[] = [];
  let after: DateTime[] = [];

  const fdow = (7 + firstDayOfWeek) % 7;
  const ldow = (fdow + 6) % 7;

  firstDayOfWeek = firstDayOfWeek || 0;

  let from = days[0];
  const startIndex = from.weekday % 7;
  if (startIndex !== fdow) {
    from = from.minus({days: (startIndex + 7 - fdow) % 7});
  }

  let to = days[days.length - 1];
  const endIndex = to.weekday % 7;
  if (endIndex !== ldow) {
    to = to.plus({days: (ldow + 7 - endIndex) % 7});
  }

  if (showSixWeeks) {
    to = from.plus({weeks: 6}).minus({day: 1});
  }

  if (isLTE(from, days[0])) {
    before = fromTo(from, days[0]);
  }

  if (isGTE(to, days[days.length - 1])) {
    after = fromTo(days[days.length - 1], to);
  }

  return before.concat(days.slice(1, days.length - 1), after);
}

export function isDateNotInRange(date: DateTime, minDate: string, maxDate: string) {
  return (minDate && !isGTE(date, DateTime.fromISO(minDate))) || (maxDate && !isLTE(date, DateTime.fromISO(maxDate)));
}

export function getWeekDates(date: string, firstDay = 0, format?: string) {
  const d = DateTime.fromISO(date);
  if (d.isValid) {
    const daysArray = [d];
    let dayOfTheWeek = (d.weekday % 7) - firstDay;
    if (dayOfTheWeek < 0) {
      // to handle firstDay > 0
      dayOfTheWeek = 7 + dayOfTheWeek;
    }

    let newDate = d;
    let index = dayOfTheWeek - 1;
    while (index >= 0) {
      newDate = newDate.minus({day: 1});
      daysArray.unshift(newDate);
      index -= 1;
    }

    newDate = d;
    index = dayOfTheWeek + 1;
    while (index < 7) {
      newDate = newDate.plus({day: 1});
      daysArray.push(newDate);
      index += 1;
    }

    if (format) {
      return daysArray.map(d => d.toFormat(format));
    }

    return daysArray;
  }
}

export function getPartialWeekDates(date?: string, numberOfDays = 7) {
  let index = 0;
  const partialWeek: string[] = [];
  while (index < numberOfDays) {
    partialWeek.push(generateDay(date || DateTime.now(), index));
    index++;
  }
  return partialWeek;
}

export function generateDay(originDate: string | DateTime, daysOffset = 0) {
  const baseDate = DateTime.isDateTime(originDate) ? originDate : DateTime.fromISO(originDate);
  return toMarkingFormat(baseDate.plus({days: daysOffset}));
}

type Locale = {
  monthNames: string[];
  monthNamesShort: string[];
  dayNames: string[];
  dayNamesShort: string[];
};

export const LocaleConfig: {locales: {[key: string]: Locale}; defaultLocale: string} = {
  locales: {
    '': {
      monthNames: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  },
  defaultLocale: ''
};

export function getLocale() {
  return LocaleConfig.locales[LocaleConfig.defaultLocale];
}
