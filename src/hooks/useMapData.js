import { useState, useEffect } from "react";
import { fetchTunnels, fetchZones, getRoute } from "../lib/apis";

export const useMapData = () => {
  const [zones, setZones] = useState([]);
  const [tunnelInfos, setTunnelInfos] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTunnelInfos = async () => {

      const tunnels = await fetchTunnels();

      if (tunnels.length > 0) {
        // Filter visible tunnels and get their routes
        const tunnelDataPromises = tunnels.filter(t => t.visible).map(async (tunnel) => {
          const routes = await getRoute([tunnel.startLng, tunnel.startLat], [tunnel.endLng, tunnel.endLat]);
          let coordinates = [];
          if (routes?.length > 0) {
            coordinates = routes[0].geometry.coordinates;
          }

          return {
            ...tunnel,
            coordinates,
          };
        });

        // Wait for all promises to resolve
        const tunnelData = await Promise.all(tunnelDataPromises);
        setTunnelInfos(tunnelData);
      } else {
        setTunnelInfos([]);
      }
    }

    fetchTunnelInfos();
  }, [])

  const fetchData = async () => {
    fetchZones(setZones);
  }

  return {tunnelInfos, zones};
}