package cli

import (
	"context"
	"flag"
	"fmt"
	"io/fs"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	httpAdapter "arch-base-deploy/internal/adapters/inbound/http"
	"arch-base-deploy/internal/adapters/inbound/tui"
	"arch-base-deploy/internal/adapters/outbound/exporters"
	"arch-base-deploy/internal/adapters/outbound/memory"
	"arch-base-deploy/internal/adapters/outbound/postgres"
	"arch-base-deploy/internal/config"
	"arch-base-deploy/internal/core/ports"
	"arch-base-deploy/internal/core/services"
	"arch-base-deploy/internal/telemetry"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Execute handles CLI subcommands and launches the server, TUI, or batch analysis.
func Execute(distFS fs.FS) {
	if len(os.Args) < 2 {
		printUsage()
		return
	}

	subcommand := os.Args[1]
	switch subcommand {
	case "server":
		runServer(os.Args[2:], distFS)
	case "tui":
		runTUI(os.Args[2:], distFS)
	case "analyze":
		runAnalyze(os.Args[2:])
	case "export":
		runExport(os.Args[2:])
	case "version":
		fmt.Println("Base Artist Engine (base) v1.0.0 [Schema: BASE_BASE]")
	default:
		printUsage()
	}
}

func printUsage() {
	fmt.Println(`Base Artist (arch-base-deploy) - Universal Enterprise Architecture Engine

Usage:
  base server   [--config config.yaml] [--port 8088]  Launch REST API server and embedded web SPA
  base tui      [--workspace ws-base-default]         Launch interactive Bubbletea TUI
  base analyze  [--workspace ws-base-default]         Run automated capability gaps & strategy traceability
  base export   --format [bizbok|archimate|csv|md]    Export canonical architecture models
  base version                                        Show version information`)
}

// CheckPortAvailability verifies if the specified host:port is free to bind.
// Returns an active net.Listener on success, or an error if the port is already occupied.
func CheckPortAvailability(host string, port int) (net.Listener, error) {
	addr := fmt.Sprintf("%s:%d", host, port)
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return nil, fmt.Errorf("port %d is already in use on '%s' (bind conflict: %w)", port, host, err)
	}
	return ln, nil
}

func printPortConflictError(host string, port int, err error, mode string) {
	errStr := err.Error()
	if len(errStr) > 64 {
		errStr = errStr[:61] + "..."
	}
	fmt.Fprintf(os.Stderr, "\n")
	fmt.Fprintf(os.Stderr, "╔════════════════════════════════════════════════════════════════════════════════╗\n")
	fmt.Fprintf(os.Stderr, "║ ❌ PORT CONFLICT ERROR: Port %-5d is already in use!                          ║\n", port)
	fmt.Fprintf(os.Stderr, "╠════════════════════════════════════════════════════════════════════════════════╣\n")
	fmt.Fprintf(os.Stderr, "║ Base Artist %-7s cannot start because another process is listening           ║\n", mode)
	fmt.Fprintf(os.Stderr, "║ on address: %-66s ║\n", fmt.Sprintf("%s:%d", host, port))
	fmt.Fprintf(os.Stderr, "║                                                                                ║\n")
	fmt.Fprintf(os.Stderr, "║ Diagnostic & Troubleshooting Steps:                                            ║\n")
	fmt.Fprintf(os.Stderr, "║   1. Inspect active processes using this port:                                 ║\n")
	fmt.Fprintf(os.Stderr, "║      $ lsof -i :%-5d   or   $ fuser %-5d/tcp                                  ║\n", port, port)
	fmt.Fprintf(os.Stderr, "║                                                                                ║\n")
	fmt.Fprintf(os.Stderr, "║   2. Stop the conflicting service or specify an alternate port:                ║\n")
	if mode == "Server" {
		fmt.Fprintf(os.Stderr, "║      $ base server --port %-5d                                               ║\n", port+1)
	} else {
		fmt.Fprintf(os.Stderr, "║      $ base tui --port %-5d                                                  ║\n", port+1)
	}
	fmt.Fprintf(os.Stderr, "║                                                                                ║\n")
	fmt.Fprintf(os.Stderr, "║ Error Detail: %-64s ║\n", errStr)
	fmt.Fprintf(os.Stderr, "╚════════════════════════════════════════════════════════════════════════════════╝\n\n")
}

