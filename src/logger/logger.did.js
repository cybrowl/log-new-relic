export const idlFactory = ({ IDL }) => {
  const Tags = IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text));
  const LogEvent = IDL.Record({
    'tags' : Tags,
    'time' : IDL.Int,
    'message' : IDL.Text,
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'upgrade' : IDL.Bool,
    'status_code' : IDL.Nat16,
  });
  const Message = IDL.Text;
  const PayloadHealthMetric = IDL.Record({
    'parent_canister_id' : IDL.Text,
    'metrics' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Int)),
    'name' : IDL.Text,
    'child_canister_id' : IDL.Text,
  });
  return IDL.Service({
    'authorize' : IDL.Func([], [IDL.Bool], []),
    'clear_logs' : IDL.Func([], [IDL.Text], []),
    'get_logs' : IDL.Func([], [IDL.Vec(LogEvent)], ['query']),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'log_event' : IDL.Func([Tags, Message], [], []),
    'log_health_metric' : IDL.Func([Tags, PayloadHealthMetric], [], []),
    'version' : IDL.Func([], [IDL.Nat], ['query']),
    'whoami' : IDL.Func([], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
