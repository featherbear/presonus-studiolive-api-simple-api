import type Event from "./Event";
import type { ChannelSelector } from 'presonus-studiolive-api'

export default interface MuteEvent extends Event {
    type: 'mute'
    channel: ChannelSelector
    status: boolean
}