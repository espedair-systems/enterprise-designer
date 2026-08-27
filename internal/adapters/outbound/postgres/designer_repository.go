package postgres

import (
	"context"
	"fmt"
	"time"

	"arch-base-deploy/internal/core/domain"
	"arch-base-deploy/internal/core/ports"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// DesignerPostgresRepository implements ports.DesignerAppRepository
type DesignerPostgresRepository struct {
	pool *pgxpool.Pool
}

// NewDesignerPostgresRepository constructs a new DesignerPostgresRepository
func NewDesignerPostgresRepository(pool *pgxpool.Pool) ports.DesignerAppRepository {
	return &DesignerPostgresRepository{pool: pool}
}

func (r *DesignerPostgresRepository) CreateApp(ctx context.Context, app *domain.DesignerApp) error {
	if app.ID == "" {
		app.ID = "app-" + uuid.New().String()[:8]
	}
	app.CreatedAt = time.Now()
	app.UpdatedAt = time.Now()

	query := `
		INSERT INTO designer_apps (id, workspace_id, name, slug, app_type, description, status, scaffold_path, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.pool.Exec(ctx, query,
		app.ID, app.WorkspaceID, app.Name, app.Slug, app.AppType,
		app.Description, app.Status, app.ScaffoldPath, app.CreatedAt, app.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create designer app: %w", err)
	}
	return nil
}

func (r *DesignerPostgresRepository) GetAppByID(ctx context.Context, id string) (*domain.DesignerApp, error) {
	query := `
		SELECT id, workspace_id, name, slug, app_type, description, status, COALESCE(scaffold_path, ''), created_at, updated_at
		FROM designer_apps WHERE id = $1
	`
	row := r.pool.QueryRow(ctx, query, id)

	var app domain.DesignerApp
	var appType, status string
	err := row.Scan(
		&app.ID, &app.WorkspaceID, &app.Name, &app.Slug,
		&appType, &app.Description, &status, &app.ScaffoldPath,
		&app.CreatedAt, &app.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("app not found: %w", err)
	}
	app.AppType = domain.AppType(appType)
	app.Status = domain.AppStatus(status)
	return &app, nil
}

func (r *DesignerPostgresRepository) GetAppBySlug(ctx context.Context, workspaceID, slug string) (*domain.DesignerApp, error) {
	query := `
		SELECT id, workspace_id, name, slug, app_type, description, status, COALESCE(scaffold_path, ''), created_at, updated_at
		FROM designer_apps WHERE workspace_id = $1 AND slug = $2
	`
	row := r.pool.QueryRow(ctx, query, workspaceID, slug)

	var app domain.DesignerApp
	var appType, status string
	err := row.Scan(
		&app.ID, &app.WorkspaceID, &app.Name, &app.Slug,
		&appType, &app.Description, &status, &app.ScaffoldPath,
		&app.CreatedAt, &app.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("app not found: %w", err)
	}
	app.AppType = domain.AppType(appType)
	app.Status = domain.AppStatus(status)
	return &app, nil
}

func (r *DesignerPostgresRepository) ListApps(ctx context.Context, workspaceID string) ([]*domain.DesignerApp, error) {
	query := `
		SELECT id, workspace_id, name, slug, app_type, description, status, COALESCE(scaffold_path, ''), created_at, updated_at
		FROM designer_apps
		WHERE ($1 = '' OR workspace_id = $1)
		ORDER BY updated_at DESC
	`
	rows, err := r.pool.Query(ctx, query, workspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to list apps: %w", err)
	}
	defer rows.Close()

	var apps []*domain.DesignerApp
	for rows.Next() {
		var app domain.DesignerApp
		var appType, status string
		if err := rows.Scan(
			&app.ID, &app.WorkspaceID, &app.Name, &app.Slug,
			&appType, &app.Description, &status, &app.ScaffoldPath,
			&app.CreatedAt, &app.UpdatedAt,
		); err != nil {
			return nil, err
		}
		app.AppType = domain.AppType(appType)
		app.Status = domain.AppStatus(status)
		apps = append(apps, &app)
	}
	return apps, nil
}

func (r *DesignerPostgresRepository) UpdateApp(ctx context.Context, app *domain.DesignerApp) error {
	app.UpdatedAt = time.Now()
	query := `
		UPDATE designer_apps
		SET name = $1, description = $2, status = $3, scaffold_path = $4, updated_at = $5
		WHERE id = $6
	`
	_, err := r.pool.Exec(ctx, query, app.Name, app.Description, app.Status, app.ScaffoldPath, app.UpdatedAt, app.ID)
	if err != nil {
		return fmt.Errorf("failed to update app: %w", err)
	}
	return nil
}

func (r *DesignerPostgresRepository) DeleteApp(ctx context.Context, id string) error {
	query := `DELETE FROM designer_apps WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete app: %w", err)
	}
	return nil
}

