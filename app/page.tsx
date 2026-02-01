"use client";

import axios from "axios";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BallBouncingLoader from "@/components/mvpblocks/ball-bouncing-loader";
import { Card, CardContent } from "@/components/ui/card";

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-8">
      <Card className="w-full max-w-md bg-background/70 backdrop-blur-sm">
        <CardContent className="flex min-h-90 flex-col items-center justify-center gap-4">
          <BallBouncingLoader />
          <p className="text-sm text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qrId = searchParams.get("qr_id");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!qrId) {
      router.push("/unauthorized");
      return;
    }

    const fetchQueueAccess = async () => {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;

      try {
        const response = await axios.get(`${baseUrl}/queues/queue-access`, {
          params: {
            initialQrId: qrId,
          },
        });

        // Handle the response data as needed
        console.log("Queue access data:", response.data);
        const sessionId = response.data.sessionId;
        if (sessionId) {
          document.cookie = `sessionId=${encodeURIComponent(sessionId)}; path=/; max-age=86400; SameSite=Lax`;
          console.log("sessionId cookie set:", sessionId);
        }
        router.push(response.data.path);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          router.push("/unauthorized");
          return;
        }
        console.error("Error fetching queue access:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueueAccess();
  }, [qrId, router]);

  if (loading) {
    return <LoadingScreen label="Loading queue access..." />;
  }

  return null;
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading..." />}>
      <PageContent />
    </Suspense>
  );
}
