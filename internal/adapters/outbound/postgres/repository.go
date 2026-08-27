package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"arch-base-deploy/internal/core/domain"
	"arch-base-deploy/internal/core/ports"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type pgRepository struct {
	pool *pgxpool.Pool
}

func mapPgError(err error, id string) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return fmt.Errorf("%w: %s", domain.ErrNotFound, id)
	}
	return err
}

// NewPostgresRepository initializes the PostgreSQL database repository with the connection pool.
func NewPostgresRepository(pool *pgxpool.Pool) ports.Repository {
	return &pgRepository{
		pool: pool,
	}
}

func (r *pgRepository) ListWorkspaces(ctx context.Context) ([]domain.Workspace, error) {
	rows, err := r.pool.Query(ctx, `SELECT id, name, description, industry, created_at, updated_at FROM ba_workspaces ORDER BY name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Workspace
	for rows.Next() {
		var w domain.Workspace
		if err := rows.Scan(&w.ID, &w.Name, &w.Description, &w.Industry, &w.CreatedAt, &w.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, w)
	}
	return list, rows.Err()
}

func (r *pgRepository) GetWorkspace(ctx context.Context, id string) (*domain.Workspace, error) {
	var w domain.Workspace
	err := r.pool.QueryRow(ctx, `SELECT id, name, description, industry, created_at, updated_at FROM ba_workspaces WHERE id = $1`, id).
		Scan(&w.ID, &w.Name, &w.Description, &w.Industry, &w.CreatedAt, &w.UpdatedAt)
	if err != nil {
		return nil, mapPgError(err, id)
	}
	return &w, nil
}

func (r *pgRepository) SaveWorkspace(ctx context.Context, ws *domain.Workspace) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_workspaces (id, name, description, industry, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			description = EXCLUDED.description,
			industry = EXCLUDED.industry,
			updated_at = EXCLUDED.updated_at
	`, ws.ID, ws.Name, ws.Description, ws.Industry, ws.CreatedAt, ws.UpdatedAt)
	return err
}

