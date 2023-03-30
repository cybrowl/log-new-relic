import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface LogEvent {
  'env' : string,
  'tags' : Tags,
  'time' : bigint,
  'hostname' : string,
  'logtype' : string,
  'message' : string,
}
export type Message = string;
export type Tags = Array<[string, string]>;
export interface _SERVICE {
  'authorize' : ActorMethod<[], boolean>,
  'clear_logs' : ActorMethod<[], string>,
  'get_logs' : ActorMethod<[], Array<LogEvent>>,
  'log_event' : ActorMethod<[Tags, Message], undefined>,
  'version' : ActorMethod<[], bigint>,
  'whoami' : ActorMethod<[], string>,
}
