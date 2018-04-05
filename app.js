const uuidv1 = require('uuid/v1')

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 })
const log = console.log

// Use DB?
var lobbies = []
var peers = []


var methods = {
  addLobby(message, ws){
    log("addLobby")
    lobbies.push(JSON.parse(message.lobby))
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          method: 'lobbyAdded',
          lobby: message.lobby,
        }))
      }
    })
  },

  joinLobby(message, ws){
    let lobby = lobbies.find(lobby => lobby.id == message.lobby_id)
    lobby.peers.push(message.peer)

    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          method: 'peerJoined',
          peer: message.peer,
          lobby: lobby,
        }))
      }
    })
  },

  peerBAnswer(message, ws){
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
  },

  peerCandidate(message, ws){
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
  },


  closeLobbies(message, ws){
    lobbies = []
    syncLobbies(ws)
  },

  updateLobby(message, ws){
    lobbies.forEach(lobby => {
      if(lobby.id == message.lobby.id){
        lobby = message.lobby
      }
    })
  },

  syncLobbies(ws){
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          method: 'lobbiesUpdated',
          lobbies: lobbies
        }))
      }
    })
  },

  syncLobby(ws, lobby){
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          method: 'lobbyUpdated',
          lobby: lobby
        }))
      }
    })
  }
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
