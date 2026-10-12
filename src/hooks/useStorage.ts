import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';

export function useStorageSubscription() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    return storage.subscribe(() => {
      setVersion(v => v + 1);
    });
  }, []);
}
