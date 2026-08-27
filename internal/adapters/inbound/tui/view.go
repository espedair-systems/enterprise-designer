package tui

import (
	"fmt"
	"strings"
	"time"

	"github.com/charmbracelet/lipgloss"
)

var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#FAFAFA")).
			Background(lipgloss.Color("#4F46E5")).
			Padding(0, 1)

	activeTabStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#0F172A")).
			Background(lipgloss.Color("#00FFFF")).
			Padding(0, 2)

	inactiveTabStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#94A3B8")).
				Padding(0, 1)

	panelHeaderStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(lipgloss.Color("#38BDF8"))

	labelStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#94A3B8"))

	valStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FAFAFA")).
			Bold(true)

	accentStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#34D399")).
			Bold(true)

	warnStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#F59E0B")).
			Bold(true)

	errStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#EF4444")).
			Bold(true)

	infoStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#38BDF8"))

	selectedItemStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(lipgloss.Color("#FFFFFF")).
				Background(lipgloss.Color("#312E81"))

	normalItemStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#E2E8F0"))

	badgeStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#0F172A")).
			Background(lipgloss.Color("#38BDF8")).
			Padding(0, 1)

	badgeArchStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#0F172A")).
			Background(lipgloss.Color("#A855F7")).
			Padding(0, 1)

	badgeGreenStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#0F172A")).
			Background(lipgloss.Color("#34D399")).
			Padding(0, 1)

	cardBoxStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color("#334155")).
			Padding(0, 1)
)

func (m Model) View() string {
	width := m.Width
	if width < 80 {
		width = 80
	}

	height := m.Height
	if height < 24 {
		height = 24
	}

	// Dynamic vertical height calculation to occupy the entire terminal screen
	contentHeight := height - 7
	if contentHeight < 15 {
		contentHeight = 15
	}

	var b strings.Builder

	// 1. Top Header Bar: Dynamic full-width justified layout
	titleBar := titleStyle.Render("Designer Control & Telemetry")
	profileBadge := badgeStyle.Render(fmt.Sprintf("Profile: %s", m.ActiveResolution))
	schemaBadge := badgeArchStyle.Render("Schema: DES_BASE (PostgreSQL)")
	serverBadge := badgeGreenStyle.Render(fmt.Sprintf("URL: %s", m.ServerURL))

	leftHeader := titleBar
	rightHeader := lipgloss.JoinHorizontal(lipgloss.Center, profileBadge, " ", schemaBadge, " ", serverBadge)

	headerGap := width - lipgloss.Width(leftHeader) - lipgloss.Width(rightHeader) - 2
	if headerGap < 2 {
		headerGap = 2
	}
	headerRow := lipgloss.JoinHorizontal(lipgloss.Center, leftHeader, strings.Repeat(" ", headerGap), rightHeader)
	b.WriteString(headerRow + "\n\n")

	// 2. Navigation Tabs
	tabMetrics := inactiveTabStyle.Render("[1] Dashboard & Telemetry")
	tabLogs := inactiveTabStyle.Render("[2] Streaming Logs")
	tabDb := inactiveTabStyle.Render(fmt.Sprintf("[3] Database (DES_BASE: %d Tables, %d Rows)", len(m.Tables), m.TotalRows))

	switch m.ActiveTab {
	case TabMetrics:
		tabMetrics = activeTabStyle.Render("[1] Dashboard & Telemetry")
	case TabLogs:
		tabLogs = activeTabStyle.Render("[2] Streaming Logs")
	case TabDatabase:
		tabDb = activeTabStyle.Render(fmt.Sprintf("[3] Database (DES_BASE: %d Tables, %d Rows)", len(m.Tables), m.TotalRows))
	}

	tabRow := lipgloss.JoinHorizontal(lipgloss.Top, tabMetrics, "  ", tabLogs, "  ", tabDb)
	b.WriteString(tabRow + "\n\n")

	// 3. Tab Content (with dynamic full width & height based on resolution tier)
	switch m.ActiveTab {
	case TabMetrics:
		b.WriteString(m.renderMetricsTab(width, contentHeight))
	case TabLogs:
		b.WriteString(m.renderLogsTab(width, contentHeight))
	case TabDatabase:
		b.WriteString(m.renderDatabaseTab(width, contentHeight))
	}

	// 4. Footer & Status Bar: Dynamic full-width line
	b.WriteString("\n")
	if m.StatusMessage != "" {
		statusStyle := lipgloss.NewStyle().Foreground(lipgloss.Color("#10B981")).Bold(true)
		b.WriteString(statusStyle.Render("STATUS: "+m.StatusMessage) + "\n")
	}

	helpStyle := lipgloss.NewStyle().Foreground(lipgloss.Color("#64748B"))
	footerText := "Keys: [1/2/3/Tab] switch tabs • [↑/↓/j/k] select/scroll • [b] launch web UI • [r] refresh row counts • [c] clear logs • [q] quit"
	b.WriteString(helpStyle.Render(footerText))

	return b.String()
}

