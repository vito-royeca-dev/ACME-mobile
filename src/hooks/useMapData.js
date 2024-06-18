import { useState, useEffect } from "react";
import { fetchTunnels, fetchZones } from "../lib/apis";

export const useMapData = () => {
  const [tunnels, setTunnels] = useState([]);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    fetchTunnels(setTunnels);
    fetchZones(setZones);
  }

  return {tunnels, zones};
}