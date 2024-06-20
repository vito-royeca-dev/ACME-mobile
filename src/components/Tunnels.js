import { Tunnel } from "./Tunnel";
import { memo } from "react";

export const Tunnels = ({tunnels}) => {
  return <>
   {tunnels.filter(t => t.visible).map((tunnel) => (
      <Tunnel 
        key={tunnel._id}
        id={tunnel._id}
        coordinates={tunnel.coordinates}
        lineColor={tunnel.color}
        opacity={tunnel.opacity}
      />
    ))}
  </>
};

export default memo(Tunnels);