func (m Model) renderMetricsTab(width, height int) string {
	snap := m.Snapshot

	if width >= 148 || m.ActiveResolution == Resolution1440p || m.ActiveResolution == Resolution4k {
		// 3-Column Responsive Card Grid for wide screens (1440p, 4k, maximized windows)
		colWidth := (width - 8) / 3

		// Column 1: System Telemetry & HTTP Ingress
		var c1 strings.Builder
		c1.WriteString(panelHeaderStyle.Render("HTTP INGRESS & TELEMETRY") + "\n")
		c1.WriteString(strings.Repeat("─", colWidth-4) + "\n")
		c1.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Server Uptime:"), valStyle.Render(formatDuration(snap.Uptime))))
		c1.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Request Rate:"), accentStyle.Render(fmt.Sprintf("%.1f RPM", snap.RequestRateRPM))))
		c1.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Total Requests:"), valStyle.Render(fmt.Sprintf("%d", snap.TotalRequests))))
		c1.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("HTTP 2xx (Success):"), accentStyle.Render(fmt.Sprintf("%d", snap.Status2xx))))
		c1.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("HTTP 4xx (Client):"), warnStyle.Render(fmt.Sprintf("%d", snap.Status4xx))))
		c1.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("HTTP 5xx (Server):"), errStyle.Render(fmt.Sprintf("%d", snap.Status5xx))))
		c1.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Average Latency:"), infoStyle.Render(fmt.Sprintf("%.2f ms", snap.AvgLatencyMs))))
		c1.WriteString("\n" + panelHeaderStyle.Render("PERSISTENCE & SCHEMAS") + "\n")
		c1.WriteString(strings.Repeat("─", colWidth-4) + "\n")
		c1.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Authoritative DB:"), accentStyle.Render("PostgreSQL 16 (DES_BASE)")))
		c1.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Database Status:"), accentStyle.Render(snap.DBStatus)))
		c1.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Embedded REST API:"), valStyle.Render("Active (Port 8088)")))
		c1.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("React 19 Web UI:"), accentStyle.Render("Embedded Single Binary")))

		// Column 2: Architecture Topologies & Metamodel
		var c2 strings.Builder
		c2.WriteString(panelHeaderStyle.Render("DESIGNER APPLICATIONS & SLOTS") + "\n")
		c2.WriteString(strings.Repeat("─", colWidth-4) + "\n")
		c2.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Scaffolded Studios:"), accentStyle.Render("Fleet Logistics Studio")))
		c2.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Scaffolded Agents:"), valStyle.Render("EA Governance Agent")))
		c2.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Dynamic Slots:"), accentStyle.Render("5 Slots (Rail, Top, L/R, Bot)")))
		c2.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Widget Library:"), valStyle.Render("18+ Low-Code Widgets")))
		c2.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Schematics Modeler:"), accentStyle.Render("Visual ER & DDL Generator")))
		c2.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Column Lineage DAG:"), valStyle.Render("Blast Radius Analyzer Active")))
		c2.WriteString("\n" + panelHeaderStyle.Render("GOVERNANCE & WORKSPACES") + "\n")
		c2.WriteString(strings.Repeat("─", colWidth-4) + "\n")
		c2.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Active Workspace:"), accentStyle.Render("ws-base-default (Primary)")))
		c2.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Persistence Policy:"), valStyle.Render("Strict PostgreSQL DES_BASE")))

		// Column 3: Vectors, Connectors & Operations
		var c3 strings.Builder
		c3.WriteString(panelHeaderStyle.Render("RELEASES & EMBEDDED PIPELINE") + "\n")
		c3.WriteString(strings.Repeat("─", colWidth-4) + "\n")
		c3.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Standalone Binary:"), valStyle.Render("bin/base (21 MB)")))
		c3.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Single Binary Embed:"), accentStyle.Render("//go:embed all:dist")))
		c3.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Code Generator:"), accentStyle.Render("AST-to-Go Service Active")))
		c3.WriteString("\n" + panelHeaderStyle.Render("OPERATIONS & CONTROLS") + "\n")
		c3.WriteString(strings.Repeat("─", colWidth-4) + "\n")
		c3.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Web App URL:"), infoStyle.Render(m.ServerURL)))
		c3.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Launch Browser:"), accentStyle.Render("Press [b]")))
		c3.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Refresh Live Stats:"), accentStyle.Render("Press [r]")))
		c3.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Clear Logs:"), accentStyle.Render("Press [c]")))
		c3.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Resolution Tier:"), valStyle.Render(string(m.ActiveResolution))))

		p1 := cardBoxStyle.Copy().Width(colWidth).Height(height).Render(c1.String())
		p2 := cardBoxStyle.Copy().Width(colWidth).Height(height).Render(c2.String())
		p3 := cardBoxStyle.Copy().Width(colWidth).Height(height).Render(c3.String())

		return lipgloss.JoinHorizontal(lipgloss.Top, p1, " ", p2, " ", p3)
	}

	// 2-Column Responsive Card Grid for Standard 1080p profile
	colWidth := (width - 6) / 2
	if colWidth < 46 {
		colWidth = 46
	}

	// Left Panel: System Telemetry & DB Status
	var left strings.Builder
	left.WriteString(panelHeaderStyle.Render("SERVER TELEMETRY & HTTP TRAFFIC") + "\n")
	left.WriteString(strings.Repeat("─", colWidth-4) + "\n")
	left.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Server Uptime:"), valStyle.Render(formatDuration(snap.Uptime))))
	left.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Request Rate:"), accentStyle.Render(fmt.Sprintf("%.1f RPM", snap.RequestRateRPM))))
	left.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Total Requests:"), valStyle.Render(fmt.Sprintf("%d", snap.TotalRequests))))
	left.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("HTTP 2xx (Success):"), accentStyle.Render(fmt.Sprintf("%d", snap.Status2xx))))
	left.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("HTTP 4xx (Client):"), warnStyle.Render(fmt.Sprintf("%d", snap.Status4xx))))
	left.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("HTTP 5xx (Server):"), errStyle.Render(fmt.Sprintf("%d", snap.Status5xx))))
	left.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Average Latency:"), infoStyle.Render(fmt.Sprintf("%.2f ms", snap.AvgLatencyMs))))
	left.WriteString("\n" + panelHeaderStyle.Render("PERSISTENCE & SCHEMAS") + "\n")
	left.WriteString(strings.Repeat("─", colWidth-4) + "\n")
	left.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Active Database:"), accentStyle.Render("PostgreSQL 16 (DES_BASE)")))
	left.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Database Status:"), accentStyle.Render(snap.DBStatus)))
	left.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("Primary Schema:"), accentStyle.Render("DES_BASE (PostgreSQL)")))
	left.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("REST API Server:"), valStyle.Render("Active (Port 8088)")))
	left.WriteString(fmt.Sprintf("%-22s %s\n", labelStyle.Render("React 19 Web UI:"), accentStyle.Render("Embedded Single Binary")))

	// Right Panel: Summary & Commands
	var right strings.Builder
	right.WriteString(panelHeaderStyle.Render("DESIGNER APPLICATIONS & CAPABILITIES") + "\n")
	right.WriteString(strings.Repeat("─", colWidth-4) + "\n")
	right.WriteString(fmt.Sprintf("%-20s %s\n", labelStyle.Render("Applications:"), accentStyle.Render("Fleet Logistics Studio Active")))
	right.WriteString(fmt.Sprintf("%-20s %s\n", labelStyle.Render("Agents:"), valStyle.Render("EA Governance Agent Active")))
	right.WriteString(fmt.Sprintf("%-20s %s\n", labelStyle.Render("Dynamic Slots:"), accentStyle.Render("5 Configurable Regions")))
	right.WriteString(fmt.Sprintf("%-20s %s\n", labelStyle.Render("Widgets:"), valStyle.Render("18+ Low-Code Widgets")))
	right.WriteString(fmt.Sprintf("%-20s %s\n", labelStyle.Render("Schematics:"), accentStyle.Render("Visual ER & DDL Generator")))
	right.WriteString("\n" + panelHeaderStyle.Render("OPERATIONS & CONTROLS") + "\n")
	right.WriteString(strings.Repeat("─", colWidth-4) + "\n")
	right.WriteString(fmt.Sprintf("%-20s %s\n", labelStyle.Render("Web App URL:"), infoStyle.Render(m.ServerURL)))
	right.WriteString(fmt.Sprintf("%-20s %s\n", labelStyle.Render("Launch Browser:"), accentStyle.Render("Press [b]")))
	right.WriteString(fmt.Sprintf("%-20s %s\n", labelStyle.Render("Refresh Stats:"), accentStyle.Render("Press [r]")))
	right.WriteString(fmt.Sprintf("%-20s %s\n", labelStyle.Render("Clear Logs:"), accentStyle.Render("Press [c]")))
	right.WriteString(fmt.Sprintf("%-20s %s\n", labelStyle.Render("Resolution Profile:"), valStyle.Render(string(m.ActiveResolution))))

	leftPanel := cardBoxStyle.Copy().Width(colWidth).Height(height).Render(left.String())
	rightPanel := cardBoxStyle.Copy().Width(colWidth).Height(height).Render(right.String())

	return lipgloss.JoinHorizontal(lipgloss.Top, leftPanel, " ", rightPanel)
}

