import moment from 'moment';
import React, { useState } from 'react';
import { DateRangePicker } from 'react-dates';

const Filter = props => {
  const [focussedPicker, setFocussedPicker] = useState(null);

  const onDateRangeChange = ({ startDate, endDate }) => {
    const newQuery = { ...props.query, page: 1 };
    if (startDate) {
      newQuery.start_date = startDate.format('YYYY-MM-DD');
    }
    if (endDate) {
      newQuery.end_date = endDate.format('YYYY-MM-DD');
    }
    props.setQuery(newQuery);
  };

  return (
    <div className="col-6 right">
      <DateRangePicker
        small
        displayFormat="Do MMM"
        isOutsideRange={() => false}
        startDate={moment(props.query.start_date)}
        startDateId="orders-datepicker-start"
        endDate={moment(props.query.end_date)}
        endDateId="orders-datepicker-end"
        onDatesChange={onDateRangeChange}
        focusedInput={focussedPicker}
        onFocusChange={focusedInput => setFocussedPicker(focusedInput)}
        minimumNights={0}
        customInputIcon={<i className="fas fa-calendar mr-sm"></i>}
        readOnly
      />
    </div>
  );
};

export default Filter;
