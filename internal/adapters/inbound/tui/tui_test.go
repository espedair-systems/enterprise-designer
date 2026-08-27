package tui

import (
	"testing"
	"time"

	"arch-base-deploy/internal/adapters/outbound/memory"
	"arch-base-deploy/internal/core/services"
	"arch-base-deploy/internal/telemetry"

	tea "github.com/charmbracelet/bubbletea"
)

func TestTUIModelNavigation(t *testing.T) {
	repo := memory.NewMemoryRepository()
	svc := services.NewBusinessArchitectureService(repo)

	m := InitialModel(repo, svc, "http://localhost:8088", "1080p")
	if m.ActiveTab != TabMetrics {
		t.Fatalf("expected initial tab to be TabMetrics, got %d", m.ActiveTab)
	}

	// Test Tab navigation to Logs
	updated, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'2'}})
	m2 := updated.(Model)
	if m2.ActiveTab != TabLogs {
		t.Errorf("expected tab to switch to TabLogs, got %d", m2.ActiveTab)
	}

	// Test Database Tab navigation (DES_BASE)
	updated, _ = m2.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'3'}})
	m3 := updated.(Model)
	if m3.ActiveTab != TabDatabase {
		t.Errorf("expected tab to switch to TabDatabase, got %d", m3.ActiveTab)
	}

	// Verify DES_BASE schema and tables
	if m3.SchemaName != "DES_BASE" {
		t.Errorf("expected schema DES_BASE, got %s", m3.SchemaName)
	}
	if len(m3.Tables) == 0 {
		t.Errorf("expected tables in DES_BASE, got 0")
	}
	if m3.TotalRows == 0 {
		t.Errorf("expected positive total rows count, got 0")
	}

	// Test Table Navigation (down / up)
	updated, _ = m3.Update(tea.KeyMsg{Type: tea.KeyDown})
	m4 := updated.(Model)
	if m4.SelectedTableIndex != 1 {
		t.Errorf("expected selected table index 1, got %d", m4.SelectedTableIndex)
	}

	// Test 'r' for refresh
	updated, _ = m4.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'r'}})
	m5 := updated.(Model)
	if m5.TotalRows == 0 {
		t.Errorf("expected total rows after refresh, got 0")
	}

	// Test View rendering across tabs
	v := m5.View()
	if len(v) == 0 {
		t.Errorf("expected rendered view not to be empty")
	}
}

func TestTUIResolutionAdaptive(t *testing.T) {
	repo := memory.NewMemoryRepository()
	svc := services.NewBusinessArchitectureService(repo)

	m := InitialModel(repo, svc, "http://localhost:8088", "auto")
	updated, _ := m.Update(tea.WindowSizeMsg{Width: 240, Height: 80})
	m2 := updated.(Model)
	if m2.ActiveResolution != Resolution4K {
		t.Errorf("expected 4k resolution for width 240, got %s", m2.ActiveResolution)
	}

	// Test 3-column view rendering at 4k
	view4k := m2.View()
	if len(view4k) == 0 {
		t.Errorf("expected 4k rendered view not to be empty")
	}
}

func TestTUITelemetrySnapshot(t *testing.T) {
	telemetry.Global().RecordRequest("GET", "/api/v1/health", 200, 2*time.Millisecond)
	repo := memory.NewMemoryRepository()
	svc := services.NewBusinessArchitectureService(repo)

	m := InitialModel(repo, svc, "http://localhost:8088")
	updated, _ := m.Update(TickMsg(time.Now()))
	m2 := updated.(Model)
	if m2.Snapshot.TotalRequests == 0 {
		t.Errorf("expected non-zero total requests in telemetry snapshot")
	}
}
