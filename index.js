import { io } from 'socket.io-client'
import { ref } from 'vue'

/* 
Current feature set:
- Listen for vuex action executions
-- Fire updates as appropriate back to the socket
- Listen to all socket messages
-- Pull out messages that match vuex actions
-- Fire valid actions with socket message payload
*/

export default {
  install: (app, { connection, store, pluginOptions, socketOptions }) => {
    const socket = io(connection, socketOptions)
    
    let logger = ()=>{}

    try {
      if(pluginOptions.verbose === true) {
        logger = console.log
      }
    } catch(e) {
      //verbose not explicitly enabled
    }

    // Collect all valid actions from the store
    const validActions = Object.keys(store._actions)
    
    // The subscription function gets triggered for each action execution
    const actionsSubscription = store.subscribeAction((action, state) => {
      logger("subscribe action", {
        type: action.type, 
        payload: action.payload
      })

      // All actions are sent back to the socket
      logger("sending back to the socket")
      socket.emit(action.type, action.payload)
    })
    
    // Evaluate all incoming socket messages
    socket.onAny((event, data) => {

      // Check message against list of valid actions
      if(validActions.includes(event)) {
        
        // Trigger the action, if valid
        logger(`Event ${event} is valid, dispatching`)
        store.dispatch(event, data)
      } else {
        
        // Log the message if it doesn't map to a valid action
        logger(`Event ${event} is invalid, ignoring`)
      }
    });    
    
    // Purposefully not documented, because these are just for debugging
    // The socket is provided as a global variable
    app.config.globalProperties.socket = socket
    // And as an injectable property
    app.provide('socket', socket)
  }
}