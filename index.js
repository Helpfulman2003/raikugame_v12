const express = require('express')
const path = require('path')
const opn = require('opn')

const server = express()
const host = 'http://localhost:8082'
server.use('/assets', express.static(path.resolve(__dirname, './assets')))
server.use('/dist', express.static(path.resolve(__dirname, './dist')))
server.use(express.static(path.resolve(__dirname, './')))  // serve root static files (three_integration.js is moved to dist to work on Vercel)

server.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './index.html'));
})

server.listen(8082, () => {
  console.log(`server started at ${host}`)
  opn(host)
})
