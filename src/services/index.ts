import isUndefined from 'lodash/isUndefined';
import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import {DateTime} from 'luxon';

const {getLocale} = require('../dateutils');
const {padNumber, toMarkingFormat} = require('../interface');

export function getCalendarDateString(date?: Date | string | number) {
  if (!isUndefined(date)) {
    if (isDate(date) && !isNaN(date.getFullYear())) {
      return date.getFullYear() + '-' + padNumber(date.getMonth() + 1) + '-' + padNumber(date.getDate());
    } else if (isString(date)) {
      let parsedDate: DateTime = DateTime.fromISO(date, {zone: 'utc'});
      if (!parsedDate.isValid && /^\d{4}\/\d{2}\/\d{2}/.test(date)) {
        parsedDate = DateTime.fromFormat(date, 'yyyy/MM/dd', {zone: 'utc'});
      } else if (!parsedDate.isValid) {
        parsedDate = DateTime.fromFormat(date, 'dd MMM yyyy', {zone: 'utc'});
      }
      return toMarkingFormat(parsedDate);
    } else if (isNumber(date)) {
      return toMarkingFormat(DateTime.fromMillis(date, {zone: 'utc'}));
    }
    throw 'Invalid Date';
  }
}

export function getDefaultLocale(): any {
  return getLocale();
}

export default {
  getCalendarDateString,
  getDefaultLocale
};
