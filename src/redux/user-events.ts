import { Action } from "redux"
import { ThunkAction } from "redux-thunk"

import { RootState } from "./store"

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

export const selectUserEventsArray = (rootState: RootState) =>
  rootState.userEvents.allIds.map((id) => rootState.userEvents.byIds[id])

const initialState: UserEventsState = {
  byIds: {},
  allIds: [],
}

const userEventsReducer = (
  state: UserEventsState = initialState,
  action: LoadSuccessAction
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
    default:
      return state
  }
}

export default userEventsReducer