func initRepoAndService(cfg *config.Config) (ports.Repository, ports.BusinessArchitectureService, ports.Exporter) {
	var repo ports.Repository
	if cfg.Database.Driver == "postgres" {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		pool, err := pgxpool.New(ctx, cfg.Database.Postgres.URL)
		if err == nil && pool.Ping(ctx) == nil {
			slog.Info("PostgreSQL connection pool established", "schema", "BASE_BASE", "max_conns", 25)
			telemetry.Global().SetDBStatus("PostgreSQL", true, "Connected (Schema: BASE_BASE)", "pgxpool (Active)")
			repo = postgres.NewPostgresRepository(pool)
		} else {
			slog.Warn("PostgreSQL connection failed, operating with in-memory repository", "err", err)
			telemetry.Global().SetDBStatus("PostgreSQL (Offline)", false, "Standby / In-Memory Cache", "pgxpool (Retrying)")
			repo = memory.NewMemoryRepository()
		}
	} else {
		slog.Info("Operating with in-memory repository", "driver", "memory")
		repo = memory.NewMemoryRepository()
	}

	svc := services.NewBusinessArchitectureService(repo)
	exp := exporters.NewExporter(repo)
	return repo, svc, exp
}

func runServer(args []string, distFS fs.FS) {
	fsFlags := flag.NewFlagSet("server", flag.ExitOnError)
	configPath := fsFlags.String("config", "config.yaml", "Path to config.yaml")
	portOverride := fsFlags.Int("port", 0, "Override HTTP server port")
	_ = fsFlags.Parse(args)

	cfg, err := config.LoadConfig(*configPath)
	if err != nil {
		fmt.Printf("Warning: error loading config: %v, using defaults\n", err)
	}

	port := cfg.Server.Port
	if *portOverride > 0 {
		port = *portOverride
	}

	// Bootstrap check: Verify port availability before initialization
	ln, err := CheckPortAvailability(cfg.Server.Host, port)
	if err != nil {
		printPortConflictError(cfg.Server.Host, port, err, "Server")
		os.Exit(1)
	}

	logger := telemetry.InitLogger(cfg.Telemetry.LogLevel)
	logger.Info("Starting Base Artist Server", "mode", cfg.Server.Mode, "port", port)

	repo, svc, exp := initRepoAndService(cfg)
	handler := httpAdapter.NewHandler(repo, svc, exp, cfg)
	router := httpAdapter.SetupRouter(handler, distFS)

	srv := &http.Server{
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		fmt.Printf("\n🚀 Base Artist REST API Server & Web UI active on http://localhost:%d\n\n", port)
		if err := srv.Serve(ln); err != nil && err != http.ErrServerClosed {
			logger.Error("Server error", "err", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	logger.Info("Shutting down Base Artist Server gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
}

func runTUI(args []string, distFS fs.FS) {
	fsFlags := flag.NewFlagSet("tui", flag.ExitOnError)
	configPath := fsFlags.String("config", "config.yaml", "Path to config file")
	resFlag := fsFlags.String("res", "auto", "Target Resolution Profile: 1080p, 1440p, 4k, auto")
	portFlag := fsFlags.Int("port", 0, "HTTP server port override")
	_ = fsFlags.Parse(args)

	cfg, _ := config.LoadConfig(*configPath)
	if cfg == nil {
		cfg = config.DefaultConfig()
	}
	serverPort := cfg.Server.Port
	if *portFlag > 0 {
		serverPort = *portFlag
	}

	// Bootstrap check: Verify port availability before launching TUI & background server
	ln, err := CheckPortAvailability(cfg.Server.Host, serverPort)
	if err != nil {
		printPortConflictError(cfg.Server.Host, serverPort, err, "TUI")
		os.Exit(1)
	}

	res := cfg.TUI.Resolution
	if *resFlag != "auto" && *resFlag != "" {
		res = *resFlag
	}
	if res == "" {
		res = "1080p"
	}

	logger := telemetry.InitLogger(cfg.Telemetry.LogLevel)
	logger.Info("Starting Base Artist Engine (base)", "mode", "tui", "profile", res)

	repo, svc, exp := initRepoAndService(cfg)
	serverURL := fmt.Sprintf("http://localhost:%d", serverPort)

	// Start embedded REST server and Web SPA in background for seamless browser access
	handler := httpAdapter.NewHandler(repo, svc, exp, cfg)
	router := httpAdapter.SetupRouter(handler, distFS)
	srv := &http.Server{
		Handler: router,
	}
	go func() {
		logger.Info("Embedded REST API & Web SPA listening", "port", serverPort, "url", serverURL)
		if err := srv.Serve(ln); err != nil && err != http.ErrServerClosed {
			logger.Error("Server error", "err", err)
		}
	}()
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		_ = srv.Shutdown(ctx)
	}()

	logger.Info("TUI live streaming telemetry and dashboard online")

	p := tui.NewTUI(repo, svc, serverURL, res)
	if _, err := p.Run(); err != nil {
		fmt.Printf("Error running TUI: %v\n", err)
	}
}

func runAnalyze(args []string) {
	fsFlags := flag.NewFlagSet("analyze", flag.ExitOnError)
	wsFlag := fsFlags.String("workspace", "ws-base-default", "Target Workspace ID")
	_ = fsFlags.Parse(args)

	cfg, _ := config.LoadConfig("config.yaml")
	_, svc, _ := initRepoAndService(cfg)
	ctx := context.Background()

	dash, _ := svc.GetExecutiveDashboard(ctx, *wsFlag)
	gaps, _ := svc.GetCapabilityGaps(ctx, *wsFlag)

	fmt.Printf("\n======================================================\n")
	fmt.Printf("  BASE ARTIST - EXECUTIVE ARCHITECTURE AUDIT\n")
	fmt.Printf("======================================================\n")
	fmt.Printf("Capabilities Count:          %d\n", dash.TotalCapabilities)
	fmt.Printf("Average Capability Maturity: %.2f / 5.0\n", dash.AverageCapabilityMaturity)
	fmt.Printf("Total Maturity Gap Delta:    %.2f\n", dash.TotalMaturityGap)
	fmt.Printf("Value Stream Flow Efficiency: %.1f%%\n", dash.AvgFlowEfficiencyPct)
	fmt.Printf("Strategic Alignment Score:   %.1f%%\n", dash.StrategicAlignmentScore)
	fmt.Printf("Active Transformation Budget: $%.0f\n\n", dash.TotalInitiativeBudgetUSD)

	fmt.Println("Top Strategic Capability Gaps Requiring Investment:")
	for _, g := range gaps {
		fmt.Printf("  • [%s] %-30s | Maturity: %.1f -> %.1f (Gap: +%.1f) | Action: %s\n",
			g.CapabilityCode, g.CapabilityName, g.CurrentMaturity, g.TargetMaturity, g.GapDelta, g.RecommendedAction)
	}
	fmt.Println()
}

func runExport(args []string) {
	fsFlags := flag.NewFlagSet("export", flag.ExitOnError)
	format := fsFlags.String("format", "bizbok", "Export format: bizbok, archimate, csv, md")
	wsFlag := fsFlags.String("workspace", "ws-base-default", "Target Workspace ID")
	_ = fsFlags.Parse(args)

	cfg, _ := config.LoadConfig("config.yaml")
	_, _, exp := initRepoAndService(cfg)
	ctx := context.Background()

	switch *format {
	case "bizbok":
		data, err := exp.ExportBizBOKJSON(ctx, *wsFlag)
		if err != nil {
			fmt.Printf("Error exporting: %v\n", err)
			return
		}
		fmt.Println(string(data))
	case "archimate":
		data, err := exp.ExportArchiMateXML(ctx, *wsFlag)
		if err != nil {
			fmt.Printf("Error exporting: %v\n", err)
			return
		}
		fmt.Println(string(data))
	case "csv":
		data, err := exp.ExportCapabilityCSV(ctx, *wsFlag)
		if err != nil {
			fmt.Printf("Error exporting: %v\n", err)
			return
		}
		fmt.Println(string(data))
	case "md":
		md, err := exp.ExportStrategyMarkdown(ctx, *wsFlag)
		if err != nil {
			fmt.Printf("Error exporting: %v\n", err)
			return
		}
		fmt.Println(md)
	default:
		fmt.Printf("Unknown format: %s\n", *format)
	}
}
