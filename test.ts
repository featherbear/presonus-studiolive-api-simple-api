import Client from './src/index'

let client = new Client("192.168.0.21")
client.on('level', function (l) {
    console.log(l);
})

client.on('mute', function (m) {
    console.log(m);
})

client.connect().then(c => {
    console.log("Connected")
})
