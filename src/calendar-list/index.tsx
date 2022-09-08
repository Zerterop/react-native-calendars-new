import findIndex from 'lodash/findIndex';
import PropTypes from 'prop-types';
import {DateTime} from 'luxon';

import React, {forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback, useMemo} from 'react';
import {FlatList, View, ViewStyle, FlatListProps} from 'react-native';

import {extractHeaderProps, extractCalendarProps} from '../componentUpdater';
import {xdateToData, parseDate} from '../interface';
import {page, sameDate, sameMonth} from '../dateutils';
import constants from '../commons/constants';
import {useDidUpdate} from '../hooks';
// @ts-expect-error
import {STATIC_HEADER} from '../testIDs';
import styleConstructor from './style';
import Calendar, {CalendarProps} from '../calendar';
import CalendarListItem from './item';
import CalendarHeader from '../calendar/header/index';

const CALENDAR_WIDTH = constants.screenWidth;
const CALENDAR_HEIGHT = 360;
const PAST_SCROLL_RANGE = 50;
const FUTURE_SCROLL_RANGE = 50;

export interface CalendarListProps extends CalendarProps, Omit<FlatListProps<any>, 'data' | 'renderItem'> {
  /** Max amount of months allowed to scroll to the past. Default = 50 */
  pastScrollRange?: number;
  /** Max amount of months allowed to scroll to the future. Default = 50 */
  futureScrollRange?: number;
  /** Used when calendar scroll is horizontal, default is device width, pagination should be disabled */
  calendarWidth?: number;
  /** Dynamic calendar height */
  calendarHeight?: number;
  /** Style for the List item (the calendar) */
  calendarStyle?: ViewStyle;
  /** Whether to use static header that will not scroll with the list (horizontal only) */
  staticHeader?: boolean;
  /** Enable or disable vertical / horizontal scroll indicator. Default = false */
  showScrollIndicator?: boolean;
  /** Whether to animate the auto month scroll */
  animateScroll?: boolean;
}

export interface CalendarListImperativeMethods {
  scrollToDay: (date: DateTime | string, offset: number, animated: boolean) => void;
  scrollToMonth: (date: DateTime | string) => void;
}

/**
 * @description: Calendar List component for both vertical and horizontal calendars
 * @extends: Calendar
 * @extendslink: docs/Calendar
 * @example: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/calendarsList.js
 * @gif: https://github.com/wix/react-native-calendars/blob/master/demo/assets/calendar-list.gif
 */
