import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export const useNetworkInfo = () => {
  const [internetStatus, setInternetStatus] = useState<boolean>(true);

  useEffect(() => {
    const removeNetInfoSubscription = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setInternetStatus(online || false);
    });

    return () => removeNetInfoSubscription();
  }, []);

  return {
    internetStatus,
  };
};
