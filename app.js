const uuidv1 = require('uuid/v1')

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 })
const log = console.log

// Use DB?
var lobbies = []
var peers = []

clients = []

var methods = {}


// Lobbies
methods.addLobby = function(message, ws){
  log("addLobby")
  lobbies.push(message.lobby)
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        method: 'lobbyAdded',
        lobby: message.lobby,
      }))
    }
  })
}

methods.joinLobby = function(message, ws){
  lobbies.forEach(lobby => {
    if(lobby.id == message.lobby_id){
      lobby.peers.push(message.peer)
    }
  })
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        method: 'peerJoined',
        lobby_id: message.lobby_id,
        peer: message.peer
      }))
    }
  })
}

methods.peerBAnswer = function(message, ws){
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        method: 'peerBAnswer',
        to: message.to,
        from: message.from,
        desc: message.desc
      }))
    }
  })
}

methods.peerIceCandidate = function(message, ws){
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        method: 'peerIceCandidate',
        to: message.to,
        from: message.from,
        candidate: message.candidate,
      }))
    }
  })
}



methods.closeLobbies = function(message, ws){
  lobbies = []
  syncLobbies(ws)

}

methods.updateLobby = function(message, ws){
  lobbies.forEach(lobby => {
    if(lobby.id == message.lobby.id){
      lobby = message.lobby
    }
  })
}

const syncLobbies = function(ws){
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        method: 'lobbiesUpdated',
        lobbies: lobbies
      }))
    }
  })
}

const syncLobby = function(ws, lobby){
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        method: 'lobbyUpdated',
        lobby: lobby
      }))
    }
  })
}


wss.on('connection', function connection(ws) {
  lobbies = []
  ws.on('message', function incoming(message) {
    message = JSON.parse(message)
    methods[message.method](message, ws)
  })

  // Init
  ws.send(JSON.stringify({
    method: 'init',
    lobbies: lobbies
  }))
})



// const express = require('express')
// const http = require('http');
// const WebSocket = require('ws')

// const app = express()
// const server = http.createServer(app)
// const wss = new WebSocket.Server({ server, port: 3001 })

// wss.on('connection', function connection(ws, req) {
//   const location = url.parse(req.url, true);
//   // You might use location.query.access_token to authenticate or share sessions
//   // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

//   ws.on('message', function incoming(message) {
//     console.log('received: %s', message);
//   });

//   ws.send('something');
// })

// // List Lobbies
// app.get('/lobbies', (req, res) => {
//   res.setHeader('Content-Type', 'application/json')
//   let response = JSON.stringify([
//     {
//       id: 5,
//       creator: 6
//     },
//     {
//       id: 3,
//       owner: 2
//     }
//   ])

//   res.send(response)
// })

// // Get a Lobby
// app.get('/lobbies/:id', (req, res) => {
//   res.setHeader('Content-Type', 'application/json')
//   let response = JSON.stringify({
//     id: req.params.id,
//     creator: 6
//   })

//   res.send(response)
// })

// // Create a Lobby
// app.post('/lobbies', (req, res) => {
//   // TODO create the lobby
//   console.log(req.params)

//   res.setHeader('Content-Type', 'application/json')
//   let response = JSON.stringify({
//     id: req.params.id,
//     creator: 6
//   })

//   res.send(response)
// })


// // Delete a Lobby
// app.delete('/lobbies/:id', (req, res) => {
//   // TODO create the lobby
//   console.log(req.params)

//   res.setHeader('Content-Type', 'application/json')
//   let response = JSON.stringify({
//     id: req.params.id,
//     creator: 6
//   })

//   res.send(response)
// })


// // Join a Lobby
// app.put('/lobbies/join', (req, res) => {
//   // TODO join the lobby
//   console.log(req.params)

//   res.setHeader('Content-Type', 'application/json')
//   let response = JSON.stringify({
//     id: req.params.id,
//     creator: 6
//   })

//   res.send(response)
// })


// // 404
// app.get('*', function(req, res){
//   res.send('no matching route', 404);
// });

// app.listen(8080, () => {
//   console.log('Example app listening on port 8080!')
// })
