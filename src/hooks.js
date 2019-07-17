import { useState, useEffect, useRef } from "react";
import axios from "axios";
function useFetch(url, config) {
  function getData(){
    axios
    .get(url, config)
    .then(response => {
      setData(response.data);
      setLoading(false);
    });
  }
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData();
  }, [url]);
  return [data, getData, loading];
}
function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }
export { useFetch, useInterval };
