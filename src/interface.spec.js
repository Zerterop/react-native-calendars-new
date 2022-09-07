import {parseDate, xdateToData, toMarkingFormat} from './interface';
import {DateTime} from 'luxon';

describe('interface', () => {
  describe('parseDate()', () => {
    it('should return undefined if date is undefined', () => {
      const date = parseDate();
      expect(date).toBe(undefined);
    });

    it('should accept UTC timestamp as argument', () => {
      const date = parseDate(1479832134398);
      expect(date.toMillis()).toEqual(1479832134398);
      expect(date.offset).toEqual(0);
    });

    it('should accept dateString as argument', () => {
      const date = parseDate('2012-03-16');
      expect(date.toFormat('yyyy-MM-dd')).toEqual('2012-03-16');
      expect(date.offset).toEqual(0);
    });

    it('should expect object with UTC timestamp as argument', () => {
      const date = parseDate({timestamp: 1479832134398});
      expect(date.toMillis()).toEqual(1479832134398);
      expect(date.offset).toEqual(0);
    });

    it('should accept DateTime as argument', () => {
      const dt = DateTime.fromMillis(1479772800000);
      const date = parseDate(dt);
      expect(date.toISO()).toEqual('2016-11-22T00:00:00.000Z');
    });

    it('should accept Date as argument', () => {
      const testDate = new Date(2015, 5, 5, 12, 0);
      const date = parseDate(testDate);
      expect(date.toFormat('yyyy-MM-dd')).toEqual('2015-06-05');
    });

    it('should accept data as argument', () => {
      const testDate = {
        year: 2015,
        month: 5,
        day: 6
      };
      const date = parseDate(testDate);
      expect(date.toFormat('yyyy-MM-dd')).toEqual('2015-05-06');
    });
  });

  describe('xdateToData()', () => {
    it('should convert DateTime to data', () => {
      const time = 1479772800000;
      const testDate = DateTime.fromMillis(time).toUTC();
      expect(testDate.toISO()).toEqual('2016-11-22T00:00:00.000Z');
      const data = xdateToData(testDate);
      expect(data).toEqual({
        year: 2016,
        month: 11,
        day: 22,
        timestamp: 1479772800000,
        dateString: '2016-11-22'
      });
    });
  });

  // TODO remove or add test for invalid date
  describe('toMarkingFormat()', () => {
    it('should convert DateTime to yyyy-MM-dd format string', () => {
      const time = 1479772800000;
      const testDate = DateTime.fromMillis(time);
      expect(toMarkingFormat(testDate)).toEqual(testDate.toFormat('yyyy-MM-dd'));
    });
  });
});
