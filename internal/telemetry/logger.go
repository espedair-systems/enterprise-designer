package telemetry

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"strings"
)

// TelemetrySlogHandler forwards all structured logs to the live telemetry tracker and stdout.
type TelemetrySlogHandler struct {
	inner slog.Handler
}

func (h *TelemetrySlogHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return h.inner.Enabled(ctx, level)
}

func (h *TelemetrySlogHandler) Handle(ctx context.Context, record slog.Record) error {
	// 1. Output to stdout
	_ = h.inner.Handle(ctx, record)

	// 2. Format message with key-value attributes
	attrs := make([]string, 0, record.NumAttrs())
	record.Attrs(func(a slog.Attr) bool {
		attrs = append(attrs, fmt.Sprintf("%s=%v", a.Key, a.Value.Any()))
		return true
	})

	levelStr := record.Level.String()
	msg := record.Message
	if len(attrs) > 0 {
		msg = fmt.Sprintf("%s [%s]", msg, strings.Join(attrs, " "))
	}

	Global().AddLog(levelStr, msg)
	return nil
}

func (h *TelemetrySlogHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return &TelemetrySlogHandler{inner: h.inner.WithAttrs(attrs)}
}

func (h *TelemetrySlogHandler) WithGroup(name string) slog.Handler {
	return &TelemetrySlogHandler{inner: h.inner.WithGroup(name)}
}

// InitLogger sets up structured logging for the server and TUI with live streaming into telemetry.
func InitLogger(level string) *slog.Logger {
	var lvl slog.Level
	switch strings.ToLower(level) {
	case "debug":
		lvl = slog.LevelDebug
	case "warn":
		lvl = slog.LevelWarn
	case "error":
		lvl = slog.LevelError
	default:
		lvl = slog.LevelInfo
	}

	jsonHandler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: lvl,
	})

	handler := &TelemetrySlogHandler{inner: jsonHandler}
	logger := slog.New(handler)
	slog.SetDefault(logger)
	return logger
}
