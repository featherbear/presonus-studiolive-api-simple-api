import Client from './src'

let client = new Client({ host: "192.168.0.29" })
client.on('level', function (l) {
    console.log('level', l);
})

client.on('mute', function (m) {
    console.log('mute', m);
})

client.connect().then(c => {
    console.log("Connected")
})
