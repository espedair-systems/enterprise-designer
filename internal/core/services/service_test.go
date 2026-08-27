package services

import (
	"context"
	"testing"

	"arch-base-deploy/internal/adapters/outbound/memory"
	"arch-base-deploy/internal/core/domain"

	"github.com/stretchr/testify/assert"
)

func TestExecutiveDashboardAnalytics(t *testing.T) {
	repo := memory.NewMemoryRepository()
	svc := NewBusinessArchitectureService(repo)

	dash, err := svc.GetExecutiveDashboard(context.Background(), "ws-default")
	assert.NoError(t, err)
	assert.NotNil(t, dash)

	assert.Greater(t, dash.TotalCapabilities, 0)
	assert.Greater(t, dash.AverageCapabilityMaturity, 0.0)
	assert.Greater(t, dash.TotalValueStreams, 0)
	assert.Greater(t, dash.AvgFlowEfficiencyPct, 0.0)
	assert.Greater(t, dash.TotalBusinessProcesses, 0)
	assert.Greater(t, dash.TotalInitiativeBudgetUSD, 0.0)
}

func TestCapabilityHeatmapAndGaps(t *testing.T) {
	repo := memory.NewMemoryRepository()
	svc := NewBusinessArchitectureService(repo)
	ctx := context.Background()

	heatmap, err := svc.GetCapabilityHeatmap(ctx, "ws-default")
	assert.NoError(t, err)
	assert.NotEmpty(t, heatmap)

	gaps, err := svc.GetCapabilityGaps(ctx, "ws-default")
	assert.NoError(t, err)
	assert.NotEmpty(t, gaps)
	for _, g := range gaps {
		assert.Greater(t, g.GapDelta, 0.0)
	}
}

func TestStrategyTraceabilityMatrix(t *testing.T) {
	repo := memory.NewMemoryRepository()
	svc := NewBusinessArchitectureService(repo)
	ctx := context.Background()

	matrix, err := svc.GetStrategyTraceabilityMatrix(ctx, "ws-default")
	assert.NoError(t, err)
	assert.NotEmpty(t, matrix)

	for _, item := range matrix {
		assert.NotEmpty(t, item.GoalTitle)
		assert.NotEmpty(t, item.CapabilityCode)
		assert.Greater(t, item.AlignmentScore, 0.0)
	}
}

func TestPaceBreakdownAndHorizons(t *testing.T) {
	repo := memory.NewMemoryRepository()
	svc := NewBusinessArchitectureService(repo)
	ctx := context.Background()

	pace, err := svc.GetPaceBreakdown(ctx, "ws-default")
	assert.NoError(t, err)
	assert.NotNil(t, pace)
	assert.Greater(t, pace.RecordCount+pace.DifferentiationCount+pace.InnovationCount, 0)

	horizons, err := svc.GetHorizonBudgetSummary(ctx, "ws-default")
	assert.NoError(t, err)
	assert.NotNil(t, horizons)
	assert.Greater(t, horizons.Horizon1BudgetUSD+horizons.Horizon2BudgetUSD+horizons.Horizon3BudgetUSD, 0.0)
}

func TestRepositoryCRUD(t *testing.T) {
	repo := memory.NewMemoryRepository()
	ctx := context.Background()

	cap := &domain.Capability{
		ID:                  "cap-test-01",
		WorkspaceID:         "ws-default",
		Code:                "CAP-TEST",
		Name:                "Test Capability",
		Level:               domain.Level1,
		PaceLayer:           domain.PaceInnovation,
		StrategicImportance: domain.StrategicCore,
		CurrentMaturity:     2.0,
		TargetMaturity:      4.0,
	}

	err := repo.SaveCapability(ctx, cap)
	assert.NoError(t, err)

	fetched, err := repo.GetCapability(ctx, "ws-default", "cap-test-01")
	assert.NoError(t, err)
	assert.Equal(t, "Test Capability", fetched.Name)

	err = repo.DeleteCapability(ctx, "ws-default", "cap-test-01")
	assert.NoError(t, err)

	_, err = repo.GetCapability(ctx, "ws-default", "cap-test-01")
	assert.Error(t, err)
}
