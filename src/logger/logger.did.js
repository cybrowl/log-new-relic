export const idlFactory = ({ IDL }) => {
  const Tags = IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text));
  const LogEvent = IDL.Record({
    'tags' : Tags,
    'time' : IDL.Int,
    'message' : IDL.Text,
  });
  const Message = IDL.Text;
  return IDL.Service({
    'authorize' : IDL.Func([], [IDL.Bool], []),
    'clear_logs' : IDL.Func([], [IDL.Text], []),
    'get_logs' : IDL.Func([], [IDL.Vec(LogEvent)], ['query']),
    'log_event' : IDL.Func([Tags, Message], [], []),
    'version' : IDL.Func([], [IDL.Nat], ['query']),
    'whoami' : IDL.Func([], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
