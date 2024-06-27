import { useState, useEffect } from "react";

import { fetchTunnels, fetchZones, getRoute } from "../lib/apis";
import { socket } from "../socket";
import { ZONE_TUNNEL_CHANGE } from "../types/eventTypes";

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
        const tunnelDataPromises = tunnels.filter(t => t.visible).map(async (tunnel) => {
          const routes = await getRoute([tunnel.startLng, tunnel.startLat], [tunnel.endLng, tunnel.endLat]);
          let coordinates = [];
          let distance = 0;

          if (routes?.length > 0) {
            coordinates = routes[0].geometry.coordinates;
            distance = routes[0].distance * 0.000621371;
          }
          return {
            ...tunnel,
            coordinates,
            distance: distance
          };
        });

        const tunnelData = await Promise.all(tunnelDataPromises);
        setTunnelInfos(tunnelData);
      } else {
        setTunnelInfos([]);
      }
    }

    fetchTunnelInfos();
  }, [])

  useEffect(() => {
    const socketListener = socket.on(ZONE_TUNNEL_CHANGE, async ({action, type, data}) => {
      if (type === "tunnel") {
        switch (action) {
          case "create":
            {
              const routes = await getRoute([data.startLng, data.startLat], [data.endLng, data.endLat]);
              let coordinates = [];
              
              if (routes?.length > 0) {
                coordinates = routes[0].geometry.coordinates;
              }

              const tunnelInfo = {
                ...data,
                coordinates,
              };

              setTunnelInfos(prev => ([
                ...prev,
                tunnelInfo
              ]));
            }
            break;
          case "update":
            {
              const routes = await getRoute([data.startLng, data.startLat], [data.endLng, data.endLat]);
              let coordinates = [];

              if (routes?.length > 0) {
                coordinates = routes[0].geometry.coordinates;
              }

              const tunnelInfo = {
                ...data,
                coordinates,
              };

              setTunnelInfos(prev => prev.map(t => t._id === tunnelInfo._id ? tunnelInfo : t));
            }
            break;
          case "delete":
            setTunnelInfos(prev => prev.filter(t => t._id !== data));
            break;
          default:
            break;
        }
      } else {
        switch (action) {
          case "create":
            setZones(prev => [
              ...prev,
              data
            ]);
            break;
          case "update":
            setZones(prev => prev.map(z => z._id === data._id ? data : z));
            break;
          case "delete":
            setZones(prev => prev.filter(z => z._id !== data));
            break;
          default:
            break;
        }
      }
    });

    return () => {
      socket.off(ZONE_TUNNEL_CHANGE, socketListener);
    };
  }, []);

  const fetchData = async () => {
    fetchZones(setZones);
  }

  const filteredTunnels = tunnelInfos.filter(t => t.visible);
  const filteredZones = zones.filter(z => z.visible);
  
  return {
    tunnelInfos: filteredTunnels, 
    zones: filteredZones,
  };
}