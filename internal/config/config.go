package config

import (
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

type ArtistServiceConfig struct {
	ID            string `yaml:"id" json:"id"`
	Name          string `yaml:"name" json:"name"`
	URL           string `yaml:"url" json:"url"`
	Enabled       bool   `yaml:"enabled" json:"enabled"`
	HealthPath    string `yaml:"health_path" json:"health_path"`
	TimeoutSec    int    `yaml:"timeout_sec" json:"timeout_sec"`
	DefaultSchema string `yaml:"default_schema,omitempty" json:"default_schema,omitempty"`
	Description   string `yaml:"description,omitempty" json:"description,omitempty"`
}

type AgentServiceConfig struct {
	ID            string   `yaml:"id" json:"id"`
	Name          string   `yaml:"name" json:"name"`
	URL           string   `yaml:"url" json:"url"`
	Enabled       bool     `yaml:"enabled" json:"enabled"`
	HasUI         bool     `yaml:"has_ui" json:"has_ui"`
	Transport     string   `yaml:"transport" json:"transport"`
	HealthPath    string   `yaml:"health_path" json:"health_path"`
	TimeoutSec    int      `yaml:"timeout_sec" json:"timeout_sec"`
	GRPCEndpoint  string   `yaml:"grpc_endpoint,omitempty" json:"grpc_endpoint,omitempty"`
	StorageEngine string   `yaml:"storage_engine,omitempty" json:"storage_engine,omitempty"`
	VectorDim     int      `yaml:"vector_dim,omitempty" json:"vector_dim,omitempty"`
	Description   string   `yaml:"description" json:"description"`
	Tags          []string `yaml:"tags" json:"tags"`
}

type Config struct {
	Server struct {
		Host string `yaml:"host"`
		Port int    `yaml:"port"`
		Mode string `yaml:"mode"`
	} `yaml:"server"`
	Database struct {
		Driver        string `yaml:"driver"`
		DefaultSchema string `yaml:"default_schema"`
		Postgres      struct {
			URL             string `yaml:"url"`
			MaxOpenConns    int    `yaml:"max_open_conns"`
			MaxIdleConns    int    `yaml:"max_idle_conns"`
			ConnMaxLifetime string `yaml:"conn_max_lifetime"`
		} `yaml:"postgres"`
	} `yaml:"database"`
	Auth struct {
		Enabled     bool   `yaml:"enabled"`
		JWTSecret   string `yaml:"jwt_secret"`
		TokenExpiry string `yaml:"token_expiry"`
	} `yaml:"auth"`
	TUI struct {
		Resolution string `yaml:"resolution"` // 1080p | 1440p | 4k | auto
	} `yaml:"tui"`
	CR struct {
		Path   string `yaml:"path" json:"path"`
		Prefix string `yaml:"prefix" json:"prefix"`
		Digits int    `yaml:"digits" json:"digits"`
	} `yaml:"cr" json:"cr"`
	Artists struct {
		EnterpriseArtist  ArtistServiceConfig `yaml:"enterprise_artist" json:"enterprise_artist"`
		BusinessArtist    ArtistServiceConfig `yaml:"business_artist" json:"business_artist"`
		DataArtist        ArtistServiceConfig `yaml:"data_artist" json:"data_artist"`
		AIArtist          ArtistServiceConfig `yaml:"ai_artist" json:"ai_artist"`
		SecurityArtist    ArtistServiceConfig `yaml:"security_artist" json:"security_artist"`
		TechnologyArtist  ArtistServiceConfig `yaml:"technology_artist" json:"technology_artist"`
		ApplicationArtist ArtistServiceConfig `yaml:"application_artist" json:"application_artist"`
	} `yaml:"artists"`
	Agents struct {
		EnterpriseAgent AgentServiceConfig `yaml:"enterprise_agent" json:"enterprise_agent"`
		ArtifactIndexer AgentServiceConfig `yaml:"artifact_indexer" json:"artifact_indexer"`
	} `yaml:"agents"`
	Integrations struct {
		HCM struct {
			Enabled      bool   `yaml:"enabled"`
			SyncInterval string `yaml:"sync_interval"`
		} `yaml:"hcm"`
		Workday struct {
			Enabled      bool   `yaml:"enabled"`
			SyncInterval string `yaml:"sync_interval"`
		} `yaml:"workday"`
	} `yaml:"integrations"`
	Telemetry struct {
		LogLevel      string `yaml:"log_level"`
		EnableTracing bool   `yaml:"enable_tracing"`
	} `yaml:"telemetry"`
}

// GetAllArtists returns all 7 Architecture OS Artist services in canonical order.
func (c *Config) GetAllArtists() []ArtistServiceConfig {
	return []ArtistServiceConfig{
		c.Artists.EnterpriseArtist,
		c.Artists.BusinessArtist,
		c.Artists.DataArtist,
		c.Artists.AIArtist,
		c.Artists.SecurityArtist,
		c.Artists.TechnologyArtist,
		c.Artists.ApplicationArtist,
	}
}

// GetAllAgents returns all autonomous Agent services in canonical order.
func (c *Config) GetAllAgents() []AgentServiceConfig {
	return []AgentServiceConfig{
		c.Agents.EnterpriseAgent,
		c.Agents.ArtifactIndexer,
	}
}

// DefaultConfig returns the default configuration with all Artists and Agents configured.
func DefaultConfig() *Config {
	cfg := &Config{}
	cfg.Server.Host = "0.0.0.0"
	cfg.Server.Port = 8088
	cfg.Server.Mode = "development"
	cfg.Database.Driver = "postgres"
	cfg.Database.DefaultSchema = "BASE_BASE"
	cfg.Database.Postgres.URL = "postgres://base:base_secret@localhost:5432/base?sslmode=disable"
	cfg.Database.Postgres.MaxOpenConns = 25
	cfg.Database.Postgres.MaxIdleConns = 5
	cfg.Database.Postgres.ConnMaxLifetime = "15m"
	cfg.Auth.Enabled = false
	cfg.TUI.Resolution = "1080p"
	cfg.CR.Path = ".design/CR"
	cfg.CR.Prefix = "cr-"
	cfg.CR.Digits = 4

	cfg.Artists.EnterpriseArtist = ArtistServiceConfig{
		ID: "enterprise-artist", Name: "Enterprise Artist", URL: "http://localhost:8080", Enabled: true, HealthPath: "/api/v1/health", TimeoutSec: 3,
	}
	cfg.Artists.BusinessArtist = ArtistServiceConfig{
		ID: "business-artist", Name: "Business Artist", URL: "http://localhost:8088", Enabled: true, HealthPath: "/api/v1/health", TimeoutSec: 3,
	}
	cfg.Artists.DataArtist = ArtistServiceConfig{
		ID: "data-artist", Name: "Data Artist", URL: "http://localhost:8084", Enabled: true, HealthPath: "/api/v1/health", TimeoutSec: 3,
	}
	cfg.Artists.AIArtist = ArtistServiceConfig{
		ID: "ai-artist", Name: "AI Artist", URL: "http://localhost:8083", Enabled: true, HealthPath: "/api/v1/health", TimeoutSec: 3,
	}
	cfg.Artists.SecurityArtist = ArtistServiceConfig{
		ID: "security-artist", Name: "Security Artist", URL: "http://localhost:8085", Enabled: true, HealthPath: "/api/v1/health", TimeoutSec: 3,
	}
	cfg.Artists.TechnologyArtist = ArtistServiceConfig{
		ID: "technology-artist", Name: "Technology Artist", URL: "http://localhost:8086", Enabled: true, HealthPath: "/api/v1/health", TimeoutSec: 3,
	}
	cfg.Artists.ApplicationArtist = ArtistServiceConfig{
		ID: "application-artist", Name: "Application Artist", URL: "http://localhost:8087", Enabled: true, HealthPath: "/api/v1/health", TimeoutSec: 3,
	}

	cfg.Agents.EnterpriseAgent = AgentServiceConfig{
		ID:            "enterprise-agent",
		Name:          "Enterprise Agent",
		URL:           "http://localhost:8090",
		Enabled:       true,
		HasUI:         true,
		Transport:     "http_web_spa",
		HealthPath:    "/api/v1/health",
		TimeoutSec:    3,
		GRPCEndpoint:  "localhost:50051",
		StorageEngine: "lancedb",
		VectorDim:     768,
		Description:   "Autonomous Multi-Agent Architecture Synthesis & Knowledge Graph",
		Tags: []string{
			"Multi-Agent Systems",
			"LanceDB Vectors",
			"OmniGraph Engine",
			"Gemini 2.0 Flash",
			"Artifact Synthesis",
		},
	}
	cfg.Agents.ArtifactIndexer = AgentServiceConfig{
		ID:            "artifact-indexer",
		Name:          "Artifact Indexer",
		URL:           "http://localhost:8095",
		Enabled:       true,
		HasUI:         false,
		Transport:     "mcp_stdio_sse",
		HealthPath:    "/health",
		TimeoutSec:    3,
		StorageEngine: "lancedb",
		VectorDim:     768,
		Description:   "Rust High-Performance Hexagonal AST Vector Indexer & OpenLineage Export",
		Tags: []string{
			"Rust Hexagonal Core",
			"LanceDB Vectors",
			"AST Parser",
			"OpenLineage Graph",
			"MCP Headless Server",
		},
	}

	cfg.Integrations.HCM.Enabled = true
	cfg.Integrations.HCM.SyncInterval = "1h"
	cfg.Integrations.Workday.Enabled = true
	cfg.Integrations.Workday.SyncInterval = "1h"
	cfg.Telemetry.LogLevel = "info"
	return cfg
}

// LoadConfig reads YAML configuration from disk with robust path discovery.
func LoadConfig(path string) (*Config, error) {
	cfg := DefaultConfig()

	candidatePaths := []string{}
	if path != "" {
		candidatePaths = append(candidatePaths, path)
	}
	candidatePaths = append(candidatePaths,
		"config.yaml",
		"./config.yaml",
		"/run/media/jonk/Workspace/ESPEDAIR/template-artist/config.yaml",
	)

	if execPath, err := os.Executable(); err == nil {
		execDir := filepath.Dir(execPath)
		candidatePaths = append(candidatePaths,
			filepath.Join(execDir, "config.yaml"),
			filepath.Join(execDir, "..", "config.yaml"),
		)
	}

	var data []byte
	var readErr error
	var foundPath string

	for _, p := range candidatePaths {
		if d, err := os.ReadFile(p); err == nil {
			data = d
			foundPath = p
			break
		} else {
			readErr = err
		}
	}

	if len(data) == 0 {
		return cfg, readErr
	}

	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, err
	}

	_ = foundPath
	return cfg, nil
}
