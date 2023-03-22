import { HttpAgent, Actor } from "@dfinity/agent";

export const getActor = async (canisterId, idlFactory, identity, isProd) => {
  const HOST = isProd
    ? `https://${canisterId}.ic0.app/`
    : `http://127.0.0.1:8080`;

  console.log("HOST: ", HOST);

  if (canisterId === undefined) {
    console.log("canisterId: ", canisterId);
    return null;
  }

  if (idlFactory === undefined) {
    console.log("idlFactory: ", idlFactory);
    return null;
  }

  if (identity === undefined) {
    console.log("identity:", identity);
  }

  const agent = new HttpAgent({
    host: HOST,
    identity: identity,
  });

  if (!isProd) {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  const actor = Actor.createActor(idlFactory, {
    agent: agent,
    canisterId,
  });

  return actor;
};
