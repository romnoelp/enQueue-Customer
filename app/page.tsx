"use client";

import axios from 'axios';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qrId = searchParams.get('qr_id');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!qrId) {
      router.push('/unauthorized');
      return;
    }

    const fetchQueueAccess = async () => {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;

      try {
        const response = await axios.get(`${baseUrl}/queues/queue-access`, {
          params: {
            initialQrId: qrId,
          }
        });

        // Handle the response data as needed
        console.log('Queue access data:', response.data);
        const sessionId = response.data.sessionId;
        if (sessionId) {
          document.cookie = `sessionId=${encodeURIComponent(sessionId)}; path=/; max-age=86400; SameSite=Lax`;
          console.log('sessionId cookie set:', sessionId);
        }
        router.push(response.data.path);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          router.push('/unauthorized');
          return;
        }
        console.error('Error fetching queue access:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueueAccess();
  }, [qrId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading queue access...</p>
        </div>
      </div>
    );
  }

  return null;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
}
