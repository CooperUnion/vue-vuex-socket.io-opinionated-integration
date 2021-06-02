# Vue-vuex-socket.io-opinionated-integration
# A simple library with an incredibly long title

By [Erin Sparling](https://erinsparling.glitch.me) and [Ricky Yurewitch](https://ricc.glitch.me), for [Cooper Union](https://cooper.edu)'s End of the Year Show, 2021

This plugin for Vue 3 projects is designed to glue together a socket.io-provided interface with a vuex store. It does so via an opinionated approach, in that it presurposes that Vuex Actions will be the only thing it interfaces with. 

[[TOC]]

# Installation
`npm install vue-vuex-socket.io-opinionated-integration`

# Usage
To begin using this plugin, you need to use it in many places in multiple applications. 

## In your Vue 3 application
1. Install it, and include it in a `main.js` or equivalent file.
2. Configure a template to use the data from (and potentially update the data in) a vuex store.
3. Configure a vuex store to have actions that should be triggered in response to socket activity.

## In your socket.io server application
1. In `server.js` or the equivalent configured with socket.io, send and receive messages with the same name as the vuex store actions.


# Examples

## In your vue 3's main.js file
```
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import vuexSocketio from 'vue-vuex-socket.io-opinionated-integration'

const app = createApp(App)
  .use(store)
  .use(router)
  .use(vuexSocketio, {
    connection: <url to your socket.io server>,
    store,
    socketOptions:{
      path: '/socket.io/' //default for socket.io
    }
  })
```


In a single-file vue component:

```html
<template>
  <h1>Current message: {{message}}</h1>
  <ul>
    <li @click="update(Math.random()*1000)">Send a random number</li>
    <li @click="dump()">Dump the current vuex store "state" module to the console</li>
  </ul>
</template>
<script>

  import { ref, computed } from 'vue'
  import { useStore } from 'vuex'  
  
  export default {
    name: 'SocketDebug',
    components: {},
    setup(){

        const store = useStore()
        const message = computed(() => store.state.socket.message)

        const dump = ()=>{
          console.log(store.state.socket)
        }
        
        const update = (message)=>{
          store.dispatch('client_userMessage', `data from vue client, ${message}`)
        }    
        
      return {message, dump, update}
    }
  }
</script>
```

In your project's `src/store/index.js`:

In this example, we have made three example types of messages:
1. *System messages*, which are sent by the application itself. For example, a system status or notification.
2. *Client user messages*, sent from the user of the currentn client Vue application.
3. *Socket user messages*, sent from other users of other clients, to your own.

```javascript
import { createStore } from 'vuex'

const socket = { 
  state() {
    return {
      message: {message: undefined, origin: undefined},
      system_message: {message: undefined, origin: undefined}
    }
  },
  mutations: {
    SOCKET_USER_MESSAGE(state, message) {
      state.message = {message, origin: 'socket'}
    },
    CLIENT_USER_MESSAGE(state, message) {
      state.message = {message, origin: 'client'}
    },
    SOCKET_SYSTEM_MESSAGE(state, message) {
      state.system_message = {message, origin: 'system'}
    }
  },
  actions: {
    socket_userMessage ({ dispatch, commit }, message) {
     commit('SOCKET_USER_MESSAGE', message);
    },
    client_userMessage({ dispatch, commit }, message) {
      commit('CLIENT_USER_MESSAGE', message)
    },
    socket_systemMessage({ dispatch, commit }, message) {
      commit('SOCKET_SYSTEM_MESSAGE', message);
    }
  }
}

export default createStore({
  modules:{
    socket
  }
})
```

This library sets up an Action Subscription to all actions triggered on the vuex store. and each action is automatically sent to the socket server. On the socket server, only a subset of actions are handled.

In this example, while it receives the socket message for each of the above three types of messages, only `socket_systemMessage` and `client_userMessage` are handled. The reason for this is that we're assuming that only messages from the client should be handled and rebroadcast, and are turned into a `socket_userMessage` when sent. 

In your socket server's `server.js`:

```javascript
io.on('connection', function (socket) {
  
  // A theoretical message from the system, to send to all clients
  socket.on('socket_systemMessage', (data)=>{
    // console.log('vue_sendMessage received', data)
    io.emit('socket_systemMessage', data)
  })
  
  // A message from one client that needs to be sent to all other clients
  socket.on('client_userMessage', (data)=>{
    // console.log('client_userMessage received from vue app', data)
    socket.broadcast.emit('socket_userMessage', data)  //send to everyone except the sender --- via https://socket.io/docs/v3/emit-cheatsheet/index.html
  })
});

```
