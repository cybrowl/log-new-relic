import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type AuthorizationError = { 'NotAuthorized' : boolean };
export interface LogEvent {
  'env' : string,
  'tags' : Tags,
  'time' : bigint,
  'hostname' : string,
  'logtype' : string,
  'message' : string,
}
export type Message = string;
export type Result = { 'ok' : Array<LogEvent> } |
  { 'err' : AuthorizationError };
export type Result_1 = { 'ok' : string } |
  { 'err' : AuthorizationError };
export type Tags = Array<[string, string]>;
export interface _SERVICE {
  'authorize' : ActorMethod<[], boolean>,
  'clear_logs' : ActorMethod<[], Result_1>,
  'get_logs' : ActorMethod<[], Result>,
  'health' : ActorMethod<[], undefined>,
  'log_event' : ActorMethod<[Tags, Message], undefined>,
  'version' : ActorMethod<[], bigint>,
  'whoami' : ActorMethod<[], string>,
}
