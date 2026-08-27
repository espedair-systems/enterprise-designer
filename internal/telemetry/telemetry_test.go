package telemetry

import (
	"testing"
	"time"
)

func TestTelemetryTracker(t *testing.T) {
	tracker := NewTracker(10)
	tracker.RecordRequest("GET", "/api/v1/health", 200, 5*time.Millisecond)
	tracker.RecordRequest("GET", "/api/v1/analytics/dashboard", 200, 10*time.Millisecond)
	tracker.RecordRequest("POST", "/api/v1/capabilities", 400, 2*time.Millisecond)
	tracker.RecordRequest("POST", "/api/v1/valuestreams", 500, 15*time.Millisecond)

	snap := tracker.Snapshot()
	if snap.TotalRequests != 4 {
		t.Fatalf("expected 4 requests, got %d", snap.TotalRequests)
	}
	if snap.Status2xx != 2 {
		t.Errorf("expected 2 2xx requests, got %d", snap.Status2xx)
	}
	if snap.Status4xx != 1 {
		t.Errorf("expected 1 4xx request, got %d", snap.Status4xx)
	}
	if snap.Status5xx != 1 {
		t.Errorf("expected 1 5xx request, got %d", snap.Status5xx)
	}
	if snap.CriticalErrors != 1 {
		t.Errorf("expected 1 critical error, got %d", snap.CriticalErrors)
	}
	if len(snap.RecentLogs) != 4 {
		t.Errorf("expected 4 log entries, got %d", len(snap.RecentLogs))
	}
}
