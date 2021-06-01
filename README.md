# Vue-vuex-socket.io-opinionated-integration
# A simple library with an incredibly long title

By [Erin Sparling](https://erinsparling.glitch.me) and [Ricky Yurewitch](https://ricc.glitch.me), for [Cooper Union](https://cooper.edu)'s End of the Year Show, 2021

This plugin for Vue 3 projects is designed to glue together a socket.io-provided interface with a vuex store. It does so via an opinionated approach, in that it presurposes that Vuex Actions will be the only thing it interfaces with. 

# Installation
`npm install vue-vuex-socket.io-opinionated-integration`

# Usage

# Example

In your project's `src/store/index.js`

```javascript
import { createStore } from 'vuex'

const socket = { 
  state() {
    return {
      message: {message: undefined, origin: undefined}
    }
  },
  mutations: {
    SOCKET_USER_MESSAGE(state, message) {
      state.message = {message, origin: 'socket'}
    },
    CLIENT_USER_MESSAGE(state, message) {
      state.message = {message, origin: 'client'}
    }    
  },
  actions: {
    socket_userMessage ({ dispatch, commit }, message) {
     commit('SOCKET_USER_MESSAGE', message);
    },
    client_userMessage({ dispatch, commit }, message) {
      commit('CLIENT_USER_MESSAGE', message)
    }
  }
}

export default createStore({
  modules:{
    socket
  }
})
```
