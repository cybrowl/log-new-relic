import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
  'status_code' : number,
}
export interface LogEvent { 'tags' : Tags, 'time' : bigint, 'message' : string }
export type Message = string;
export interface PayloadHealthMetric {
  'parent_canister_id' : string,
  'metrics' : Array<[string, bigint]>,
  'name' : string,
  'child_canister_id' : string,
}
export type Tags = Array<[string, string]>;
export interface _SERVICE {
  'get_logs' : ActorMethod<[], Array<LogEvent>>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'log_event' : ActorMethod<[Tags, Message], undefined>,
  'log_health_metric' : ActorMethod<[Tags, PayloadHealthMetric], undefined>,
  'version' : ActorMethod<[], bigint>,
}
