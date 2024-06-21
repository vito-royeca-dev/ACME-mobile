import { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { calculateDistance, isPointInCircle, pointOnRoute, requestPermissions } from '../utils/mapbox';
// import KeyEvent from 'react-native-keyevent';
import { updateCredits, updateLocation } from '../lib/apis';

Geolocation.setRNConfiguration({skipPermissionRequests: true});

export const useLocation = (tunnels, zones) => {
  const [location, setLocation] = useState({latitude: 40.32, longitude: 90.34});
  const [enteredZones, setEnteredZones] = useState([]);
  const [passedTunnels, setPassedTunnels] = useState([]);
  const [va, setI] = useState(0);

  useEffect(() => {
    const getLocation = async () => {
      const hasPermission = await requestPermissions();

      if (!hasPermission) {
        console.error('Location permission not granted');
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          
        },
        err => {
          console.log(err);
        },
      );

      const watchId = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const diff = calculateDistance(position.coords, location);
          if (diff >= 0.1) {
            setLocation({ latitude, longitude });
            // send location and distance change
            updateLocation(position.coords, diff);
          }
        },
        err => {
          console.log(err);
        },
      );
      
      return () => {
        Geolocation.clearWatch(watchId);
      };
    };
        
    getLocation();
    // const arr = [[-114.989484, 32.021166], [-114.989626, 32.027544], [-114.99592, 32.189131], [-115.001955, 32.193967], [-114.970174, 32.201619], [-114.786881, 32.46986], [-114.78129, 32.483403], [-114.774698, 32.481449], [-114.774252, 32.482531], [-114.78203, 32.48493], [-114.78094, 32.491904], [-114.781971, 32.492136], [-114.783637, 32.494154], [-114.562664, 32.497465], [-114.521286, 32.676666], [-114.195942, 32.649066], [-112.756262, 32.939783], [-112.752634, 32.940553], [-112.685286, 32.953567], [-112.625259, 33.423442], [-112.442554, 33.461428], [-112.406925, 33.677344], [-112.131518, 33.769095], [-112.130808, 33.77944], [-112.123348, 34.318841], [-111.979177, 34.531542], [-111.591082, 34.790142], [-111.66751, 35.167826], [-111.58625, 35.215112], [-111.581627, 35.215717], [-111.587914, 35.221198], [-111.42503, 35.854664], [-111.391955, 36.075309], [-111.092595, 36.16607], [-110.879811, 36.391338], [-110.364955, 36.692684], [-109.955197, 36.787717], [-109.721552, 36.946092], [-109.574586, 36.930458], [-109.625707, 37.265522], [-109.472031, 37.426505], [-109.48744, 37.572802], [-109.583672, 37.562676], [-109.591852, 37.574793], [-109.626449, 37.649762], [-109.735679, 37.841286], [-109.774033, 37.840051], [-109.790075, 37.882694], [-109.790709, 37.905934], [-109.87707, 37.978105], [-109.884157, 37.964329], [-109.947813, 37.966215]]
    

    let id = setInterval(() => {
      setLocation(prev => ({
        latitude: prev.latitude + 0.1,
        longitude: prev.longitude + 0.1
      })); 
    } , 1000);

    return () => clearInterval(id)
  }, []);

  useEffect(() => {
    let credits = 0;
    let zoneflag = 0;
    let tunnelflag = 0;

    zones.forEach(zone => {
      const pointOnCircle = isPointInCircle([location.longitude, location.latitude], [zone.centerLng, zone.centerLat], zone.radius);
      if (enteredZones.indexOf(zone._id) === -1 && pointOnCircle) {
        credits += zone.credits;
        setEnteredZones(zones => [...zones, zone._id]);
      } else if (enteredZones.indexOf(zone._id) !== -1 && !pointOnCircle) {
        setEnteredZones(zones => zones.filter(z => z !== zone._id));
      }
      if (!pointOnCircle) zoneflag += 1;
    });

    if (zoneflag === zones.length) setEnteredZones([]);
    
    tunnels.forEach(tunnel => {
      const foundTunnel = passedTunnels.find(t => t._id === tunnel._id) !== undefined;
      const startPoint = [Number(tunnel.startLng.toFixed(2)), Number(tunnel.startLat.toFixed(2))];
      const endPoint = [Number(tunnel.endLng.toFixed(2)), Number(tunnel.endLat.toFixed(2))];
      const position = [Number(location.longitude.toFixed(2)), Number(location.latitude.toFixed(2))];
      const pointInRoute = pointOnRoute([location.longitude, location.latitude], tunnel.coordinates, tunnel.distance * 0.01);

      if (foundTunnel !== undefined) {
        if (startPoint[0] === position[0] && startPoint[1] === position[1] && !(foundTunnel.fromStart)) {
          setPassedTunnels(prev => prev.filter(n => n._id !== tunnel._id));
          credits += tunnel.credits;
        } else if (endPoint[0] === position[0] && endPoint[1] === position[1] && foundTunnel.fromStart) {
          setPassedTunnels(prev => prev.filter(n => n._id !== tunnel._id));
          credits += tunnel.credits;
        } else if (!pointInRoute) {
          setPassedTunnels(prev => prev.filter(n => n._id !== tunnel._id));
        }
      } else {
        if (startPoint[0] === position[0] && startPoint[1] === position[1]) {
          setPassedTunnels(prev => [...prev, {_id: tunnel._id, fromStart: true}])
        } else if (endPoint[0] === position[0] && endPoint[1] === position[1]) {
          setPassedTunnels(prev => [...prev, {_id: tunnel._id, fromStart: false}])
        }
      }
      if (!pointInRoute) tunnelflag += 1;
    })
    if (tunnels.length === tunnelflag) setPassedTunnels([]);

    console.log(passedTunnels, " === ", credits);
    if (credits > 0) updateCredits(credits);
  }, [location]);

  // useEffect(() => {
  //   // Add key down event listener
  //   // Keyboard.addKeyUpListener((keyEvent) => {
  //   //   console.log(`onKeyDown keyCode: ${keyEvent.keyCode}`);
  //   //   handleKeyDown(keyEvent.keyCode);
  //   // });

  //   // Cleanup event listeners on component unmount
  //   // return () => {
  //     // KeyEvent.removeKeyUpListener();
  //   // };
  // }, []);

  const handleKeyDown = (keyCode) => {
    switch (keyCode) {
      case 19:

        setLocation(prev => ({
          ...prev,
          latitude: prev.latitude + 0.1
        }))
        break;
      case 20:
        setLocation(prev => ({
          ...prev,
          latitude: prev.latitude - 0.1
        }))
        break;
      case 21:
        setLocation(prev => ({
          ...prev,
          longitude: prev.longitude - 0.1
        }))
        break;
      case 22:
        setLocation(prev => ({
          ...prev,
          longitude: prev.longitude + 0.1
        }))
        break;
      default:
        console.log('Other key pressed');
    }
  };


  return [[location?.longitude, location?.latitude]];
};
