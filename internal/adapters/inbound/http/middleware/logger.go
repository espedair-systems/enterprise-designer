package middleware

import (
	"net/http"
	"time"

	"arch-base-deploy/internal/telemetry"
)

type responseWriter struct {
	http.ResponseWriter
	status      int
	writtenBytes int64
}

func (rw *responseWriter) WriteHeader(statusCode int) {
	rw.status = statusCode
	rw.ResponseWriter.WriteHeader(statusCode)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	if rw.status == 0 {
		rw.status = http.StatusOK
	}
	n, err := rw.ResponseWriter.Write(b)
	rw.writtenBytes += int64(n)
	return n, err
}

// TelemetryLogger records request latency and response codes to the global telemetry tracker.
func TelemetryLogger() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			rw := &responseWriter{ResponseWriter: w, status: http.StatusOK}

			next.ServeHTTP(rw, r)

			duration := time.Since(start)
			telemetry.Global().RecordRequest(r.Method, r.URL.Path, rw.status, duration)
		})
	}
}
