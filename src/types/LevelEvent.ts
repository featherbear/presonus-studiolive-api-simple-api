import type Event from "./Event";
import type { ChannelSelector } from 'presonus-studiolive-api'

export default interface LevelEvent extends Event {
    type: 'level'
    channel: ChannelSelector
    levelLinear: number

    /**
     * @deprecated Currently returning RAW values instead
     */
    levelLogarithmic: number
}