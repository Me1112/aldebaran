import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import promiseMiddleware from '../middleware/promise_middleware'
import common from '../reducer/index'
import rule from '../reducer/rule'
import score from '../reducer/score'
import black from '../reducer/black'
import event from '../reducer/event'
import report from '../reducer/report'
import system from '../reducer/system'
import decision from '../reducer/decision'
import verification from '../reducer/verification'

const reducer = combineReducers({ common, rule, score, black, event, report, system, decision, verification })
const store = applyMiddleware(
  thunk,
  promiseMiddleware({ promiseTypeSuffixes: ['PENDING', 'SUCCESS', 'ERROR'] })
)

export default function configureStore(initState) {
  return createStore(reducer, initState, store)
}
