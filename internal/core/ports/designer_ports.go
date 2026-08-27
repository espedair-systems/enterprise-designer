package ports

import (
	"context"

	"arch-base-deploy/internal/core/domain"
)

// DesignerAppRepository defines database operations for Designer applications and layouts.
type DesignerAppRepository interface {
	// Applications
	CreateApp(ctx context.Context, app *domain.DesignerApp) error
	GetAppByID(ctx context.Context, id string) (*domain.DesignerApp, error)
	GetAppBySlug(ctx context.Context, workspaceID, slug string) (*domain.DesignerApp, error)
	ListApps(ctx context.Context, workspaceID string) ([]*domain.DesignerApp, error)
	UpdateApp(ctx context.Context, app *domain.DesignerApp) error
	DeleteApp(ctx context.Context, id string) error

	// Layouts & Slot Configurations
	SaveLayout(ctx context.Context, layout *domain.DesignerLayout) error
	GetLayoutByAppID(ctx context.Context, appID string) (*domain.DesignerLayout, error)

	// Data Sources
	SaveDatasource(ctx context.Context, ds *domain.DesignerDatasource) error
	ListDatasources(ctx context.Context, workspaceID string) ([]*domain.DesignerDatasource, error)
	DeleteDatasource(ctx context.Context, id string) error
}

// ScaffolderService orchestrates the creation and parameterization of new applications based on templates.
type ScaffolderService interface {
	ScaffoldNewApp(ctx context.Context, app *domain.DesignerApp, layout *domain.DesignerLayout) (string, error)
}