func (m Model) renderLogsTab(width, height int) string {
	boxWidth := width - 4
	if boxWidth < 76 {
		boxWidth = 76
	}

	var b strings.Builder
	b.WriteString(panelHeaderStyle.Render("LIVE STREAMING HTTP REQUEST & SERVER LOGS") + "\n")
	b.WriteString(strings.Repeat("─", boxWidth-4) + "\n")

	entries := m.Snapshot.RecentLogs
	if len(entries) == 0 {
		b.WriteString(labelStyle.Render("No server logs recorded yet. Connect browser via [b] or make an API request.\n"))
		return cardBoxStyle.Copy().Width(boxWidth).Height(height).Render(b.String())
	}

	// Dynamic height calculation based on available screen height
	maxLines := height - 4
	if maxLines < 8 {
		maxLines = 8
	}

	start := 0
	if len(entries) > maxLines {
		start = len(entries) - maxLines - m.LogScrollPos
		if start < 0 {
			start = 0
		}
	}
	end := start + maxLines
	if end > len(entries) {
		end = len(entries)
	}

	msgWidth := boxWidth - 36
	if msgWidth < 30 {
		msgWidth = 30
	}

	for _, log := range entries[start:end] {
		statusColor := accentStyle
		if log.Status >= 500 || log.Level == "ERROR" {
			statusColor = errStyle
		} else if log.Status >= 400 || log.Level == "WARN" {
			statusColor = warnStyle
		}

		msg := log.Message
		var line string
		if log.Latency != "" {
			if len(msg) > msgWidth {
				msg = msg[:msgWidth-3] + "..."
			}
			line = fmt.Sprintf("%s │ %-5s │ %-*s │ %s",
				labelStyle.Render(log.Timestamp.Format("15:04:05")),
				statusColor.Render(log.Level),
				msgWidth,
				valStyle.Render(msg),
				infoStyle.Render(log.Latency),
			)
		} else {
			fullMsgWidth := boxWidth - 22
			if fullMsgWidth < 30 {
				fullMsgWidth = 30
			}
			if len(msg) > fullMsgWidth {
				msg = msg[:fullMsgWidth-3] + "..."
			}
			line = fmt.Sprintf("%s │ %-5s │ %s",
				labelStyle.Render(log.Timestamp.Format("15:04:05")),
				statusColor.Render(log.Level),
				valStyle.Render(msg),
			)
		}
		b.WriteString(line + "\n")
	}

	return cardBoxStyle.Copy().Width(boxWidth).Height(height).Render(b.String())
}

