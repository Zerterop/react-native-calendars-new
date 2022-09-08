import {DateTime} from 'luxon';
import React, {useRef, useMemo, useContext, useCallback} from 'react';
import {Text} from 'react-native';
import {Theme} from '../types';
import {toMarkingFormat} from '../interface';
import {extractCalendarProps} from '../componentUpdater';
import styleConstructor from './style';
import Calendar, {CalendarProps} from '../calendar';
// import CalendarContext from '../expandableCalendar/Context';

export type CalendarListItemProps = CalendarProps & {
  item: any;
  calendarWidth?: number;
  calendarHeight?: number;
  horizontal?: boolean;
  theme?: Theme;
  scrollToMonth?: (date: DateTime) => void;
  visible?: boolean;
};

const CalendarListItem = React.memo((props: CalendarListItemProps) => {
  const {
    item,
    theme,
    scrollToMonth,
    horizontal,
    calendarHeight,
    calendarWidth,
    style: propsStyle,
    headerStyle,
    onPressArrowLeft,
    onPressArrowRight,
    visible
  } = props;
  // const context = useContext(CalendarContext);

  const style = useRef(styleConstructor(theme));

  const calendarProps = extractCalendarProps(props);
  const dateString = toMarkingFormat(item);

  const calendarStyle = useMemo(() => {
    return [
      {
        width: calendarWidth,
        minHeight: calendarHeight
      },
      style.current.calendar,
      propsStyle
    ];
  }, [calendarWidth, calendarHeight, propsStyle]);

  const textStyle = useMemo(() => {
    return [calendarStyle, style.current.placeholderText];
  }, [calendarStyle]);

  const _onPressArrowLeft = useCallback(
    (method: () => void, month?: DateTime) => {
      if (month) {
        if (onPressArrowLeft) {
          onPressArrowLeft(method, month);
        } else if (scrollToMonth) {
          scrollToMonth(month.minus({months: 1}));
        }
      }
    },
    [onPressArrowLeft, scrollToMonth]
  );

  const _onPressArrowRight = useCallback(
    (method: () => void, month?: DateTime) => {
      if (month) {
        if (onPressArrowRight) {
          onPressArrowRight(method, month);
        } else if (scrollToMonth) {
          scrollToMonth(month.plus({months: 1}));
        }
      }
    },
    [onPressArrowRight, scrollToMonth]
  );

  if (!visible) {
    return <Text style={textStyle}>{DateTime.fromISO(dateString).toFormat('yyyy-MM')}</Text>;
  }
  return (
    <Calendar
      hideArrows={true}
      hideExtraDays={true}
      {...calendarProps}
      current={dateString}
      style={calendarStyle}
      headerStyle={horizontal ? headerStyle : undefined}
      disableMonthChange
      onPressArrowLeft={horizontal ? _onPressArrowLeft : onPressArrowLeft}
      onPressArrowRight={horizontal ? _onPressArrowRight : onPressArrowRight}
      // context={context} // ???
    />
  );
});

export default CalendarListItem;
CalendarListItem.displayName = 'CalendarListItem';
