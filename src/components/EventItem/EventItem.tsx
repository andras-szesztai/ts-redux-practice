import React, { useState, useEffect, useRef } from "react"
import { useDispatch } from "react-redux"

import {
  deleteUserEvent,
  updateUserEvent,
  UserEvent,
} from "../../redux/user-events"

interface Props {
  event: UserEvent
}

const EventItem: React.FC<Props> = ({ event }) => {
  const dispatch = useDispatch()
  const handleDeleteClick = () => {
    dispatch(deleteUserEvent(event.id))
  }
  const [editable, setEditable] = useState(false)
  const handleTitleClick = () => {
    setEditable(true)
  }
  const [title, setTitle] = useState(event.title)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (editable) {
      inputRef.current?.focus()
    }
  }, [editable])
  const handleBlur = () => {
    setEditable(false)
    if (title !== event.title) {
      dispatch(updateUserEvent({ ...event, title }))
    }
  }
  return (
    <div className="calendar-event">
      <div className="calendar-event-info">
        <div className="calendar-event-time">10:00 - 12:00</div>
        <div className="calendar-event-title">
          {editable ? (
            <input
              type="text"
              ref={inputRef}
              value={title}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          ) : (
            <span onClick={handleTitleClick}>{event.title}</span>
          )}
        </div>
      </div>
      <button
        className="calendar-event-delete-button"
        onClick={handleDeleteClick}
      >
        &times;
      </button>
    </div>
  )
}

export default EventItem
