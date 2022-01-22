import StudioLiveAPI, { ChannelSelector } from 'presonus-studiolive-api'
import EventEmitter from 'events'
import LevelEvent from './types/LevelEvent'
import MuteEvent from './types/MuteEvent'

type CallbackWithData<T> = (data: T) => any

export declare interface Client {
    on(event: 'level', listener: CallbackWithData<LevelEvent>): this;
    on(event: 'mute', listener: CallbackWithData<MuteEvent>): this;
}

export class Client extends EventEmitter {
    #client: StudioLiveAPI

    constructor(...args: ConstructorParameters<typeof StudioLiveAPI>) {
        super()
        this.#client = new StudioLiveAPI(...args)
    }

    connect(...args: Parameters<StudioLiveAPI['connect']>) {
        this.#client.connect(...args)
    }

    setLevel(selector: ChannelSelector, levelLinear: number) {
        this.#client.setChannelVolumeLinear(selector, levelLinear)
    }

    mute(selector: ChannelSelector, status: boolean) {
        this.#client.setMute(selector, status)

    }
}

export default StudioLiveAPI