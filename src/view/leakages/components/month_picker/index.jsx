import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { DatePicker } from 'antd'
import moment from 'moment'
import './index.less'

const { MonthPicker } = DatePicker

export default function CCIMonthPicker(props) {
  const { value = [], onChange, allowClear = false } = props
  const [st, et] = value
  const [startTime, setStartTime] = useState(st)
  const [endTime, setEndTime] = useState(et)
  const [startTimeOpen, setStartTimeOpen] = useState(false)
  const [endTimeOpen, setEndTimeOpen] = useState(false)

  const disabledDateStartTime = (currentDate) => {
    if (endTime) {
      return moment(endTime.format('YYYY-MM-DD')).diff(moment(currentDate.format('YYYY-MM-DD'))) < 0
    }
    return false
  }

  const disabledDateEndTime = (currentDate) => {
    if (startTime) {
      return moment(startTime.format('YYYY-MM-DD')).diff(moment(currentDate.format('YYYY-MM-DD'))) > 0
    }
    return false
  }

  const onChangeStartTime = (startTime) => {
    setStartTime(startTime)
    setEndTimeOpen(!endTime)
    startTime && endTime && onChange && onChange([startTime, endTime])
  }

  const onChangeEndTime = (endTime) => {
    setEndTime(endTime)
    setEndTimeOpen(false)
    if (endTime === null) {
      setStartTime(endTime)
      onChange && onChange([])
    } else {
      startTime && endTime && onChange && onChange([startTime, endTime])
    }
  }

  const onOpenChangeStartTime = (status) => {
    setStartTimeOpen(status)
    status && setEndTimeOpen(false)
  }

  const onOpenChangeEndTime = (status) => {
    if (startTime) {
      setEndTimeOpen(endTime ? status : true)
    } else {
      setStartTimeOpen(true)
    }
  }

  return <span className="cci-calendar-picker">
    <MonthPicker value={startTime} allowClear={false} size="small" placeholder="开始时间"
                 open={startTimeOpen} onOpenChange={onOpenChangeStartTime}
                 onChange={onChangeStartTime} disabledDate={disabledDateStartTime}
                 getCalendarContainer={triggerNode => triggerNode.parentNode} />
    <span className="month-range-picker-separator">~</span>
    <MonthPicker value={endTime} allowClear={allowClear} size="small" placeholder="结束时间" open={endTimeOpen}
                 onOpenChange={onOpenChangeEndTime} onChange={onChangeEndTime}
                 disabledDate={disabledDateEndTime}
                 getCalendarContainer={triggerNode => triggerNode.parentNode} />
  </span>
}

CCIMonthPicker.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  allowClear: PropTypes.bool
}
