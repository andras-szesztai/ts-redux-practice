import React, { useEffect } from "react"
import { connect, ConnectedProps } from "react-redux"

import EventItem from "../EventItem/EventItem"

import { RootState } from "../../redux/store"
import {
  selectUserEventsArray,
  loadUserEvents,
  UserEvent,
} from "../../redux/user-events"
import { addZero } from "../../lib/utils"

import "./Calendar.css"

const mapState = (state: RootState) => ({
  events: selectUserEventsArray(state),
})

const mapDispatch = {
  loadUserEvents,
}

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

interface Props extends PropsFromRedux {}

const createDateKey = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  return `${year}-${addZero(month)}-${addZero(day)}`
}

const groupEventsByDay = (events: UserEvent[]) => {
  const groups: Record<string, UserEvent[]> = {}
  const addToGroup = (dateKey: string, event: UserEvent) => {
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(event)
  }

  events.forEach((event) => {
    const dateStartKey = createDateKey(new Date(event.dateStart))
    const dateEndKey = createDateKey(new Date(event.dateEnd))
    addToGroup(dateStartKey, event)
    if (dateEndKey !== dateStartKey) {
      addToGroup(dateEndKey, event)
    }
  })

  return groups
}

const Calendar: React.FC<Props> = ({ events, loadUserEvents }) => {
  useEffect(() => {
    loadUserEvents()
  }, [loadUserEvents])
  let groupedEvents: ReturnType<typeof groupEventsByDay> | undefined
  let sortedGroupKeys: string[] | undefined
  if (events.length) {
    groupedEvents = groupEventsByDay(events)
    sortedGroupKeys = Object.keys(groupedEvents).sort(
      (date1, date2) => +new Date(date2) - +new Date(date1)
    )
  }
  return groupedEvents && sortedGroupKeys ? (
    <div className="calendar">
      {sortedGroupKeys.map((dayKey) => {
        const dayEvents = groupedEvents ? groupedEvents[dayKey] : []
        const groupDate = new Date(dayKey)
        const day = groupDate.getDate()
        const month = groupDate.toLocaleString(undefined, { month: "long" })
        return (
          <div key={`${dayKey}-day`} className="calendar-day">
            <div className="calendar-day-label">
              <span>
                {day} {month}
              </span>
            </div>
            <div className="calendar-events">
              {dayEvents.map((event) => (
                <EventItem key={`${event.id}-event`} event={event} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  ) : (
    <p>Loading...</p>
  )
}

export default connector(Calendar)
