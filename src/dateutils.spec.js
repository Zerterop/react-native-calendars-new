import {DateTime} from 'luxon';
import {sameMonth, sameWeek, isLTE, isGTE, month, page, generateDay, isPastDate} from './dateutils';

describe('dateutils', function () {
  describe('sameMonth()', function () {
    it('2014-01-01 === 2014-01-10', function () {
      const a = DateTime.utc(2014, 1, 1);
      const b = DateTime.utc(2014, 1, 10);
      expect(sameMonth(a, b)).toEqual(true);
    });
  });

  describe('sameWeek()', () => {
    it('Expect sameWeek to return true, for two days on the same week', () => {
      const a = '2021-01-05';
      const b = '2021-01-06';
      expect(sameWeek(a, b, 1)).toBe(true);
    });

    it('Expect sameWeek to return true, for two days on the same week, when', () => {
      const date = '2021-01-01';
      const prevDate = '2021-01-02';
      expect(sameWeek(prevDate, date, 1)).toBe(true);
    });

    it('Expect sameWeek to return true, on first date is after second date', () => {
      const a = '2021-01-07';
      const b = '2021-01-05';
      expect(sameWeek(a, b, 1)).toBe(true);
    });

    it('Expect sameWeek to return false, on Sunday when firstDay is Monday', () => {
      const a = '2021-01-03';
      const b = '2021-01-04';
      expect(sameWeek(a, b, 0)).toBe(true);

      expect(sameWeek(a, b, 1)).toBe(false);
    });
  });

  describe('isPastDate', () => {
    it('Expect to get true while passing a past date', () => {
      const pastDate = '2021-04-04';
      const futureDate = '2050-04-04';
      const today1 = DateTime.now();
      const today2 = new Date();

      expect(isPastDate(futureDate)).toBe(false);
      expect(isPastDate(pastDate)).toBe(true);

      expect(isPastDate(today1)).toBe(false);
      expect(isPastDate(today2)).toBe(false);
    });
  });

  describe('isLTE()', function () {
    it('2014-01-20 >= 2013-12-31', function () {
      const a = DateTime.utc(2013, 12, 31);
      const b = DateTime.utc(2014, 1, 20);
      expect(isLTE(a, b)).toBe(true);
    });

    it('2014-10-20 >= 2014-10-19', function () {
      const a = DateTime.utc(2014, 10, 19);
      const b = DateTime.utc(2014, 10, 20);
      expect(isLTE(a, b)).toBe(true);
    });

    it('2014-10-20 >= 2014-09-30', function () {
      const a = DateTime.utc(2014, 9, 30);
      const b = DateTime.utc(2014, 10, 20);
      expect(isLTE(a, b)).toBe(true);
    });

    it('works for dates that differ by less than a day', function () {
      const a = DateTime.utc(2014, 9, 30, 0, 1, 0);
      const b = DateTime.utc(2014, 9, 30, 1, 0, 1);
      expect(isLTE(a, b)).toBe(true);
      expect(isLTE(b, a)).toBe(true);
    });
  });

  describe('isGTE()', function () {
    it('2014-01-20 >= 2013-12-31', function () {
      const a = DateTime.utc(2013, 12, 31);
      const b = DateTime.utc(2014, 1, 20);
      expect(isGTE(b, a)).toBe(true);
    });

    it('2014-10-20 >= 2014-10-19', function () {
      const a = DateTime.utc(2014, 10, 19);
      const b = DateTime.utc(2014, 10, 20);
      expect(isGTE(b, a)).toBe(true);
    });

    it('2014-10-20 >= 2014-09-30', function () {
      const a = DateTime.utc(2014, 9, 30);
      const b = DateTime.utc(2014, 10, 20);
      expect(isGTE(b, a)).toBe(true);
    });

    it('works for dates that differ by less than a day', function () {
      const a = DateTime.utc(2014, 9, 30, 0, 1, 0);
      const b = DateTime.utc(2014, 9, 30, 1, 0, 1);
      expect(isGTE(a, b)).toBe(true);
      expect(isGTE(b, a)).toBe(true);
    });
  });

  describe('month()', function () {
    it('2014 May', function () {
      const days = month(DateTime.utc(2014, 5, 1));
      expect(days.length).toBe(31);
    });

    it('2014 June', function () {
      const days = month(DateTime.utc(2014, 6, 1));
      expect(days.length).toBe(30);
    });

    it('2014 August', function () {
      const days = month(DateTime.utc(2014, 8, 1));
      expect(days.length).toBe(31);
    });
  });

  describe('page()', function () {
    it('2014 March', function () {
      const days = page(DateTime.utc(2014, 3, 23));
      expect(days.length).toBe(42);
      expect(days[0].toISO()).toBe(DateTime.utc(2014, 2, 23, 0, 0, 0).toISO());
      expect(days[days.length - 1].toISO()).toBe(DateTime.utc(2014, 4, 5, 0, 0, 0).toISO());
    });

    it('2014 May', function () {
      const days = page(DateTime.utc(2014, 5, 23));
      expect(days.length).toBe(35);
    });

    it('2014 June', function () {
      const days = page(DateTime.utc(2014, 6, 23));
      expect(days.length).toBe(35);
    });

    it('2014 August', function () {
      const days = page(DateTime.utc(2014, 8, 23));
      expect(days.length).toBe(42);
    });

    it('2014 October', function () {
      const days = page(DateTime.utc(2014, 10, 21));
      expect(days.length).toBe(35);
    });

    it('has all days in ascending order', function () {
      let days, i, len;

      days = page(DateTime.utc(2014, 2, 1));
      for (i = 0, len = days.length - 1; i < len; i++) {
        expect(days[i].diff(days[i + 1], 'days').days).toBe(-1);
      }
      days = page(DateTime.utc(2014, 9, 1));
      for (i = 0, len = days.length - 1; i < len; i++) {
        expect(days[i].diff(days[i + 1], 'days').days).toBe(-1);
      }
    });

    it('should show six weeks', function () {
      const february2021 = page(DateTime.utc(2021, 2, 23), 1, true);
      const february = page(DateTime.utc(2022, 2, 23), 1, true);
      const march = page(DateTime.utc(2022, 3, 23), 0, true);
      const april = page(DateTime.utc(2022, 4, 23), 1, true);
      const may = page(DateTime.utc(2022, 5, 23), 1, true);
      const june = page(DateTime.utc(2022, 6, 23), 1, true);

      expect(february2021.length).toBe(42);
      expect(february.length).toBe(42);
      expect(march.length).toBe(42);
      expect(april.length).toBe(42);
      expect(may.length).toBe(42);
      expect(june.length).toBe(42);
    });
  });

  describe('generateDay', () => {
    it('should generate a day in string format with an offset', () => {
      expect(generateDay('2017-09-22', 2)).toBe('2017-09-24');
      expect(generateDay('2017-09-22', -2)).toBe('2017-09-20');
    });

    it('should generate the same day when offset was not sent', () => {
      expect(generateDay('2017-09-22')).toBe('2017-09-22');
    });

    it('should handle month and year changes', () => {
      expect(generateDay('2017-10-22', 10)).toBe('2017-11-01');
      expect(generateDay('2017-12-26', 10)).toBe('2018-01-05');
      expect(generateDay('2018-01-01', -3)).toBe('2017-12-29');
    });
  });
});
