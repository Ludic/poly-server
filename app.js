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

methods.peerCandidate = function(message, ws){
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        method: 'peerCandidate',
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