func (r *DesignerPostgresRepository) SaveLayout(ctx context.Context, layout *domain.DesignerLayout) error {
	if layout.ID == "" {
		layout.ID = "layout-" + uuid.New().String()[:8]
	}
	layout.CreatedAt = time.Now()
	layout.UpdatedAt = time.Now()

	slotsJSON, err := layout.SlotsToJSON()
	if err != nil {
		return fmt.Errorf("failed to serialize slots to JSON: %w", err)
	}

	query := `
		INSERT INTO designer_layouts (id, app_id, layout_version, theme, slots_json, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (app_id) DO UPDATE
		SET layout_version = EXCLUDED.layout_version,
		    theme = EXCLUDED.theme,
		    slots_json = EXCLUDED.slots_json,
		    updated_at = EXCLUDED.updated_at
	`
	_, err = r.pool.Exec(ctx, query, layout.ID, layout.AppID, layout.LayoutVersion, layout.Theme, slotsJSON, layout.CreatedAt, layout.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to save layout: %w", err)
	}
	return nil
}

func (r *DesignerPostgresRepository) GetLayoutByAppID(ctx context.Context, appID string) (*domain.DesignerLayout, error) {
	query := `
		SELECT id, app_id, layout_version, theme, slots_json, created_at, updated_at
		FROM designer_layouts WHERE app_id = $1
	`
	row := r.pool.QueryRow(ctx, query, appID)

	var layout domain.DesignerLayout
	var slotsJSON []byte
	err := row.Scan(&layout.ID, &layout.AppID, &layout.LayoutVersion, &layout.Theme, &slotsJSON, &layout.CreatedAt, &layout.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("layout not found: %w", err)
	}

	_ = layout.ParseSlotsFromJSON(slotsJSON)
	return &layout, nil
}

func (r *DesignerPostgresRepository) SaveDatasource(ctx context.Context, ds *domain.DesignerDatasource) error {
	if ds.ID == "" {
		ds.ID = "ds-" + uuid.New().String()[:8]
	}
	ds.CreatedAt = time.Now()
	ds.UpdatedAt = time.Now()

	query := `
		INSERT INTO designer_datasources (id, workspace_id, name, db_type, connection_uri, schema_name, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (id) DO UPDATE
		SET name = EXCLUDED.name,
		    connection_uri = EXCLUDED.connection_uri,
		    schema_name = EXCLUDED.schema_name,
		    updated_at = EXCLUDED.updated_at
	`
	_, err := r.pool.Exec(ctx, query, ds.ID, ds.WorkspaceID, ds.Name, ds.DBType, ds.ConnectionURI, ds.SchemaName, ds.CreatedAt, ds.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to save datasource: %w", err)
	}
	return nil
}

func (r *DesignerPostgresRepository) ListDatasources(ctx context.Context, workspaceID string) ([]*domain.DesignerDatasource, error) {
	query := `
		SELECT id, workspace_id, name, db_type, connection_uri, schema_name, created_at, updated_at
		FROM designer_datasources
		WHERE ($1 = '' OR workspace_id = $1)
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, workspaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to list datasources: %w", err)
	}
	defer rows.Close()

	var list []*domain.DesignerDatasource
	for rows.Next() {
		var ds domain.DesignerDatasource
		if err := rows.Scan(&ds.ID, &ds.WorkspaceID, &ds.Name, &ds.DBType, &ds.ConnectionURI, &ds.SchemaName, &ds.CreatedAt, &ds.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, &ds)
	}
	return list, nil
}

func (r *DesignerPostgresRepository) DeleteDatasource(ctx context.Context, id string) error {
	query := `DELETE FROM designer_datasources WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete datasource: %w", err)
	}
	return nil
}