// Capabilities
func (r *pgRepository) ListCapabilities(ctx context.Context, workspaceID string) ([]domain.Capability, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, code, name, description, parent_id, level, pace_layer, strategic_importance,
		       current_maturity, target_maturity, investment_priority, risk_score, business_owner, org_unit_id, tags,
		       created_at, updated_at
		FROM ba_capabilities
		WHERE workspace_id = $1
		ORDER BY code ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Capability
	for rows.Next() {
		var c domain.Capability
		var tags []string
		if err := rows.Scan(
			&c.ID, &c.WorkspaceID, &c.Code, &c.Name, &c.Description, &c.ParentID, &c.Level, &c.PaceLayer,
			&c.StrategicImportance, &c.CurrentMaturity, &c.TargetMaturity, &c.InvestmentPriority, &c.RiskScore,
			&c.BusinessOwner, &c.OrgUnitID, &tags, &c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		c.Tags = tags
		list = append(list, c)
	}
	return list, rows.Err()
}

func (r *pgRepository) GetCapability(ctx context.Context, workspaceID, id string) (*domain.Capability, error) {
	var c domain.Capability
	var tags []string
	err := r.pool.QueryRow(ctx, `
		SELECT id, workspace_id, code, name, description, parent_id, level, pace_layer, strategic_importance,
		       current_maturity, target_maturity, investment_priority, risk_score, business_owner, org_unit_id, tags,
		       created_at, updated_at
		FROM ba_capabilities
		WHERE workspace_id = $1 AND id = $2
	`, workspaceID, id).Scan(
		&c.ID, &c.WorkspaceID, &c.Code, &c.Name, &c.Description, &c.ParentID, &c.Level, &c.PaceLayer,
		&c.StrategicImportance, &c.CurrentMaturity, &c.TargetMaturity, &c.InvestmentPriority, &c.RiskScore,
		&c.BusinessOwner, &c.OrgUnitID, &tags, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		return nil, mapPgError(err, id)
	}
	c.Tags = tags
	return &c, nil
}

func (r *pgRepository) SaveCapability(ctx context.Context, cap *domain.Capability) error {
	if cap.CreatedAt.IsZero() {
		cap.CreatedAt = time.Now()
	}
	cap.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_capabilities (
			id, workspace_id, code, name, description, parent_id, level, pace_layer, strategic_importance,
			current_maturity, target_maturity, investment_priority, risk_score, business_owner, org_unit_id, tags,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
		ON CONFLICT (id) DO UPDATE SET
			code = EXCLUDED.code,
			name = EXCLUDED.name,
			description = EXCLUDED.description,
			parent_id = EXCLUDED.parent_id,
			level = EXCLUDED.level,
			pace_layer = EXCLUDED.pace_layer,
			strategic_importance = EXCLUDED.strategic_importance,
			current_maturity = EXCLUDED.current_maturity,
			target_maturity = EXCLUDED.target_maturity,
			investment_priority = EXCLUDED.investment_priority,
			risk_score = EXCLUDED.risk_score,
			business_owner = EXCLUDED.business_owner,
			org_unit_id = EXCLUDED.org_unit_id,
			tags = EXCLUDED.tags,
			updated_at = EXCLUDED.updated_at
	`, cap.ID, cap.WorkspaceID, cap.Code, cap.Name, cap.Description, cap.ParentID, cap.Level, cap.PaceLayer,
		cap.StrategicImportance, cap.CurrentMaturity, cap.TargetMaturity, cap.InvestmentPriority, cap.RiskScore,
		cap.BusinessOwner, cap.OrgUnitID, cap.Tags, cap.CreatedAt, cap.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteCapability(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_capabilities WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

// Value Streams
func (r *pgRepository) ListValueStreams(ctx context.Context, workspaceID string) ([]domain.ValueStream, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, code, name, description, type, trigger, value_proposition, stakeholder, owner, created_at, updated_at
		FROM ba_value_streams
		WHERE workspace_id = $1
		ORDER BY code ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.ValueStream
	for rows.Next() {
		var vs domain.ValueStream
		if err := rows.Scan(
			&vs.ID, &vs.WorkspaceID, &vs.Code, &vs.Name, &vs.Description, &vs.Type, &vs.Trigger,
			&vs.ValueProposition, &vs.Stakeholder, &vs.Owner, &vs.CreatedAt, &vs.UpdatedAt,
		); err != nil {
			return nil, err
		}

		// Load stages
		stages, err := r.listValueStages(ctx, vs.ID)
		if err == nil {
			vs.Stages = stages
		}
		list = append(list, vs)
	}
	return list, rows.Err()
}

func (r *pgRepository) listValueStages(ctx context.Context, vsID string) ([]domain.ValueStage, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, value_stream_id, order_index, name, description, entrance_criteria, exit_criteria, value_produced,
		       lead_time_hours, processing_time_hours, flow_efficiency_pct, enabling_capability_ids, participating_org_unit_ids,
		       created_at, updated_at
		FROM ba_value_stages
		WHERE value_stream_id = $1
		ORDER BY order_index ASC
	`, vsID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stages []domain.ValueStage
	for rows.Next() {
		var s domain.ValueStage
		var capIDs, orgIDs []string
		if err := rows.Scan(
			&s.ID, &s.ValueStreamID, &s.OrderIndex, &s.Name, &s.Description, &s.EntranceCriteria, &s.ExitCriteria, &s.ValueProduced,
			&s.LeadTimeHours, &s.ProcessingTimeHours, &s.FlowEfficiencyPct, &capIDs, &orgIDs, &s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, err
		}
		s.EnablingCapabilityIDs = capIDs
		s.ParticipatingOrgUnitIDs = orgIDs
		stages = append(stages, s)
	}
	return stages, rows.Err()
}

func (r *pgRepository) GetValueStream(ctx context.Context, workspaceID, id string) (*domain.ValueStream, error) {
	var vs domain.ValueStream
	err := r.pool.QueryRow(ctx, `
		SELECT id, workspace_id, code, name, description, type, trigger, value_proposition, stakeholder, owner, created_at, updated_at
		FROM ba_value_streams
		WHERE workspace_id = $1 AND id = $2
	`, workspaceID, id).Scan(
		&vs.ID, &vs.WorkspaceID, &vs.Code, &vs.Name, &vs.Description, &vs.Type, &vs.Trigger,
		&vs.ValueProposition, &vs.Stakeholder, &vs.Owner, &vs.CreatedAt, &vs.UpdatedAt,
	)
	if err != nil {
		return nil, mapPgError(err, id)
	}
	stages, _ := r.listValueStages(ctx, vs.ID)
	vs.Stages = stages
	return &vs, nil
}

func (r *pgRepository) SaveValueStream(ctx context.Context, vs *domain.ValueStream) error {
	if vs.CreatedAt.IsZero() {
		vs.CreatedAt = time.Now()
	}
	vs.UpdatedAt = time.Now()

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		INSERT INTO ba_value_streams (id, workspace_id, code, name, description, type, trigger, value_proposition, stakeholder, owner, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (id) DO UPDATE SET
			code = EXCLUDED.code,
			name = EXCLUDED.name,
			description = EXCLUDED.description,
			type = EXCLUDED.type,
			trigger = EXCLUDED.trigger,
			value_proposition = EXCLUDED.value_proposition,
			stakeholder = EXCLUDED.stakeholder,
			owner = EXCLUDED.owner,
			updated_at = EXCLUDED.updated_at
	`, vs.ID, vs.WorkspaceID, vs.Code, vs.Name, vs.Description, vs.Type, vs.Trigger, vs.ValueProposition, vs.Stakeholder, vs.Owner, vs.CreatedAt, vs.UpdatedAt)
	if err != nil {
		return err
	}

	// Delete and re-insert stages
	_, _ = tx.Exec(ctx, `DELETE FROM ba_value_stages WHERE value_stream_id = $1`, vs.ID)
	for idx, stg := range vs.Stages {
		stgID := stg.ID
		if stgID == "" {
			stgID = fmt.Sprintf("%s-stg-%d", vs.ID, idx+1)
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO ba_value_stages (
				id, value_stream_id, order_index, name, description, entrance_criteria, exit_criteria, value_produced,
				lead_time_hours, processing_time_hours, flow_efficiency_pct, enabling_capability_ids, participating_org_unit_ids,
				created_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		`, stgID, vs.ID, idx+1, stg.Name, stg.Description, stg.EntranceCriteria, stg.ExitCriteria, stg.ValueProduced,
			stg.LeadTimeHours, stg.ProcessingTimeHours, stg.FlowEfficiencyPct, stg.EnablingCapabilityIDs, stg.ParticipatingOrgUnitIDs,
			time.Now(), time.Now())
		if err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}

func (r *pgRepository) DeleteValueStream(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_value_streams WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

// Business Processes
func (r *pgRepository) ListProcesses(ctx context.Context, workspaceID string) ([]domain.BusinessProcess, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, code, name, description, category, classification, parent_process_id,
		       associated_capability_id, associated_value_stage_id, owner_role, sipoc_json, steps_json,
		       avg_cycle_time_minutes, overall_automation_pct, pain_points, tags, created_at, updated_at
		FROM ba_processes
		WHERE workspace_id = $1
		ORDER BY code ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.BusinessProcess
	for rows.Next() {
		var p domain.BusinessProcess
		var sipocBytes, stepsBytes []byte
		var painPoints, tags []string
		if err := rows.Scan(
			&p.ID, &p.WorkspaceID, &p.Code, &p.Name, &p.Description, &p.Category, &p.Classification,
			&p.ParentProcessID, &p.AssociatedCapabilityID, &p.AssociatedValueStageID, &p.OwnerRole,
			&sipocBytes, &stepsBytes, &p.AvgCycleTimeMinutes, &p.OverallAutomationPct, &painPoints, &tags,
			&p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if len(sipocBytes) > 0 {
			_ = json.Unmarshal(sipocBytes, &p.SIPOC)
		}
		if len(stepsBytes) > 0 {
			_ = json.Unmarshal(stepsBytes, &p.Steps)
		}
		p.PainPoints = painPoints
		p.Tags = tags
		list = append(list, p)
	}
	return list, rows.Err()
}

func (r *pgRepository) GetProcess(ctx context.Context, workspaceID, id string) (*domain.BusinessProcess, error) {
	var p domain.BusinessProcess
	var sipocBytes, stepsBytes []byte
	var painPoints, tags []string
	err := r.pool.QueryRow(ctx, `
		SELECT id, workspace_id, code, name, description, category, classification, parent_process_id,
		       associated_capability_id, associated_value_stage_id, owner_role, sipoc_json, steps_json,
		       avg_cycle_time_minutes, overall_automation_pct, pain_points, tags, created_at, updated_at
		FROM ba_processes
		WHERE workspace_id = $1 AND id = $2
	`, workspaceID, id).Scan(
		&p.ID, &p.WorkspaceID, &p.Code, &p.Name, &p.Description, &p.Category, &p.Classification,
		&p.ParentProcessID, &p.AssociatedCapabilityID, &p.AssociatedValueStageID, &p.OwnerRole,
		&sipocBytes, &stepsBytes, &p.AvgCycleTimeMinutes, &p.OverallAutomationPct, &painPoints, &tags,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, mapPgError(err, id)
	}
	if len(sipocBytes) > 0 {
		_ = json.Unmarshal(sipocBytes, &p.SIPOC)
	}
	if len(stepsBytes) > 0 {
		_ = json.Unmarshal(stepsBytes, &p.Steps)
	}
	p.PainPoints = painPoints
	p.Tags = tags
	return &p, nil
}

func (r *pgRepository) SaveProcess(ctx context.Context, proc *domain.BusinessProcess) error {
	if proc.CreatedAt.IsZero() {
		proc.CreatedAt = time.Now()
	}
	proc.UpdatedAt = time.Now()
	sipocJSON, _ := json.Marshal(proc.SIPOC)
	stepsJSON, _ := json.Marshal(proc.Steps)

	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_processes (
			id, workspace_id, code, name, description, category, classification, parent_process_id,
			associated_capability_id, associated_value_stage_id, owner_role, sipoc_json, steps_json,
			avg_cycle_time_minutes, overall_automation_pct, pain_points, tags, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
		ON CONFLICT (id) DO UPDATE SET
			code = EXCLUDED.code,
			name = EXCLUDED.name,
			description = EXCLUDED.description,
			category = EXCLUDED.category,
			classification = EXCLUDED.classification,
			parent_process_id = EXCLUDED.parent_process_id,
			associated_capability_id = EXCLUDED.associated_capability_id,
			associated_value_stage_id = EXCLUDED.associated_value_stage_id,
			owner_role = EXCLUDED.owner_role,
			sipoc_json = EXCLUDED.sipoc_json,
			steps_json = EXCLUDED.steps_json,
			avg_cycle_time_minutes = EXCLUDED.avg_cycle_time_minutes,
			overall_automation_pct = EXCLUDED.overall_automation_pct,
			pain_points = EXCLUDED.pain_points,
			tags = EXCLUDED.tags,
			updated_at = EXCLUDED.updated_at
	`, proc.ID, proc.WorkspaceID, proc.Code, proc.Name, proc.Description, proc.Category, proc.Classification,
		proc.ParentProcessID, proc.AssociatedCapabilityID, proc.AssociatedValueStageID, proc.OwnerRole,
		sipocJSON, stepsJSON, proc.AvgCycleTimeMinutes, proc.OverallAutomationPct, proc.PainPoints, proc.Tags,
		proc.CreatedAt, proc.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteProcess(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_processes WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

// Organization & Functions
func (r *pgRepository) ListOrgUnits(ctx context.Context, workspaceID string) ([]domain.OrgUnit, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, code, name, type, parent_id, head_role, cost_center_code, headcount_fte, location, description, created_at, updated_at
		FROM ba_org_units
		WHERE workspace_id = $1
		ORDER BY code ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.OrgUnit
	for rows.Next() {
		var o domain.OrgUnit
		if err := rows.Scan(
			&o.ID, &o.WorkspaceID, &o.Code, &o.Name, &o.Type, &o.ParentID, &o.HeadRole, &o.CostCenterCode,
			&o.HeadcountFTE, &o.Location, &o.Description, &o.CreatedAt, &o.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, o)
	}
	return list, rows.Err()
}

func (r *pgRepository) GetOrgUnit(ctx context.Context, workspaceID, id string) (*domain.OrgUnit, error) {
	var o domain.OrgUnit
	err := r.pool.QueryRow(ctx, `
		SELECT id, workspace_id, code, name, type, parent_id, head_role, cost_center_code, headcount_fte, location, description, created_at, updated_at
		FROM ba_org_units
		WHERE workspace_id = $1 AND id = $2
	`, workspaceID, id).Scan(
		&o.ID, &o.WorkspaceID, &o.Code, &o.Name, &o.Type, &o.ParentID, &o.HeadRole, &o.CostCenterCode,
		&o.HeadcountFTE, &o.Location, &o.Description, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		return nil, mapPgError(err, id)
	}
	return &o, nil
}

func (r *pgRepository) SaveOrgUnit(ctx context.Context, org *domain.OrgUnit) error {
	if org.CreatedAt.IsZero() {
		org.CreatedAt = time.Now()
	}
	org.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_org_units (id, workspace_id, code, name, type, parent_id, head_role, cost_center_code, headcount_fte, location, description, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		ON CONFLICT (id) DO UPDATE SET
			code = EXCLUDED.code,
			name = EXCLUDED.name,
			type = EXCLUDED.type,
			parent_id = EXCLUDED.parent_id,
			head_role = EXCLUDED.head_role,
			cost_center_code = EXCLUDED.cost_center_code,
			headcount_fte = EXCLUDED.headcount_fte,
			location = EXCLUDED.location,
			description = EXCLUDED.description,
			updated_at = EXCLUDED.updated_at
	`, org.ID, org.WorkspaceID, org.Code, org.Name, org.Type, org.ParentID, org.HeadRole, org.CostCenterCode, org.HeadcountFTE, org.Location, org.Description, org.CreatedAt, org.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteOrgUnit(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_org_units WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

func (r *pgRepository) ListBusinessFunctions(ctx context.Context, workspaceID string) ([]domain.BusinessFunction, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, code, name, description, parent_id, owner, org_unit_ids, created_at, updated_at
		FROM ba_business_functions
		WHERE workspace_id = $1
		ORDER BY code ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.BusinessFunction
	for rows.Next() {
		var bf domain.BusinessFunction
		var orgIDs []string
		if err := rows.Scan(
			&bf.ID, &bf.WorkspaceID, &bf.Code, &bf.Name, &bf.Description, &bf.ParentID, &bf.Owner, &orgIDs, &bf.CreatedAt, &bf.UpdatedAt,
		); err != nil {
			return nil, err
		}
		bf.OrgUnitIDs = orgIDs
		list = append(list, bf)
	}
	return list, rows.Err()
}

func (r *pgRepository) GetBusinessFunction(ctx context.Context, workspaceID, id string) (*domain.BusinessFunction, error) {
	var bf domain.BusinessFunction
	var orgIDs []string
	err := r.pool.QueryRow(ctx, `
		SELECT id, workspace_id, code, name, description, parent_id, owner, org_unit_ids, created_at, updated_at
		FROM ba_business_functions
		WHERE workspace_id = $1 AND id = $2
	`, workspaceID, id).Scan(
		&bf.ID, &bf.WorkspaceID, &bf.Code, &bf.Name, &bf.Description, &bf.ParentID, &bf.Owner, &orgIDs, &bf.CreatedAt, &bf.UpdatedAt,
	)
	if err != nil {
		return nil, mapPgError(err, id)
	}
	bf.OrgUnitIDs = orgIDs
	return &bf, nil
}

func (r *pgRepository) SaveBusinessFunction(ctx context.Context, bf *domain.BusinessFunction) error {
	if bf.CreatedAt.IsZero() {
		bf.CreatedAt = time.Now()
	}
	bf.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_business_functions (id, workspace_id, code, name, description, parent_id, owner, org_unit_ids, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (id) DO UPDATE SET
			code = EXCLUDED.code,
			name = EXCLUDED.name,
			description = EXCLUDED.description,
			parent_id = EXCLUDED.parent_id,
			owner = EXCLUDED.owner,
			org_unit_ids = EXCLUDED.org_unit_ids,
			updated_at = EXCLUDED.updated_at
	`, bf.ID, bf.WorkspaceID, bf.Code, bf.Name, bf.Description, bf.ParentID, bf.Owner, bf.OrgUnitIDs, bf.CreatedAt, bf.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteBusinessFunction(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_business_functions WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

func (r *pgRepository) ListBusinessRoles(ctx context.Context, workspaceID string) ([]domain.BusinessRole, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, code, title, description, org_unit_id, workday_job_profile_id, standard_rate_usd, allocated_fte, created_at, updated_at
		FROM ba_business_roles
		WHERE workspace_id = $1
		ORDER BY title ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.BusinessRole
	for rows.Next() {
		var br domain.BusinessRole
		if err := rows.Scan(
			&br.ID, &br.WorkspaceID, &br.Code, &br.Title, &br.Description, &br.OrgUnitID, &br.WorkdayJobProfileID,
			&br.StandardRateUSD, &br.AllocatedFTE, &br.CreatedAt, &br.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, br)
	}
	return list, rows.Err()
}

func (r *pgRepository) GetBusinessRole(ctx context.Context, workspaceID, id string) (*domain.BusinessRole, error) {
	var br domain.BusinessRole
	err := r.pool.QueryRow(ctx, `
		SELECT id, workspace_id, code, title, description, org_unit_id, workday_job_profile_id, standard_rate_usd, allocated_fte, created_at, updated_at
		FROM ba_business_roles
		WHERE workspace_id = $1 AND id = $2
	`, workspaceID, id).Scan(
		&br.ID, &br.WorkspaceID, &br.Code, &br.Title, &br.Description, &br.OrgUnitID, &br.WorkdayJobProfileID,
		&br.StandardRateUSD, &br.AllocatedFTE, &br.CreatedAt, &br.UpdatedAt,
	)
	if err != nil {
		return nil, mapPgError(err, id)
	}
	return &br, nil
}

func (r *pgRepository) SaveBusinessRole(ctx context.Context, role *domain.BusinessRole) error {
	if role.CreatedAt.IsZero() {
		role.CreatedAt = time.Now()
	}
	role.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_business_roles (id, workspace_id, code, title, description, org_unit_id, workday_job_profile_id, standard_rate_usd, allocated_fte, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		ON CONFLICT (id) DO UPDATE SET
			code = EXCLUDED.code,
			title = EXCLUDED.title,
			description = EXCLUDED.description,
			org_unit_id = EXCLUDED.org_unit_id,
			workday_job_profile_id = EXCLUDED.workday_job_profile_id,
			standard_rate_usd = EXCLUDED.standard_rate_usd,
			allocated_fte = EXCLUDED.allocated_fte,
			updated_at = EXCLUDED.updated_at
	`, role.ID, role.WorkspaceID, role.Code, role.Title, role.Description, role.OrgUnitID, role.WorkdayJobProfileID, role.StandardRateUSD, role.AllocatedFTE, role.CreatedAt, role.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteBusinessRole(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_business_roles WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

// Business Services & Products
func (r *pgRepository) ListBusinessServices(ctx context.Context, workspaceID string) ([]domain.BusinessService, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, code, name, description, nature, status, owner_org_unit_id, owner_role,
		       sla_availability_pct, sla_response_time_hours, supported_channels, target_customer_segments,
		       realizing_capability_ids, created_at, updated_at
		FROM ba_business_services
		WHERE workspace_id = $1
		ORDER BY code ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.BusinessService
	for rows.Next() {
		var bs domain.BusinessService
		var channels []string
		var segments, capIDs []string
		if err := rows.Scan(
			&bs.ID, &bs.WorkspaceID, &bs.Code, &bs.Name, &bs.Description, &bs.Nature, &bs.Status,
			&bs.OwnerOrgUnitID, &bs.OwnerRole, &bs.SLAAvailabilityPct, &bs.SLAResponseTimeHours,
			&channels, &segments, &capIDs, &bs.CreatedAt, &bs.UpdatedAt,
		); err != nil {
			return nil, err
		}
		for _, ch := range channels {
			bs.SupportedChannels = append(bs.SupportedChannels, domain.DeliveryChannel(ch))
		}
		bs.TargetCustomerSegments = segments
		bs.RealizingCapabilityIDs = capIDs
		list = append(list, bs)
	}
	return list, rows.Err()
}

func (r *pgRepository) GetBusinessService(ctx context.Context, workspaceID, id string) (*domain.BusinessService, error) {
	var bs domain.BusinessService
	var channels []string
	var segments, capIDs []string
	err := r.pool.QueryRow(ctx, `
		SELECT id, workspace_id, code, name, description, nature, status, owner_org_unit_id, owner_role,
		       sla_availability_pct, sla_response_time_hours, supported_channels, target_customer_segments,
		       realizing_capability_ids, created_at, updated_at
		FROM ba_business_services
		WHERE workspace_id = $1 AND id = $2
	`, workspaceID, id).Scan(
		&bs.ID, &bs.WorkspaceID, &bs.Code, &bs.Name, &bs.Description, &bs.Nature, &bs.Status,
		&bs.OwnerOrgUnitID, &bs.OwnerRole, &bs.SLAAvailabilityPct, &bs.SLAResponseTimeHours,
		&channels, &segments, &capIDs, &bs.CreatedAt, &bs.UpdatedAt,
	)
	if err != nil {
		return nil, mapPgError(err, id)
	}
	for _, ch := range channels {
		bs.SupportedChannels = append(bs.SupportedChannels, domain.DeliveryChannel(ch))
	}
	bs.TargetCustomerSegments = segments
	bs.RealizingCapabilityIDs = capIDs
	return &bs, nil
}

func (r *pgRepository) SaveBusinessService(ctx context.Context, svc *domain.BusinessService) error {
	if svc.CreatedAt.IsZero() {
		svc.CreatedAt = time.Now()
	}
	svc.UpdatedAt = time.Now()
	var channels []string
	for _, ch := range svc.SupportedChannels {
		channels = append(channels, string(ch))
	}

	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_business_services (
			id, workspace_id, code, name, description, nature, status, owner_org_unit_id, owner_role,
			sla_availability_pct, sla_response_time_hours, supported_channels, target_customer_segments,
			realizing_capability_ids, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
		ON CONFLICT (id) DO UPDATE SET
			code = EXCLUDED.code,
			name = EXCLUDED.name,
			description = EXCLUDED.description,
			nature = EXCLUDED.nature,
			status = EXCLUDED.status,
			owner_org_unit_id = EXCLUDED.owner_org_unit_id,
			owner_role = EXCLUDED.owner_role,
			sla_availability_pct = EXCLUDED.sla_availability_pct,
			sla_response_time_hours = EXCLUDED.sla_response_time_hours,
			supported_channels = EXCLUDED.supported_channels,
			target_customer_segments = EXCLUDED.target_customer_segments,
			realizing_capability_ids = EXCLUDED.realizing_capability_ids,
			updated_at = EXCLUDED.updated_at
	`, svc.ID, svc.WorkspaceID, svc.Code, svc.Name, svc.Description, svc.Nature, svc.Status,
		svc.OwnerOrgUnitID, svc.OwnerRole, svc.SLAAvailabilityPct, svc.SLAResponseTimeHours,
		channels, svc.TargetCustomerSegments, svc.RealizingCapabilityIDs, svc.CreatedAt, svc.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteBusinessService(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_business_services WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

func (r *pgRepository) ListProducts(ctx context.Context, workspaceID string) ([]domain.Product, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, code, name, description, market_segment, pricing_model, lifecycle_stage, product_manager, business_service_ids, created_at, updated_at
		FROM ba_products
		WHERE workspace_id = $1
		ORDER BY name ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Product
	for rows.Next() {
		var p domain.Product
		var bsIDs []string
		if err := rows.Scan(
			&p.ID, &p.WorkspaceID, &p.Code, &p.Name, &p.Description, &p.MarketSegment, &p.PricingModel,
			&p.LifecycleStage, &p.ProductManager, &bsIDs, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		p.BusinessServiceIDs = bsIDs
		list = append(list, p)
	}
	return list, rows.Err()
}

func (r *pgRepository) GetProduct(ctx context.Context, workspaceID, id string) (*domain.Product, error) {
	var p domain.Product
	var bsIDs []string
	err := r.pool.QueryRow(ctx, `
		SELECT id, workspace_id, code, name, description, market_segment, pricing_model, lifecycle_stage, product_manager, business_service_ids, created_at, updated_at
		FROM ba_products
		WHERE workspace_id = $1 AND id = $2
	`, workspaceID, id).Scan(
		&p.ID, &p.WorkspaceID, &p.Code, &p.Name, &p.Description, &p.MarketSegment, &p.PricingModel,
		&p.LifecycleStage, &p.ProductManager, &bsIDs, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, mapPgError(err, id)
	}
	p.BusinessServiceIDs = bsIDs
	return &p, nil
}

func (r *pgRepository) SaveProduct(ctx context.Context, prod *domain.Product) error {
	if prod.CreatedAt.IsZero() {
		prod.CreatedAt = time.Now()
	}
	prod.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_products (id, workspace_id, code, name, description, market_segment, pricing_model, lifecycle_stage, product_manager, business_service_ids, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (id) DO UPDATE SET
			code = EXCLUDED.code,
			name = EXCLUDED.name,
			description = EXCLUDED.description,
			market_segment = EXCLUDED.market_segment,
			pricing_model = EXCLUDED.pricing_model,
			lifecycle_stage = EXCLUDED.lifecycle_stage,
			product_manager = EXCLUDED.product_manager,
			business_service_ids = EXCLUDED.business_service_ids,
			updated_at = EXCLUDED.updated_at
	`, prod.ID, prod.WorkspaceID, prod.Code, prod.Name, prod.Description, prod.MarketSegment, prod.PricingModel, prod.LifecycleStage, prod.ProductManager, prod.BusinessServiceIDs, prod.CreatedAt, prod.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteProduct(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_products WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

// Strategy & OKRs
func (r *pgRepository) ListStrategicDrivers(ctx context.Context, workspaceID string) ([]domain.StrategicDriver, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, code, name, category, impact_level, description, created_at, updated_at
		FROM ba_strategic_drivers
		WHERE workspace_id = $1
		ORDER BY code ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.StrategicDriver
	for rows.Next() {
		var d domain.StrategicDriver
		if err := rows.Scan(&d.ID, &d.WorkspaceID, &d.Code, &d.Name, &d.Category, &d.ImpactLevel, &d.Description, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, d)
	}
	return list, rows.Err()
}

func (r *pgRepository) SaveStrategicDriver(ctx context.Context, drv *domain.StrategicDriver) error {
	if drv.CreatedAt.IsZero() {
		drv.CreatedAt = time.Now()
	}
	drv.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_strategic_drivers (id, workspace_id, code, name, category, impact_level, description, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (id) DO UPDATE SET
			code = EXCLUDED.code,
			name = EXCLUDED.name,
			category = EXCLUDED.category,
			impact_level = EXCLUDED.impact_level,
			description = EXCLUDED.description,
			updated_at = EXCLUDED.updated_at
	`, drv.ID, drv.WorkspaceID, drv.Code, drv.Name, drv.Category, drv.ImpactLevel, drv.Description, drv.CreatedAt, drv.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteStrategicDriver(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_strategic_drivers WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

func (r *pgRepository) ListStrategicGoals(ctx context.Context, workspaceID string) ([]domain.StrategicGoal, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, code, title, description, driver_ids, horizon_year, owner_role, target_metric, progress_pct, created_at, updated_at
		FROM ba_strategic_goals
		WHERE workspace_id = $1
		ORDER BY code ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.StrategicGoal
	for rows.Next() {
		var g domain.StrategicGoal
		var dIDs []string
		if err := rows.Scan(
			&g.ID, &g.WorkspaceID, &g.Code, &g.Title, &g.Description, &dIDs, &g.HorizonYear,
			&g.OwnerRole, &g.TargetMetric, &g.ProgressPct, &g.CreatedAt, &g.UpdatedAt,
		); err != nil {
			return nil, err
		}
		g.DriverIDs = dIDs
		list = append(list, g)
	}
	return list, rows.Err()
}

func (r *pgRepository) SaveStrategicGoal(ctx context.Context, goal *domain.StrategicGoal) error {
	if goal.CreatedAt.IsZero() {
		goal.CreatedAt = time.Now()
	}
	goal.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_strategic_goals (id, workspace_id, code, title, description, driver_ids, horizon_year, owner_role, target_metric, progress_pct, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (id) DO UPDATE SET
			code = EXCLUDED.code,
			title = EXCLUDED.title,
			description = EXCLUDED.description,
			driver_ids = EXCLUDED.driver_ids,
			horizon_year = EXCLUDED.horizon_year,
			owner_role = EXCLUDED.owner_role,
			target_metric = EXCLUDED.target_metric,
			progress_pct = EXCLUDED.progress_pct,
			updated_at = EXCLUDED.updated_at
	`, goal.ID, goal.WorkspaceID, goal.Code, goal.Title, goal.Description, goal.DriverIDs, goal.HorizonYear, goal.OwnerRole, goal.TargetMetric, goal.ProgressPct, goal.CreatedAt, goal.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteStrategicGoal(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_strategic_goals WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

func (r *pgRepository) ListStrategicObjectives(ctx context.Context, workspaceID string) ([]domain.StrategicObjective, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, goal_id, code, title, description, quarter, key_results_json, impacted_capability_ids, overall_progress_pct, created_at, updated_at
		FROM ba_strategic_objectives
		WHERE workspace_id = $1
		ORDER BY code ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.StrategicObjective
	for rows.Next() {
		var o domain.StrategicObjective
		var krBytes []byte
		var capIDs []string
		if err := rows.Scan(
			&o.ID, &o.WorkspaceID, &o.GoalID, &o.Code, &o.Title, &o.Description, &o.Quarter,
			&krBytes, &capIDs, &o.OverallProgressPct, &o.CreatedAt, &o.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if len(krBytes) > 0 {
			_ = json.Unmarshal(krBytes, &o.KeyResults)
		}
		o.ImpactedCapabilityIDs = capIDs
		list = append(list, o)
	}
	return list, rows.Err()
}

func (r *pgRepository) SaveStrategicObjective(ctx context.Context, obj *domain.StrategicObjective) error {
	if obj.CreatedAt.IsZero() {
		obj.CreatedAt = time.Now()
	}
	obj.UpdatedAt = time.Now()
	krJSON, _ := json.Marshal(obj.KeyResults)

	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_strategic_objectives (id, workspace_id, goal_id, code, title, description, quarter, key_results_json, impacted_capability_ids, overall_progress_pct, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (id) DO UPDATE SET
			goal_id = EXCLUDED.goal_id,
			code = EXCLUDED.code,
			title = EXCLUDED.title,
			description = EXCLUDED.description,
			quarter = EXCLUDED.quarter,
			key_results_json = EXCLUDED.key_results_json,
			impacted_capability_ids = EXCLUDED.impacted_capability_ids,
			overall_progress_pct = EXCLUDED.overall_progress_pct,
			updated_at = EXCLUDED.updated_at
	`, obj.ID, obj.WorkspaceID, obj.GoalID, obj.Code, obj.Title, obj.Description, obj.Quarter, krJSON, obj.ImpactedCapabilityIDs, obj.OverallProgressPct, obj.CreatedAt, obj.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteStrategicObjective(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_strategic_objectives WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

func (r *pgRepository) GetBusinessModelCanvas(ctx context.Context, workspaceID string) (*domain.BusinessModelCanvas, error) {
	var bmc domain.BusinessModelCanvas
	var kp, ka, kr, vp, cr, ch, cs, cst, rs []string
	err := r.pool.QueryRow(ctx, `
		SELECT id, workspace_id, name, version, key_partners, key_activities, key_resources, value_propositions, customer_relationships, channels, customer_segments, cost_structure, revenue_streams, created_at, updated_at
		FROM ba_business_model_canvases
		WHERE workspace_id = $1
		LIMIT 1
	`, workspaceID).Scan(
		&bmc.ID, &bmc.WorkspaceID, &bmc.Name, &bmc.Version, &kp, &ka, &kr, &vp, &cr, &ch, &cs, &cst, &rs, &bmc.CreatedAt, &bmc.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("business model canvas not found")
		}
		return nil, err
	}
	bmc.KeyPartners = kp
	bmc.KeyActivities = ka
	bmc.KeyResources = kr
	bmc.ValuePropositions = vp
	bmc.CustomerRelationships = cr
	bmc.Channels = ch
	bmc.CustomerSegments = cs
	bmc.CostStructure = cst
	bmc.RevenueStreams = rs
	return &bmc, nil
}

func (r *pgRepository) SaveBusinessModelCanvas(ctx context.Context, bmc *domain.BusinessModelCanvas) error {
	if bmc.CreatedAt.IsZero() {
		bmc.CreatedAt = time.Now()
	}
	bmc.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_business_model_canvases (id, workspace_id, name, version, key_partners, key_activities, key_resources, value_propositions, customer_relationships, channels, customer_segments, cost_structure, revenue_streams, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			version = EXCLUDED.version,
			key_partners = EXCLUDED.key_partners,
			key_activities = EXCLUDED.key_activities,
			key_resources = EXCLUDED.key_resources,
			value_propositions = EXCLUDED.value_propositions,
			customer_relationships = EXCLUDED.customer_relationships,
			channels = EXCLUDED.channels,
			customer_segments = EXCLUDED.customer_segments,
			cost_structure = EXCLUDED.cost_structure,
			revenue_streams = EXCLUDED.revenue_streams,
			updated_at = EXCLUDED.updated_at
	`, bmc.ID, bmc.WorkspaceID, bmc.Name, bmc.Version, bmc.KeyPartners, bmc.KeyActivities, bmc.KeyResources, bmc.ValuePropositions, bmc.CustomerRelationships, bmc.Channels, bmc.CustomerSegments, bmc.CostStructure, bmc.RevenueStreams, bmc.CreatedAt, bmc.UpdatedAt)
	return err
}

// Information Concepts & Glossary
func (r *pgRepository) ListInformationConcepts(ctx context.Context, workspaceID string) ([]domain.BusinessInformationConcept, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, code, name, description, classification, domain_owner_role, authoritative_source,
		       related_capability_ids, attributes_json, parent_concept_id, tags, created_at, updated_at
		FROM ba_information_concepts
		WHERE workspace_id = $1
		ORDER BY code ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.BusinessInformationConcept
	for rows.Next() {
		var ic domain.BusinessInformationConcept
		var attrBytes []byte
		var capIDs, tags []string
		if err := rows.Scan(
			&ic.ID, &ic.WorkspaceID, &ic.Code, &ic.Name, &ic.Description, &ic.Classification,
			&ic.DomainOwnerRole, &ic.AuthoritativeSource, &capIDs, &attrBytes, &ic.ParentConceptID,
			&tags, &ic.CreatedAt, &ic.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if len(attrBytes) > 0 {
			_ = json.Unmarshal(attrBytes, &ic.Attributes)
		}
		ic.RelatedCapabilityIDs = capIDs
		ic.Tags = tags
		list = append(list, ic)
	}
	return list, rows.Err()
}

func (r *pgRepository) GetInformationConcept(ctx context.Context, workspaceID, id string) (*domain.BusinessInformationConcept, error) {
	var ic domain.BusinessInformationConcept
	var attrBytes []byte
	var capIDs, tags []string
	err := r.pool.QueryRow(ctx, `
		SELECT id, workspace_id, code, name, description, classification, domain_owner_role, authoritative_source,
		       related_capability_ids, attributes_json, parent_concept_id, tags, created_at, updated_at
		FROM ba_information_concepts
		WHERE workspace_id = $1 AND id = $2
	`, workspaceID, id).Scan(
		&ic.ID, &ic.WorkspaceID, &ic.Code, &ic.Name, &ic.Description, &ic.Classification,
		&ic.DomainOwnerRole, &ic.AuthoritativeSource, &capIDs, &attrBytes, &ic.ParentConceptID,
		&tags, &ic.CreatedAt, &ic.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if len(attrBytes) > 0 {
		_ = json.Unmarshal(attrBytes, &ic.Attributes)
	}
	ic.RelatedCapabilityIDs = capIDs
	ic.Tags = tags
	return &ic, nil
}

func (r *pgRepository) SaveInformationConcept(ctx context.Context, bic *domain.BusinessInformationConcept) error {
	if bic.CreatedAt.IsZero() {
		bic.CreatedAt = time.Now()
	}
	bic.UpdatedAt = time.Now()
	attrJSON, _ := json.Marshal(bic.Attributes)

	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_information_concepts (
			id, workspace_id, code, name, description, classification, domain_owner_role, authoritative_source,
			related_capability_ids, attributes_json, parent_concept_id, tags, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		ON CONFLICT (id) DO UPDATE SET
			code = EXCLUDED.code,
			name = EXCLUDED.name,
			description = EXCLUDED.description,
			classification = EXCLUDED.classification,
			domain_owner_role = EXCLUDED.domain_owner_role,
			authoritative_source = EXCLUDED.authoritative_source,
			related_capability_ids = EXCLUDED.related_capability_ids,
			attributes_json = EXCLUDED.attributes_json,
			parent_concept_id = EXCLUDED.parent_concept_id,
			tags = EXCLUDED.tags,
			updated_at = EXCLUDED.updated_at
	`, bic.ID, bic.WorkspaceID, bic.Code, bic.Name, bic.Description, bic.Classification,
		bic.DomainOwnerRole, bic.AuthoritativeSource, bic.RelatedCapabilityIDs, attrJSON,
		bic.ParentConceptID, bic.Tags, bic.CreatedAt, bic.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteInformationConcept(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_information_concepts WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

func (r *pgRepository) ListBusinessTerms(ctx context.Context, workspaceID string) ([]domain.BusinessTerm, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, term, definition, acronym, domain_category, steward, synonyms, concept_id, created_at, updated_at
		FROM ba_business_terms
		WHERE workspace_id = $1
		ORDER BY term ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.BusinessTerm
	for rows.Next() {
		var t domain.BusinessTerm
		var syns []string
		if err := rows.Scan(
			&t.ID, &t.WorkspaceID, &t.Term, &t.Definition, &t.Acronym, &t.DomainCategory,
			&t.Steward, &syns, &t.ConceptID, &t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, err
		}
		t.Synonyms = syns
		list = append(list, t)
	}
	return list, rows.Err()
}

func (r *pgRepository) SaveBusinessTerm(ctx context.Context, term *domain.BusinessTerm) error {
	if term.CreatedAt.IsZero() {
		term.CreatedAt = time.Now()
	}
	term.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_business_terms (id, workspace_id, term, definition, acronym, domain_category, steward, synonyms, concept_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		ON CONFLICT (id) DO UPDATE SET
			term = EXCLUDED.term,
			definition = EXCLUDED.definition,
			acronym = EXCLUDED.acronym,
			domain_category = EXCLUDED.domain_category,
			steward = EXCLUDED.steward,
			synonyms = EXCLUDED.synonyms,
			concept_id = EXCLUDED.concept_id,
			updated_at = EXCLUDED.updated_at
	`, term.ID, term.WorkspaceID, term.Term, term.Definition, term.Acronym, term.DomainCategory, term.Steward, term.Synonyms, term.ConceptID, term.CreatedAt, term.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteBusinessTerm(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_business_terms WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

// Initiatives
func (r *pgRepository) ListInitiatives(ctx context.Context, workspaceID string) ([]domain.Initiative, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, code, name, description, horizon, status, budget_usd, expected_roi,
		       start_date, target_completion_date, sponsor_role, lead_architect, milestones_json,
		       impacted_capability_ids, target_objective_ids, target_value_stream_ids, created_at, updated_at
		FROM ba_initiatives
		WHERE workspace_id = $1
		ORDER BY code ASC
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Initiative
	for rows.Next() {
		var i domain.Initiative
		var msBytes []byte
		var capIDs, objIDs, vsIDs []string
		if err := rows.Scan(
			&i.ID, &i.WorkspaceID, &i.Code, &i.Name, &i.Description, &i.Horizon, &i.Status, &i.BudgetUSD,
			&i.ExpectedROI, &i.StartDate, &i.TargetCompletionDate, &i.SponsorRole, &i.LeadArchitect,
			&msBytes, &capIDs, &objIDs, &vsIDs, &i.CreatedAt, &i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if len(msBytes) > 0 {
			_ = json.Unmarshal(msBytes, &i.Milestones)
		}
		i.ImpactedCapabilityIDs = capIDs
		i.TargetObjectiveIDs = objIDs
		i.TargetValueStreamIDs = vsIDs
		list = append(list, i)
	}
	return list, rows.Err()
}

func (r *pgRepository) GetInitiative(ctx context.Context, workspaceID, id string) (*domain.Initiative, error) {
	var i domain.Initiative
	var msBytes []byte
	var capIDs, objIDs, vsIDs []string
	err := r.pool.QueryRow(ctx, `
		SELECT id, workspace_id, code, name, description, horizon, status, budget_usd, expected_roi,
		       start_date, target_completion_date, sponsor_role, lead_architect, milestones_json,
		       impacted_capability_ids, target_objective_ids, target_value_stream_ids, created_at, updated_at
		FROM ba_initiatives
		WHERE workspace_id = $1 AND id = $2
	`, workspaceID, id).Scan(
		&i.ID, &i.WorkspaceID, &i.Code, &i.Name, &i.Description, &i.Horizon, &i.Status, &i.BudgetUSD,
		&i.ExpectedROI, &i.StartDate, &i.TargetCompletionDate, &i.SponsorRole, &i.LeadArchitect,
		&msBytes, &capIDs, &objIDs, &vsIDs, &i.CreatedAt, &i.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if len(msBytes) > 0 {
		_ = json.Unmarshal(msBytes, &i.Milestones)
	}
	i.ImpactedCapabilityIDs = capIDs
	i.TargetObjectiveIDs = objIDs
	i.TargetValueStreamIDs = vsIDs
	return &i, nil
}

func (r *pgRepository) SaveInitiative(ctx context.Context, init *domain.Initiative) error {
	if init.CreatedAt.IsZero() {
		init.CreatedAt = time.Now()
	}
	init.UpdatedAt = time.Now()
	msJSON, _ := json.Marshal(init.Milestones)

	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_initiatives (
			id, workspace_id, code, name, description, horizon, status, budget_usd, expected_roi,
			start_date, target_completion_date, sponsor_role, lead_architect, milestones_json,
			impacted_capability_ids, target_objective_ids, target_value_stream_ids, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
		ON CONFLICT (id) DO UPDATE SET
			code = EXCLUDED.code,
			name = EXCLUDED.name,
			description = EXCLUDED.description,
			horizon = EXCLUDED.horizon,
			status = EXCLUDED.status,
			budget_usd = EXCLUDED.budget_usd,
			expected_roi = EXCLUDED.expected_roi,
			start_date = EXCLUDED.start_date,
			target_completion_date = EXCLUDED.target_completion_date,
			sponsor_role = EXCLUDED.sponsor_role,
			lead_architect = EXCLUDED.lead_architect,
			milestones_json = EXCLUDED.milestones_json,
			impacted_capability_ids = EXCLUDED.impacted_capability_ids,
			target_objective_ids = EXCLUDED.target_objective_ids,
			target_value_stream_ids = EXCLUDED.target_value_stream_ids,
			updated_at = EXCLUDED.updated_at
	`, init.ID, init.WorkspaceID, init.Code, init.Name, init.Description, init.Horizon, init.Status,
		init.BudgetUSD, init.ExpectedROI, init.StartDate, init.TargetCompletionDate, init.SponsorRole,
		init.LeadArchitect, msJSON, init.ImpactedCapabilityIDs, init.TargetObjectiveIDs, init.TargetValueStreamIDs,
		init.CreatedAt, init.UpdatedAt)
	return err
}

func (r *pgRepository) DeleteInitiative(ctx context.Context, workspaceID, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ba_initiatives WHERE workspace_id = $1 AND id = $2`, workspaceID, id)
	return err
}

func (r *pgRepository) RecordAudit(ctx context.Context, entry *domain.AuditEntry) error {
	if entry.Timestamp.IsZero() {
		entry.Timestamp = time.Now()
	}
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ba_audit_logs (id, workspace_id, entity_type, entity_id, action, performed_by, timestamp, details)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, entry.ID, entry.WorkspaceID, entry.EntityType, entry.EntityID, entry.Action, entry.PerformedBy, entry.Timestamp, entry.Details)
	return err
}

func (r *pgRepository) ListAuditLogs(ctx context.Context, workspaceID string, limit int) ([]domain.AuditEntry, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := r.pool.Query(ctx, `
		SELECT id, workspace_id, entity_type, entity_id, action, performed_by, timestamp, details
		FROM ba_audit_logs
		WHERE workspace_id = $1
		ORDER BY timestamp DESC
		LIMIT $2
	`, workspaceID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.AuditEntry
	for rows.Next() {
		var a domain.AuditEntry
		if err := rows.Scan(&a.ID, &a.WorkspaceID, &a.EntityType, &a.EntityID, &a.Action, &a.PerformedBy, &a.Timestamp, &a.Details); err != nil {
			return nil, err
		}
		list = append(list, a)
	}
	return list, rows.Err()
}

func (r *pgRepository) ListSchemas(ctx context.Context) ([]domain.SchemaInfo, error) {
	query := `
		SELECT s.schema_name,
		       COALESCE(COUNT(t.table_name), 0) AS tables_count
		FROM information_schema.schemata s
		LEFT JOIN information_schema.tables t ON t.table_schema = s.schema_name
		WHERE s.schema_name NOT IN ('pg_catalog', 'pg_toast', 'information_schema')
		GROUP BY s.schema_name
		ORDER BY CASE WHEN s.schema_name = 'BT_BASE' THEN 1 WHEN s.schema_name = 'public' THEN 2 ELSE 3 END, s.schema_name ASC;
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.SchemaInfo
	for rows.Next() {
		var name string
		var count int
		if err := rows.Scan(&name, &count); err != nil {
			return nil, err
		}
		desc := "PostgreSQL Metamodel Schema"
		if name == "BT_BASE" {
			desc = "Primary Canonical Architecture Metamodel Schema"
		} else if name == "BA_BASE" {
			desc = "Business Artist Authoritative Metamodel & Requirements Schema"
		} else if name == "admin" {
			desc = "Identity, Access Governance & SSO Schema"
		} else if name == "eaa_base" {
			desc = "Enterprise Architecture Core Metamodel"
		} else if name == "public" {
			desc = "Default PostgreSQL Public Namespace"
		} else if name == "cmd" {
			desc = "Command & Control Architecture Metamodel"
		} else if name == "apra" {
			desc = "APRA CPS 230 Operational Resilience Schema"
		}
		list = append(list, domain.SchemaInfo{
			Name:        name,
			Description: desc,
			TablesCount: count,
			Status:      "Active",
			IsActive:    name == "BT_BASE",
		})
	}
	return list, rows.Err()
}
