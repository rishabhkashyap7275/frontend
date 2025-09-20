import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './OrderTracker.css';
import { useContext } from 'react';
import { StoreContext } from '../../components/Context/StoreContext';

// Haversine distance in km
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const CANTEEN_COORDS = { lat: 26.9124, lon: 75.7873 }; // example coords; set real ones

const OrderTracker = ({ apiBase, token }) => {
  const store = useContext(StoreContext);
  const base = apiBase || store?.url || '';
  const authToken = token || store?.token;
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('pending');
  const [etaMins, setEtaMins] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [error, setError] = useState('');

  // Poll order status
  useEffect(() => {
    let timer;
    const fetchStatus = async () => {
      try {
        const resp = await axios.get(`${base}/api/order/${orderId}`, {
          headers: authToken ? { token: authToken } : undefined
        });
        if (resp.data?.success) {
          setOrder(resp.data.order);
          setStatus(resp.data.order.status);
          setError('');
        }
      } catch (e) {
        if (e?.response?.status === 401) {
          setError('Please log in to view your order.');
        } else if (e?.response?.status === 404) {
          setError('Order not found.');
        } else {
          setError('Unable to fetch order status. Retrying...');
        }
      }
    };
    if (orderId) {
      fetchStatus();
      timer = setInterval(fetchStatus, 5000);
    }
    return () => timer && clearInterval(timer);
  }, [orderId, apiBase]);

  // Geolocation watch
  useEffect(() => {
    if (!navigator.geolocation) return setError('Geolocation not supported');
    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  // Compute walking ETA (mins) assuming 5 km/h
  useEffect(() => {
    if (userPos) {
      const km = distanceKm(userPos.lat, userPos.lon, CANTEEN_COORDS.lat, CANTEEN_COORDS.lon);
      const hours = km / 5; // 5 km/h walking
      setEtaMins(Math.ceil(hours * 60));
    }
  }, [userPos]);

  const progress = useMemo(() => {
    const map = { pending: 10, confirmed: 30, preparing: 60, ready: 90, delivered: 100, cancelled: 0 };
    return map[status] ?? 10;
  }, [status]);

  return (
    <div className="tracker-wrap">
      <h2>Track Your Order</h2>
      {order && (
        <div className="info">
          <div><b>Order:</b> {order.orderNumber}</div>
          <div><b>Status:</b> {status}</div>
          {order.tokenNumber && (
            <div><b>Pickup Token:</b> {order.tokenNumber}</div>
          )}
          {order.estimatedDeliveryTime && (
            <div><b>Est. Ready:</b> {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</div>
          )}
        </div>
      )}

      <div className="progress">
        <div className="bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="stages">
        <span className={progress>=10? 'done':''}>Pending</span>
        <span className={progress>=30? 'done':''}>Confirmed</span>
        <span className={progress>=60? 'done':''}>Preparing</span>
        <span className={progress>=90? 'done':''}>Ready</span>
      </div>

      <div className="location">
        <h3>Pickup Directions</h3>
        {etaMins!=null && <div><b>Walking ETA:</b> ~{etaMins} min</div>}
        {userPos && (
          <div className="coords">
            <div><b>Your location:</b> {userPos.lat.toFixed(5)}, {userPos.lon.toFixed(5)}</div>
            <div><b>Canteen:</b> {CANTEEN_COORDS.lat}, {CANTEEN_COORDS.lon}</div>
          </div>
        )}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default OrderTracker;