func (m Model) renderDatabaseTab(width, height int) string {
	boxWidth := width - 4
	if boxWidth < 76 {
		boxWidth = 76
	}

	var b strings.Builder

	// Header
	b.WriteString(panelHeaderStyle.Render(fmt.Sprintf("POSTGRESQL AUTHORITATIVE SCHEMA: %s (%d Relational Tables, %d Total Rows)", m.SchemaName, len(m.Tables), m.TotalRows)) + "\n")
	b.WriteString(strings.Repeat("─", boxWidth-4) + "\n")

	// Table Header calculation for full screen space utilization
	// Available width for columns
	nameW := 26
	rowW := 12
	colW := 10
	pkW := 16
	statusW := 14
	descW := boxWidth - nameW - rowW - colW - pkW - statusW - 14
	if descW < 20 {
		descW = 20
	}

	headerLine := fmt.Sprintf("  %-*s │ %-*s │ %-*s │ %-*s │ %-*s │ %-*s",
		nameW, "TABLE NAME",
		rowW, "ROW COUNT",
		colW, "COLUMNS",
		pkW, "PRIMARY KEY",
		statusW, "STATUS",
		descW, "DESCRIPTION / PURPOSE",
	)
	b.WriteString(lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#A5B4FC")).Render(headerLine) + "\n")
	b.WriteString(lipgloss.NewStyle().Foreground(lipgloss.Color("#334155")).Render(strings.Repeat("─", boxWidth-4)) + "\n")

	// Rows list
	for i, tbl := range m.Tables {
		desc := tbl.Description
		if len(desc) > descW {
			desc = desc[:descW-3] + "..."
		}

		cursor := "  "
		if i == m.SelectedTableIndex {
			cursor = "▶ "
		}

		rowText := fmt.Sprintf("%s%-*s │ %*d rows │ %2d cols   │ %-*s │ %-*s │ %-*s",
			cursor,
			nameW, tbl.Name,
			rowW-5, tbl.RowCount,
			tbl.ColumnsCount,
			pkW, tbl.PrimaryKey,
			statusW, tbl.Status,
			descW, desc,
		)

		if i == m.SelectedTableIndex {
			b.WriteString(selectedItemStyle.Render(rowText) + "\n")
		} else {
			b.WriteString(normalItemStyle.Render(rowText) + "\n")
		}
	}

	// Bottom detail summary for the selected table
	if m.SelectedTableIndex >= 0 && m.SelectedTableIndex < len(m.Tables) {
		selected := m.Tables[m.SelectedTableIndex]
		b.WriteString("\n" + strings.Repeat("─", boxWidth-4) + "\n")
		detail := fmt.Sprintf("SELECTED: %s.%s │ Primary Key: %s │ Foreign Keys: %s │ Total Rows: %s",
			accentStyle.Render(selected.Schema),
			valStyle.Render(selected.Name),
			infoStyle.Render(selected.PrimaryKey),
			warnStyle.Render(selected.ForeignKeys),
			accentStyle.Render(fmt.Sprintf("%d", selected.RowCount)),
		)
		b.WriteString(detail + "\n")
	}

	b.WriteString("\n" + labelStyle.Render("Navigation: [↑/↓/j/k] select table • [r] refresh live row counts • [b] launch web UI to view and edit tables"))

	return cardBoxStyle.Copy().Width(boxWidth).Height(height).Render(b.String())
}

func formatDuration(d time.Duration) string {
	h := int(d.Hours())
	m := int(d.Minutes()) % 60
	s := int(d.Seconds()) % 60
	return fmt.Sprintf("%02dh %02dm %02ds", h, m, s)
}
