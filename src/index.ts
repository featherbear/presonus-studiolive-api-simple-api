import StudioLiveAPI, { ChannelSelector, CHANNELTYPES, MESSAGETYPES } from 'presonus-studiolive-api'
import EventEmitter from 'events'
import LevelEvent from './types/LevelEvent'
import MuteEvent from './types/MuteEvent'

type CallbackWithData<T> = (data: T) => any

function settingsPathToChannelSelector(path: string | string[]): ChannelSelector {
    if (!Array.isArray(path)) path = path.split("/")

    let [type, channel, ...rest] = path

    let reverseLookup = Object.fromEntries(Object.entries(CHANNELTYPES).map(([a, b]) => [b, a]))
    let TYPE = reverseLookup[type]
    if (!TYPE) throw new Error("Invalid type: " + type)

    let CHANNEL = Math.trunc(Number(channel.slice(2)))

    // `rest` can be used to set the correct type for aux, fx, etc ....

    return {
        type: TYPE as keyof typeof CHANNELTYPES,
        channel: CHANNEL
    }

}
export declare interface Client {
    on(event: 'level', listener: CallbackWithData<LevelEvent>): this;
    on(event: 'mute', listener: CallbackWithData<MuteEvent>): this;
}

export class Client extends EventEmitter {
    #client: StudioLiveAPI
    #MS_last: {}

    constructor(...args: ConstructorParameters<typeof StudioLiveAPI>) {
        super()
        this.#client = new StudioLiveAPI(...args)
        this.#MS_last = {}

        console.log('ok');
        this.#client.on(MESSAGETYPES.Setting, (d) => {
            let { name, value } = d
            name = name.split("/")
            let trailingToken: string = name[name.length - 1]

            switch (trailingToken) {
                case 'mute': {
                    let selector = settingsPathToChannelSelector(name)

                    this.emit('mute', {
                        channel: selector,
                        status: value,
                        type: 'mute'
                    } as MuteEvent)
                    break;
                }

                case 'volume': {
                    let selector = settingsPathToChannelSelector(name)

                    // if stereo link, only one PV and MS response - have to look at MS for changes?

                    this.#client.once(MESSAGETYPES.FaderPosition, (d) => {
                        let position = d[selector.type][selector.channel - 1]
                        this.emit('level', {
                            channel: selector,
                            levelLinear: position,
                            levelLogarithmic: value,
                            type: 'level'
                        } as LevelEvent)

                    })
                    break;
                }
            }

        })


        console.log('listen');
    }

    connect(...args: Parameters<StudioLiveAPI['connect']>) {
        return this.#client.connect(...args)
    }

    setLevel(selector: ChannelSelector, levelLinear: number) {
        return this.#client.setChannelVolumeLinear(selector, levelLinear)
    }

    mute(selector: ChannelSelector, status: boolean) {
        return this.#client.setMute(selector, status)

    }
}

export default Client