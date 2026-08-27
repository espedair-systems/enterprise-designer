package ports

import (
	"context"

	"arch-base-deploy/internal/core/domain"
)

// BusinessArchitectureService defines business domain use cases and analytics orchestration.
type BusinessArchitectureService interface {
	// Analytics & Heatmaps
	GetExecutiveDashboard(ctx context.Context, workspaceID string) (*domain.ExecutiveDashboardKPIs, error)
	GetCapabilityHeatmap(ctx context.Context, workspaceID string) ([]domain.CapabilityHeatmapCell, error)
	GetCapabilityGaps(ctx context.Context, workspaceID string) ([]domain.CapabilityGap, error)
	GetValueStreamFlowAnalysis(ctx context.Context, workspaceID string) ([]domain.ValueStreamMetricSummary, error)
	GetStrategyTraceabilityMatrix(ctx context.Context, workspaceID string) ([]domain.StrategyTraceabilityItem, error)
	GetPaceBreakdown(ctx context.Context, workspaceID string) (*domain.CapabilityPaceBreakdown, error)
	GetHorizonBudgetSummary(ctx context.Context, workspaceID string) (*domain.HorizonBudgetSummary, error)
}

// Exporter defines export operations for enterprise architecture models.
type Exporter interface {
	ExportBizBOKJSON(ctx context.Context, workspaceID string) ([]byte, error)
	ExportArchiMateXML(ctx context.Context, workspaceID string) ([]byte, error)
	ExportStrategyMarkdown(ctx context.Context, workspaceID string) (string, error)
	ExportCapabilityCSV(ctx context.Context, workspaceID string) ([]byte, error)
}
