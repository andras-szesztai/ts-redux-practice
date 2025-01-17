import { Action } from "redux"
import { ThunkAction } from "redux-thunk"

import { RootState } from "./store"
import { selectDateStart } from "./recorder"

export interface UserEvent {
  id: number
  title: string
  dateStart: string
  dateEnd: string
}

interface UserEventsState {
  byIds: Record<UserEvent["id"], UserEvent>
  allIds: UserEvent["id"][]
}

const LOAD_REQUEST = "useEvents/load_request"
const LOAD_SUCCESS = "useEvents/load_success"
const LOAD_FAIL = "useEvents/load_fail"

interface LoadRequestAction extends Action<typeof LOAD_REQUEST> {}
interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
  payload: { events: UserEvent[] }
}
interface LoadFailAction extends Action<typeof LOAD_FAIL> {
  error: string
}

export const loadUserEvents = (): ThunkAction<
  void,
  RootState,
  undefined,
  LoadRequestAction | LoadSuccessAction | LoadFailAction
> => async (dispatch) => {
  dispatch({
    type: LOAD_REQUEST,
  })

  try {
    const response = await fetch("http://localhost:3001/events")
    const events: UserEvent[] = await response.json()
    dispatch({
      type: LOAD_SUCCESS,
      payload: { events },
    })
  } catch (err) {
    dispatch({
      type: LOAD_FAIL,
      error: "Failed to load events.",
    })
  }
}

const CREATE_REQUEST = "userEvents/create_request"
const CREATE_SUCCESS = "userEvents/create_success"
const CREATE_FAIL = "userEvents/create_fail"

interface CreateRequestAction extends Action<typeof CREATE_REQUEST> {}
interface CreateSuccessAction extends Action<typeof CREATE_SUCCESS> {
  payload: {
    event: UserEvent
  }
}

interface CreateFailAction extends Action<typeof CREATE_FAIL> {
  error: string
}

export const createUserEvent = (): ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  CreateRequestAction | CreateSuccessAction | CreateFailAction
> => async (dispatch, getState) => {
  dispatch({
    type: CREATE_REQUEST,
  })
  try {
    const dateStart = selectDateStart(getState())
    const event: Omit<UserEvent, "id"> = {
      title: "No name",
      dateStart,
      dateEnd: new Date().toISOString(),
    }
    const response = await fetch(`http://localhost:3001/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    })
    const createdEvent: UserEvent = await response.json()
    dispatch({
      type: CREATE_SUCCESS,
      payload: { event: createdEvent },
    })
  } catch (e) {
    dispatch({
      type: CREATE_FAIL,
      error: "Cannot create event",
    })
  }
}

const DELETE_REQUEST = "userEvents/delete_request"
const DELETE_SUCCESS = "userEvents/delete_success"
const DELETE_FAIL = "userEvents/delete_fail"

interface DeleteRequestAction extends Action<typeof DELETE_REQUEST> {}
interface DeleteSuccessAction extends Action<typeof DELETE_SUCCESS> {
  payload: {
    id: UserEvent["id"]
  }
}

interface DeleteFailAction extends Action<typeof DELETE_FAIL> {
  error: string
}

export const deleteUserEvent = (
  id: UserEvent["id"]
): ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  DeleteRequestAction | DeleteSuccessAction | DeleteFailAction
> => async (dispatch) => {
  dispatch({
    type: DELETE_REQUEST,
  })
  try {
    const response = await fetch(`http://localhost:3001/events/${id}`, {
      method: "DELETE",
    })
    if (response.ok) {
      dispatch({
        type: DELETE_SUCCESS,
        payload: {
          id,
        },
      })
    }
  } catch (e) {
    dispatch({
      type: DELETE_FAIL,
      error: "Could not delete event",
    })
  }
}

const UPDATE_REQUEST = "userEvents/update_request"
const UPDATE_SUCCESS = "userEvents/update_success"
const UPDATE_FAIL = "userEvents/update_fail"

interface UpdateRequestAction extends Action<typeof UPDATE_REQUEST> {}
interface UpdateSuccessAction extends Action<typeof UPDATE_SUCCESS> {
  payload: {
    event: UserEvent
  }
}

interface UpdateFailAction extends Action<typeof UPDATE_FAIL> {}

export const updateUserEvent = (
  event: UserEvent
): ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  UpdateRequestAction | UpdateSuccessAction | UpdateFailAction
> => async (dispatch) => {
  dispatch({
    type: UPDATE_REQUEST,
  })

  try {
    const response = await fetch(`http://localhost:3001/events/${event.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })
    const updatedEvent: UserEvent = await response.json()
    dispatch({
      type: UPDATE_SUCCESS,
      payload: { event: updatedEvent },
    })
  } catch (e) {
    dispatch({
      type: UPDATE_FAIL,
    })
  }
}

export const selectUserEventsArray = (rootState: RootState) =>
  rootState.userEvents.allIds.map((id) => rootState.userEvents.byIds[id])

const initialState: UserEventsState = {
  byIds: {},
  allIds: [],
}

const userEventsReducer = (
  state: UserEventsState = initialState,
  action:
    | LoadSuccessAction
    | CreateSuccessAction
    | DeleteSuccessAction
    | UpdateSuccessAction
) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      const { events } = action.payload
      return {
        ...state,
        allIds: events.map((d) => d.id),
        byIds: events.reduce<UserEventsState["byIds"]>((byIds, event) => {
          byIds[event.id] = event
          return byIds
        }, {}),
      }
    case CREATE_SUCCESS:
      const { event } = action.payload
      return {
        ...state,
        allIds: [...state.allIds, event.id],
        byIds: { ...state.byIds, [event.id]: event },
      }
    case DELETE_SUCCESS:
      const { id } = action.payload
      const newState = {
        ...state,
        byIds: { ...state.byIds },
        allIds: state.allIds.filter((sId) => sId !== id),
      }
      delete newState.byIds[id]
      return newState
    case UPDATE_SUCCESS:
      const { event: updatedEvent } = action.payload
      return {
        ...state,
        byIds: { ...state.byIds, [updatedEvent.id]: updatedEvent },
      }
    default:
      return state
  }
}

export default userEventsReducer
