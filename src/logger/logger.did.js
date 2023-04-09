export const idlFactory = ({ IDL }) => {
  const AuthorizationError = IDL.Variant({ 'NotAuthorized' : IDL.Bool });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Text, 'err' : AuthorizationError });
  const Tags = IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text));
  const LogEvent = IDL.Record({
    'env' : IDL.Text,
    'tags' : Tags,
    'time' : IDL.Int,
    'hostname' : IDL.Text,
    'logtype' : IDL.Text,
    'message' : IDL.Text,
  });
  const Result = IDL.Variant({
    'ok' : IDL.Vec(LogEvent),
    'err' : AuthorizationError,
  });
  const Message = IDL.Text;
  return IDL.Service({
    'authorize' : IDL.Func([], [IDL.Bool], []),
    'clear_logs' : IDL.Func([], [Result_1], []),
    'get_logs' : IDL.Func([], [Result], ['query']),
    'health' : IDL.Func([], [], []),
    'log_event' : IDL.Func([Tags, Message], [], []),
    'version' : IDL.Func([], [IDL.Nat], ['query']),
    'whoami' : IDL.Func([], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
