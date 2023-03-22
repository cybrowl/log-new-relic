 const idlFactory = ({ IDL }) => {
  const Tags = IDL.Vec(IDL.Text);
  const LogEvent = IDL.Record({
    'tags' : Tags,
    'time' : IDL.Int,
    'payload' : IDL.Text,
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'status_code' : IDL.Nat16,
  });
  const Payload = IDL.Text;
  const PayloadHealthMetric = IDL.Record({
    'parent_canister_id' : IDL.Text,
    'metrics' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Int)),
    'name' : IDL.Text,
    'child_canister_id' : IDL.Text,
  });
  return IDL.Service({
    'get_logs' : IDL.Func([], [IDL.Vec(LogEvent)], ['query']),
    'get_logs_json' : IDL.Func([], [HttpResponse], ['query']),
    'log_event' : IDL.Func([Tags, Payload], [], []),
    'log_health_metric' : IDL.Func([Tags, PayloadHealthMetric], [], []),
    'version' : IDL.Func([], [IDL.Nat], ['query']),
  });
};
 const init = ({ IDL }) => { return []; };
module.exports = { idlFactory };
