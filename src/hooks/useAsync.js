import { useState, useCallback } from 'react';

export function useAsync(asyncFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        return await asyncFn(...args);
      } catch (err) {
        setError(err.message || 'An unexpected error occurred');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { execute, loading, error, setError };
}