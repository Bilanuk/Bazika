'use client';

import React, { useState } from 'react';
import { useSources } from '@/hooks/useSources';
import { useContentItems } from '@/hooks/useContentItems';
import { useSourcesQuery } from '@/hooks/useSourcesQuery';
import { useContentItemsQuery } from '@/hooks/useContentItemsQuery';
import { useBackendApi } from '@/lib/api';

// Example 1: Using basic React hooks
export function BasicHooksExample() {
  const { sources, loading, error, refetch } = useSources();
  const { contentItems, loading: itemsLoading } = useContentItems({
    limit: 10,
  });

  if (loading || itemsLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Basic Hooks Example</h2>
      <button onClick={refetch}>Refresh</button>
      <div>Sources: {sources.length}</div>
      <div>Content Items: {contentItems.length}</div>
    </div>
  );
}

// Example 2: Using React Query (if you have it installed)
export function ReactQueryExample() {
  const { data: sources, isLoading, error, refetch } = useSourcesQuery();
  const { data: contentItems, isLoading: itemsLoading } = useContentItemsQuery({
    limit: 10,
  });

  if (isLoading || itemsLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>React Query Example</h2>
      <button onClick={() => refetch()}>Refresh</button>
      <div>Sources: {sources?.length || 0}</div>
      <div>Content Items: {contentItems?.length || 0}</div>
    </div>
  );
}

// Example 3: Using backend API directly
export function BackendApiExample() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const api = useBackendApi();

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await api.getMonitoringStatus();
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerMonitor = async () => {
    try {
      const response = await api.triggerManualMonitor();
      console.log('Monitor triggered:', response);
      await fetchStatus(); // Refresh status
    } catch (error) {
      console.error('Error triggering monitor:', error);
    }
  };

  React.useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Backend API Example</h2>
      <button onClick={fetchStatus}>Refresh Status</button>
      <button onClick={triggerMonitor}>Trigger Monitor</button>
      {status && (
        <div>
          <div>Active Sources: {status.activeSources}</div>
          <div>Unprocessed Items: {status.unprocessedItems}</div>
          <div>Recent Items: {status.recentItems?.length || 0}</div>
        </div>
      )}
    </div>
  );
}

// Example 4: Manual fetch with useEffect
export function ManualFetchExample() {
  const [sources, setSources] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sourcesRes, itemsRes] = await Promise.all([
        fetch('/api/sources'),
        fetch('/api/content-items?limit=10'),
      ]);

      const sourcesData = await sourcesRes.json();
      const itemsData = await itemsRes.json();

      setSources(sourcesData.sources || []);
      setContentItems(itemsData.contentItems || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Manual Fetch Example</h2>
      <button onClick={fetchData}>Refresh</button>
      <div>Sources: {sources.length}</div>
      <div>Content Items: {contentItems.length}</div>
    </div>
  );
}
