const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs')

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/chamados', function(req, res){
  res.sendFile(__dirname + '/chamados.html');
});

http.listen(3200, function(){
  console.log('listening on *:3000');
});


io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data, 'oi');
  });
  socket.on('connected', (data) => {
    fs.readFile('chamados.json', 'utf8', (err, data) => {
      if (err){
          console.log(err)
      } else {
        obj = JSON.parse(data);
        console.log(obj)
        io.of('/chamados').emit('oi', obj)
    }});
  })
  
  socket.on('chamado', (response) => {
    try{
      fs.readFile('chamados.json', 'utf8', (err, data) => {
        if (err){
            socket.emit('registro', {message: 'Erro ao registrar chamado', ok: false})
        } else {
          obj = JSON.parse(data);
          obj.push(response);
          json = JSON.stringify(obj);
          fs.writeFile('chamados.json', json, 'utf8'); // write it back 
          io.of('/chamados').emit('oi', obj)
      }});
      socket.emit('registro', {message: 'Chamado registrado com sucesso', ok: true})
    } catch(err){
      socket.emit('registro', {message: 'Erro ao registrar chamado', ok: false})
    }
  })
});