// CURRENTLY ONLY WORKS ON THE MAIN MIX, FOR INPUT DEVICE CHANNELS

import StudioLiveAPI, { ChannelSelector, CHANNELTYPES, MESSAGETYPES } from 'presonus-studiolive-api'
export type { ChannelSelector } from 'presonus-studiolive-api'

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

        this.#client.on(MESSAGETYPES.FaderPosition, (MS: { [s: string]: number[] }) => {
            // For each channel type
            for (let [type, values] of Object.entries(MS)) {

                // For each channel of a given type
                for (let idx = 0; idx < values.length; idx++) {

                    // Store the new value
                    let newValue = values[idx]

                    // Check if stored value is different to the new value
                    if (this.#MS_last?.[type]?.[idx] !== newValue) {

                        this.emit('level', {
                            channel: {
                                type: type,
                                channel: idx + 1 // idx count starts from zero, but channels are one-based
                            },
                            level: newValue,
                            type: 'level'
                        } as LevelEvent)
                    }
                }
            }

            this.#MS_last = MS;
        })

        this.#client.on(MESSAGETYPES.Setting, (PV) => {
            let { name, value } = PV
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
            }
        })
    }

    connect(...args: Parameters<StudioLiveAPI['connect']>) {
        return this.#client.connect(...args).then(() => this)
    }

    setLevel(selector: ChannelSelector, levelLinear: number) {
        return this.#client.setChannelVolumeLinear(selector, levelLinear)
    }

    mute(selector: ChannelSelector, status: boolean) {
        return this.#client.setMute(selector, status)
    }
}

export default Client