const CalendarList = (props: CalendarListProps, ref: any) => {
  useImperativeHandle(ref, () => ({
    scrollToDay: (date: DateTime | string, offset: number, animated: boolean) => {
      scrollToDay(date, offset, animated);
    },
    scrollToMonth: (date: DateTime | string) => {
      scrollToMonth(date);
    }
  }));

  const {
    /** Calendar props */
    theme,
    current,
    firstDay,
    markedDates,
    headerStyle,
    onMonthChange,
    onVisibleMonthsChange,
    /** CalendarList props */
    pastScrollRange = PAST_SCROLL_RANGE,
    futureScrollRange = FUTURE_SCROLL_RANGE,
    calendarHeight = CALENDAR_HEIGHT,
    calendarWidth = CALENDAR_WIDTH,
    calendarStyle,
    animateScroll = false,
    showScrollIndicator = false,
    staticHeader,
    /** View props */
    testID,
    style: propsStyle,
    onLayout,
    removeClippedSubviews,
    /** ScrollView props */
    horizontal = false,
    pagingEnabled,
    scrollEnabled = true,
    nestedScrollEnabled = true,
    scrollsToTop = false,
    keyExtractor = (_: any, index: number) => String(index),
    keyboardShouldPersistTaps,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    /** FlatList props */
    onEndReachedThreshold,
    onEndReached
  } = props;

  const calendarProps = extractCalendarProps(props);
  const headerProps = extractHeaderProps(props);
  const calendarSize = horizontal ? calendarWidth : calendarHeight;

  const [currentMonth, setCurrentMonth] = useState(parseDate(current));

  const style = useRef(styleConstructor(theme));
  const list = useRef();
  const range = useRef(horizontal ? 1 : 3);
  const initialDate = useRef(parseDate(current) || DateTime.now());
  const visibleMonth = useRef(currentMonth);

  const items = useMemo(() => {
    const months: DateTime[] = [];
    for (let i = 0; i <= pastScrollRange + futureScrollRange; i++) {
      // TODO check overflow impact
      const rangeDate = initialDate.current?.plus({months: i - pastScrollRange});
      months.push(rangeDate);
    }
    return months;
  }, [pastScrollRange, futureScrollRange]);

  const staticHeaderStyle = useMemo(() => {
    return [style.current.staticHeader, headerStyle];
  }, [headerStyle]);

  const listStyle = useMemo(() => {
    return [style.current.container, propsStyle];
  }, [propsStyle]);

  const initialDateIndex = useMemo(() => {
    return findIndex(items, function (item) {
      return item.toString() === initialDate.current?.toString();
    });
  }, [items]);

  useEffect(() => {
    if (current) {
      scrollToMonth(DateTime.fromISO(current));
    }
  }, [current]);

  useDidUpdate(() => {
    if (!currentMonth) return;
    const currMont = currentMonth;
    onMonthChange?.(xdateToData(currMont));
    onVisibleMonthsChange?.([xdateToData(currMont)]);
  }, [currentMonth]);

  const scrollToDay = (date: DateTime | string, offset: number, animated: boolean) => {
    const scrollTo = parseDate(date);
    if (!scrollTo || !initialDate.current) return;
    const diffMonths = Math.round(
      scrollTo.startOf('month').startOf('month').diff(initialDate.current, 'months').months
    );
    let scrollAmount = calendarSize * pastScrollRange + diffMonths * calendarSize + (offset || 0);

    if (!horizontal) {
      let week = 0;
      const days = page(scrollTo, firstDay);
      for (let i = 0; i < days.length; i++) {
        week = Math.floor(i / 7);
        if (sameDate(days[i], scrollTo)) {
          scrollAmount += 46 * week;
          break;
        }
      }
    }

    if (scrollAmount !== 0) {
      // @ts-expect-error
      list?.current?.scrollToOffset({offset: scrollAmount, animated});
    }
  };

  const scrollToMonth = useCallback(
    (date: DateTime | string) => {
      const scrollTo = parseDate(date);
      if (!scrollTo || !initialDate.current) return;
      const diffMonths = Math.round(
        scrollTo.startOf('month').startOf('month').diff(initialDate.current, 'months').months
      );
      const scrollAmount = calendarSize * pastScrollRange + diffMonths * calendarSize;

      if (scrollAmount !== 0) {
        // @ts-expect-error
        list?.current?.scrollToOffset({offset: scrollAmount, animated: animateScroll});
      }
    },
    [calendarSize]
  );

  const addMonth = useCallback(
    (count: number) => {
      // TODO check overflow impact
      const day = currentMonth?.plus({months: count});
      if (sameMonth(day, currentMonth)) {
        return;
      }
      scrollToMonth(day);
      setCurrentMonth(day);
    },
    [currentMonth, scrollToMonth]
  );

  const getMarkedDatesForItem = useCallback(
    (item?: DateTime) => {
      if (markedDates && item) {
        for (const [key, _] of Object.entries(markedDates)) {
          if (sameMonth(DateTime.fromISO(key), item)) {
            return markedDates;
          }
        }
      }
    },
    [markedDates]
  );

  const getItemLayout = useCallback((_: Array<DateTime> | undefined | null, index: number) => {
    return {
      length: calendarSize,
      offset: calendarSize * index,
      index
    };
  }, []);

  const isDateInRange = useCallback(
    date => {
      for (let i = -range.current; i <= range.current; i++) {
        const newMonth = currentMonth?.plus({months: i});
        if (sameMonth(date, newMonth)) {
          return true;
        }
      }
      return false;
    },
    [currentMonth]
  );

  const renderItem = useCallback(
    ({item}: any) => {
      return (
        <CalendarListItem
          {...calendarProps}
          markedDates={getMarkedDatesForItem(item)}
          item={item}
          testID={`${testID}_${item}`}
          style={calendarStyle}
          // @ts-expect-error - type mismatch - ScrollView's 'horizontal' is nullable
          horizontal={horizontal}
          calendarWidth={calendarWidth}
          calendarHeight={calendarHeight}
          scrollToMonth={scrollToMonth}
          visible={isDateInRange(item)}
        />
      );
    },
    [horizontal, calendarStyle, calendarWidth, testID, getMarkedDatesForItem, isDateInRange, calendarProps]
  );

  const renderStaticHeader = () => {
    if (staticHeader && horizontal) {
      return (
        <CalendarHeader
          {...headerProps}
          testID={STATIC_HEADER}
          style={staticHeaderStyle}
          month={currentMonth}
          addMonth={addMonth}
          accessibilityElementsHidden={true} // iOS
          importantForAccessibility={'no-hide-descendants'} // Android
        />
      );
    }
  };

  /** Viewable month */

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 20
  });

  const onViewableItemsChanged = useCallback(({viewableItems}: any) => {
    const newVisibleMonth = parseDate(viewableItems[0]?.item);
    if (!sameDate(visibleMonth?.current, newVisibleMonth)) {
      visibleMonth.current = newVisibleMonth;
      setCurrentMonth(visibleMonth.current);
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: viewabilityConfig.current,
      onViewableItemsChanged
    }
  ]);

  return (
    <View style={style.current.flatListContainer}>
      <FlatList
        // @ts-expect-error
        ref={list}
        style={listStyle}
        showsVerticalScrollIndicator={showScrollIndicator}
        showsHorizontalScrollIndicator={showScrollIndicator}
        data={items}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={range.current}
        initialScrollIndex={initialDateIndex}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        testID={testID}
        onLayout={onLayout}
        removeClippedSubviews={removeClippedSubviews}
        pagingEnabled={pagingEnabled}
        scrollEnabled={scrollEnabled}
        scrollsToTop={scrollsToTop}
        horizontal={horizontal}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyExtractor={keyExtractor}
        onEndReachedThreshold={onEndReachedThreshold}
        onEndReached={onEndReached}
        nestedScrollEnabled={nestedScrollEnabled}
        onMomentumScrollBegin={onMomentumScrollBegin}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
      />
      {renderStaticHeader()}
    </View>
  );
};

export default forwardRef(CalendarList);
CalendarList.displayName = 'CalendarList';
CalendarList.propTypes = {
  ...Calendar.propTypes,
  pastScrollRange: PropTypes.number,
  futureScrollRange: PropTypes.number,
  calendarWidth: PropTypes.number,
  calendarHeight: PropTypes.number,
  calendarStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
  staticHeader: PropTypes.bool,
  showScrollIndicator: PropTypes.bool,
  animateScroll: PropTypes.bool,
  scrollEnabled: PropTypes.bool,
  scrollsToTop: PropTypes.bool,
  pagingEnabled: PropTypes.bool,
  horizontal: PropTypes.bool,
  keyboardShouldPersistTaps: PropTypes.oneOf(['never', 'always', 'handled']),
  keyExtractor: PropTypes.func,
  onEndReachedThreshold: PropTypes.number,
  onEndReached: PropTypes.func,
  nestedScrollEnabled: PropTypes.bool
};
