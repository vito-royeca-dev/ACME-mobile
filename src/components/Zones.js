import MapboxGL from "@rnmapbox/maps";
import { createCirclePolygon } from "../utils/mapbox";
import { memo } from "react";

export const Zones = ({zones}) => {

  return <>
    {zones.filter(z => z.visible).map((zone, index) => (
      <MapboxGL.ShapeSource
        key={`zone-${index}`} // Ensure a unique key based on zone ID or another unique identifier
        id={`zone-${index}`}
        shape={{
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [createCirclePolygon([Number(zone.centerLng), Number(zone.centerLat)], Number(zone.radius) * 1609.34)], // Convert miles to meters for radius
          },
        }}
      >
        <MapboxGL.FillExtrusionLayer
          id={`extrusion-${index}`}
          style={{
            fillExtrusionColor: zone.color,
            fillExtrusionOpacity: 0.8,
            fillExtrusionHeight: 50, // Extrusion height in meters
          }}
        />
      </MapboxGL.ShapeSource>
    ))}
  </>
};

export default memo(Zones);