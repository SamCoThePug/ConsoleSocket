var Docker = require('dockerode');
const express = require('express')
const app = express()
var expressWs = require('express-ws')(app);
app.listen(8081)
var docker = new Docker();
let containers = {};
docker.listContainers(function (err, containerss) {
  containerss.forEach(function (containerInfo) {
        console.log(containerInfo.Names[0].replace("/","").split("-")[0])
        let cpternm = containerInfo.Names[0].replace("/","").split("-")[0];
        containers[cpternm] = containerInfo.Id;
  });
});

app.ws('*', async (ws, req) => {
console.log("WS CON ON "+req.path.replace(".websocket", ""))
let path = req.path.replace(".websocket", "");
let patharg = path.split("/")
if(req.path.startsWith("/server/")) {
console.log(patharg[2])
if(!containers[patharg[2]]) {
ws.send("Invalid Server.")
ws.close()
return;
}else{
let container = docker.getContainer(containers[patharg[2]])
container.attach({hijack:true,stream: true, stdout: true, stderr: true, stdin:true}, function (err, stream) {
stream.on('data', async data => {
ws.send(data.toString())
})
});
}
}else{
ws.close()
}
})
