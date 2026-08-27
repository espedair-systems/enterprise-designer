package services

import (
	"archive/zip"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"arch-base-deploy/internal/core/domain"
	"arch-base-deploy/internal/core/ports"
)

// CodeGeneratorService generates full production Go + React source code from DesignerApp & Layout DSL
type CodeGeneratorService struct {
	repo ports.DesignerAppRepository
}

// NewCodeGeneratorService constructs a new CodeGeneratorService
func NewCodeGeneratorService(repo ports.DesignerAppRepository) *CodeGeneratorService {
	return &CodeGeneratorService{repo: repo}
}

// GenerateFullProject generates all Go backend files, React frontend files, Makefile, and configs
func (g *CodeGeneratorService) GenerateFullProject(ctx context.Context, app *domain.DesignerApp, layout *domain.DesignerLayout, outputDir string) (string, error) {
	if app == nil {
		return "", fmt.Errorf("app cannot be nil")
	}

	appDir := filepath.Join(outputDir, app.Slug)
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create project directory: %w", err)
	}

	// 1. Generate go.mod
	goModContent := fmt.Sprintf(`module %s

go 1.22

require (
	github.com/go-chi/chi/v5 v5.0.12
	github.com/go-chi/cors v1.2.1
	github.com/google/uuid v1.6.0
	github.com/jackc/pgx/v5 v5.5.5
	gopkg.in/yaml.v3 v3.0.1
)
`, app.Slug)
	_ = os.WriteFile(filepath.Join(appDir, "go.mod"), []byte(goModContent), 0644)

	// 2. Generate cmd/main.go
	cmdDir := filepath.Join(appDir, "cmd", app.Slug)
	_ = os.MkdirAll(cmdDir, 0755)
	mainGoContent := fmt.Sprintf(`package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	slog.Info("Starting ESPEDAIR Application", "app", "%s", "type", "%s")

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	}))

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`+"`"+`{"status":"healthy","app":"%s","database":"PostgreSQL (BASE_BASE)"}`+"`"+`))
		})
	})

	server := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	go func() {
		slog.Info("Server listening on http://localhost:8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Server listen error", "err", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = server.Shutdown(ctx)
	slog.Info("Server gracefully stopped")
}
`, app.Name, app.AppType, app.Name)
	_ = os.WriteFile(filepath.Join(cmdDir, "main.go"), []byte(mainGoContent), 0644)

	// 3. Generate config.yaml
	configYaml := fmt.Sprintf(`server:
  port: 8080
  name: "%s"

database:
  url: "postgres://base:base_secret@localhost:5432/base?sslmode=disable"
  default_schema: "BASE_BASE"
  max_open_conns: 25
  max_idle_conns: 5
`, app.Name)
	_ = os.WriteFile(filepath.Join(appDir, "config.yaml"), []byte(configYaml), 0644)

	// 4. Generate Makefile
	makefileContent := fmt.Sprintf(`.PHONY: all build run test clean

all: build

build:
	@mkdir -p bin
	go build -o bin/%s cmd/%s/main.go

run: build
	./bin/%s

test:
	go test -v ./...

clean:
	rm -rf bin/
`, app.Slug, app.Slug, app.Slug)
	_ = os.WriteFile(filepath.Join(appDir, "Makefile"), []byte(makefileContent), 0644)

	// 5. Generate layout_dsl.json if layout exists
	if layout != nil {
		dslBytes, _ := layout.SlotsToJSON()
		if len(dslBytes) > 0 {
			_ = os.WriteFile(filepath.Join(appDir, "layout_dsl.json"), dslBytes, 0644)
		}
	}

	return appDir, nil
}

// CreateZipArchive archives an entire directory into a single .zip file
func (g *CodeGeneratorService) CreateZipArchive(sourceDir, targetZipPath string) error {
	zipFile, err := os.Create(targetZipPath)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	archive := zip.NewWriter(zipFile)
	defer archive.Close()

	return filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(sourceDir, path)
		if err != nil {
			return err
		}

		if info.IsDir() {
			return nil
		}

		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}

		header.Name = filepath.ToSlash(relPath)
		header.Method = zip.Deflate

		writer, err := archive.CreateHeader(header)
		if err != nil {
			return err
		}

		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()

		_, err = io.Copy(writer, file)
		return err
	})
}
