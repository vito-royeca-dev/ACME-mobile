import { Tunnel } from "./Tunnel";
import { memo } from "react";

export const Tunnels = ({tunnels}) => {
  return <>
   {tunnels.map((tunnel) => (
      <Tunnel 
        key={String(tunnel._id)}
        id={String(tunnel._id)}
        coordinates={tunnel.coordinates}
        lineColor={tunnel.color}
        opacity={tunnel.opacity}
      />
    ))}
  </>
};

export default memo(Tunnels);