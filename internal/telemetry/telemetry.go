package telemetry

import (
	"fmt"
	"sync"
	"time"
)

type LogEntry struct {
	Timestamp time.Time `json:"timestamp"`
	Level     string    `json:"level"` // INFO, WARN, ERROR
	Message   string    `json:"message"`
	Path      string    `json:"path,omitempty"`
	Status    int       `json:"status,omitempty"`
	Latency   string    `json:"latency,omitempty"`
}

type MetricsSnapshot struct {
	StartTime      time.Time     `json:"start_time"`
	Uptime         time.Duration `json:"uptime"`
	TotalRequests  int64         `json:"total_requests"`
	RequestRateRPM float64       `json:"request_rate_rpm"`
	Status2xx      int64         `json:"status_2xx"`
	Status4xx      int64         `json:"status_4xx"`
	Status5xx      int64         `json:"status_5xx"`
	CriticalErrors int64         `json:"critical_errors"`
	AvgLatencyMs   float64       `json:"avg_latency_ms"`
	DBDriver       string        `json:"db_driver"`
	DBConnected    bool          `json:"db_connected"`
	DBStatus       string        `json:"db_status"`
	DBConnections  string        `json:"db_connections"`
	RecentLogs     []LogEntry    `json:"recent_logs"`
}

type Tracker struct {
	mu             sync.RWMutex
	startTime      time.Time
	totalRequests  int64
	status2xx      int64
	status4xx      int64
	status5xx      int64
	criticalErrors int64
	totalLatencyMs float64
	windowRequests []time.Time
	logs           []LogEntry
	maxLogs        int
	dbDriver       string
	dbConnected    bool
	dbStatus       string
	dbConnections  string
}

var globalTracker = NewTracker(200)

// Global returns the singleton telemetry tracker.
func Global() *Tracker {
	return globalTracker
}

func NewTracker(maxLogs int) *Tracker {
	if maxLogs <= 0 {
		maxLogs = 100
	}
	return &Tracker{
		startTime:      time.Now(),
		maxLogs:        maxLogs,
		logs:           make([]LogEntry, 0, maxLogs),
		windowRequests: make([]time.Time, 0, 500),
		dbDriver:       "PostgreSQL",
		dbConnected:    true,
		dbStatus:       "Connected (PostgreSQL / In-Memory Cache)",
		dbConnections:  "pgxpool (Active)",
	}
}

func (t *Tracker) SetDBStatus(driver string, connected bool, status string, connections string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.dbDriver = driver
	t.dbConnected = connected
	t.dbStatus = status
	t.dbConnections = connections
}

func (t *Tracker) RecordRequest(method, path string, status int, duration time.Duration) {
	t.mu.Lock()
	defer t.mu.Unlock()

	now := time.Now()
	t.totalRequests++
	t.windowRequests = append(t.windowRequests, now)
	latencyMs := float64(duration.Microseconds()) / 1000.0
	t.totalLatencyMs += latencyMs

	level := "INFO"
	if status >= 500 {
		t.status5xx++
		t.criticalErrors++
		level = "ERROR"
	} else if status >= 400 {
		t.status4xx++
		level = "WARN"
	} else {
		t.status2xx++
	}

	entry := LogEntry{
		Timestamp: now,
		Level:     level,
		Message:   fmt.Sprintf("%s %s -> %d (%.2fms)", method, path, status, latencyMs),
		Path:      path,
		Status:    status,
		Latency:   fmt.Sprintf("%.2fms", latencyMs),
	}

	if len(t.logs) >= t.maxLogs {
		t.logs = t.logs[1:]
	}
	t.logs = append(t.logs, entry)
}

func (t *Tracker) AddLog(level, msg string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	entry := LogEntry{
		Timestamp: time.Now(),
		Level:     level,
		Message:   msg,
	}
	if len(t.logs) >= t.maxLogs {
		t.logs = t.logs[1:]
	}
	t.logs = append(t.logs, entry)
}

func (t *Tracker) RecordLog(level, msg string) {
	t.AddLog(level, msg)
}

func (t *Tracker) ClearLogs() {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.logs = make([]LogEntry, 0, t.maxLogs)
}

func (t *Tracker) Snapshot() MetricsSnapshot {
	t.mu.Lock()
	defer t.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-1 * time.Minute)
	valid := make([]time.Time, 0, len(t.windowRequests))
	for _, reqTime := range t.windowRequests {
		if reqTime.After(cutoff) {
			valid = append(valid, reqTime)
		}
	}
	t.windowRequests = valid
	rpm := float64(len(valid))

	var avgLatency float64
	if t.totalRequests > 0 {
		avgLatency = t.totalLatencyMs / float64(t.totalRequests)
	}

	logsCopy := make([]LogEntry, len(t.logs))
	copy(logsCopy, t.logs)

	return MetricsSnapshot{
		StartTime:      t.startTime,
		Uptime:         time.Since(t.startTime),
		TotalRequests:  t.totalRequests,
		RequestRateRPM: rpm,
		Status2xx:      t.status2xx,
		Status4xx:      t.status4xx,
		Status5xx:      t.status5xx,
		CriticalErrors: t.criticalErrors,
		AvgLatencyMs:   avgLatency,
		DBDriver:       t.dbDriver,
		DBConnected:    t.dbConnected,
		DBStatus:       t.dbStatus,
		DBConnections:  t.dbConnections,
		RecentLogs:     logsCopy,
	}
}

