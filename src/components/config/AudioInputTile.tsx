import React from 'react';
import {
  BarVisualizer,
  TrackReferenceOrPlaceholder,
} from "@livekit/components-react";

export const AudioInputTile = ({
  trackRef,
}: {
  trackRef: TrackReferenceOrPlaceholder;
}) => {
  // helper function to extract additional info from trackRef, if available
  const getTrackInfo = React.useCallback(() => {
    if (trackRef && typeof trackRef === 'object') {
      return {
        id: (trackRef as any).id || 'unknown',
        label: (trackRef as any).label || 'unknown',
      };
    }
    return {};
  }, [trackRef]);

  // === gap 측정 관련 코드 추가 ===
  const [gapMs, setGapMs] = React.useState<number | null>(null);
  const lastInputEndRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!trackRef || typeof trackRef !== 'object') return;

    const track = (trackRef as any).track;
    if (!track || typeof track.on !== "function" || typeof track.off !== "function") return;

    const handleMuted = () => {
      lastInputEndRef.current = performance.now();
    };
    const handleUnmuted = () => {
      if (lastInputEndRef.current !== null) {
        const now = performance.now();
        setGapMs(now - lastInputEndRef.current);
      }
    };

    track.on('muted', handleMuted);
    track.on('unmuted', handleUnmuted);

    return () => {
      track.off('muted', handleMuted);
      track.off('unmuted', handleUnmuted);
    };
  }, [trackRef]);
  // === gap 측정 관련 코드 끝 ===

  // Set up interval logging for audio input events with additional details
  React.useEffect(() => {
    if (trackRef) {
      const inputInterval = setInterval(() => {
        console.log('AudioInput event log', {
          event: 'audioinput',
          time: Date.now(),
          trackType: typeof trackRef,
          trackInfo: getTrackInfo()
        });
      }, 500); // log every 500ms, adjust interval as needed
      return () => clearInterval(inputInterval);
    }
  }, [trackRef, getTrackInfo]);

  // Set up interval logging for audio output events with additional details
  React.useEffect(() => {
    if (trackRef) {
      const outputInterval = setInterval(() => {
        console.log('AudioOutput event log', {
          event: 'audiooutput',
          time: Date.now(),
          trackType: typeof trackRef,
          trackInfo: getTrackInfo()
        });
      }, 500); // log every 500ms, adjust interval as needed
      return () => clearInterval(outputInterval);
    }
  }, [trackRef, getTrackInfo]);

  return (
    <div
      className={`flex flex-row gap-2 h-[100px] items-center w-full justify-center border rounded-sm border-gray-800 bg-gray-900`}
    >
      <BarVisualizer
        trackRef={trackRef}
        className="h-full w-full"
        barCount={20}
        options={{ minHeight: 0 }}
      />
      <div className="text-xs text-gray-400 ml-2">
        {gapMs !== null
          ? `마지막 입력 종료 후 시작까지 gap: ${gapMs.toFixed(0)} ms`
          : "gap 측정 대기 중"}
      </div>
    </div>
  );
};
