package tui

import (
	"arch-base-deploy/internal/core/ports"

	tea "github.com/charmbracelet/bubbletea"
)

// NewTUI initializes and runs the full-featured Bubbletea TUI.
func NewTUI(repo ports.Repository, service ports.BusinessArchitectureService, serverURL string, initialRes ...string) *tea.Program {
	m := InitialModel(repo, service, serverURL, initialRes...)
	return tea.NewProgram(m, tea.WithAltScreen())
}
