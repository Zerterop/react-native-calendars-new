import {DateTime} from 'luxon';

export function padNumber(n: number) {
  if (n < 10) {
    return '0' + n;
  }
  return n;
}

export function xdateToData(date: DateTime | string) {
  const d = DateTime.isDateTime(date) ? date : DateTime.fromISO(date);
  const dateString = toMarkingFormat(d);
  return {
    year: d.year,
    month: d.month,
    day: d.day,
    // potential bug here but current behaviour maintained
    timestamp: d.setZone('utc', {keepLocalTime: true}).startOf('day').toMillis(),
    dateString: dateString
  };
}

export function parseDate(d?: any) {
  if (!d) {
    return;
  } else if (d.timestamp) {
    // conventional data timestamp
    return DateTime.fromMillis(d.timestamp, {zone: 'utc'});
  } else if (DateTime.isDateTime(d)) {
    // DateTime
    return DateTime.utc(d.year, d.month, d.day);
  } else if (d.getTime) {
    // javascript date
    const dateString = d.getFullYear() + '-' + padNumber(d.getMonth() + 1) + '-' + padNumber(d.getDate());
    return DateTime.fromISO(dateString, {zone: 'utc'});
  } else if (d.year) {
    const dateString = d.year + '-' + padNumber(d.month) + '-' + padNumber(d.day);
    return DateTime.fromISO(dateString, {zone: 'utc'});
  } else if (typeof d === 'number') {
    // timestamp nuber
    return DateTime.fromMillis(d, {zone: 'utc'});
  } else if (typeof d === 'string') {
    // date formatted as string
    return DateTime.fromISO(d, {zone: 'utc'});
  }
}

export function toMarkingFormat(dt: DateTime) {
  if (dt.isValid) {
    return dt.toISODate();
  }
  return 'Invalid Date';
}
