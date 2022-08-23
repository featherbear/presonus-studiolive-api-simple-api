# PreSonus StudioLive API | Simple API
---

A wrapper over the unofficial [PreSonus StudioLive API](https://featherbear.cc/presonus-studiolive-api/) to manage volume levels and mute states of channels.

---

## Installation

`yarn add featherbear/presonus-studiolive-api-simple-api`

## Usage

This wrapper attaches common events to the client. Refer to the [main project](https://featherbear.cc/presonus-studiolive-api) for other functionality

* `<Client>.on('level', (data) => {...})`
* `<Client>.on('mute', (data) => {...})`

## Example

```ts
import Client from 'presonus-studiolive-api-simple-api'

let client = new Client("192.168.0.21")

client.on('level', (data) => {
    // data.channel.type
    // data.channel.channel
    // data.level
    // data.type == 'level'
})

client.on('mute', (data) => {
    // data.channel.type
    // data.channel.channel
    // data.status
    // data.type == 'mute'
})

client.connect().then(() => {
    // Set to 100%
    client.setLevel({
        type: 'LINE',
        channel: 13
    }, 100)

    // Mute
    client.mute({
        type: 'LINE',
        channel: 17
    })
})
```

---

> _If you need a wrapper for an API then your API is probably too feature-rich._  
> _That or, feature-less_ 🤔
