package exporters

import (
	"bytes"
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"strings"

	"arch-base-deploy/internal/core/domain"
	"arch-base-deploy/internal/core/ports"
)

type defaultExporter struct {
	repo ports.Repository
}

// NewExporter creates an exporter for Architecture JSON, ArchiMate, Markdown, and CSV formats.
func NewExporter(repo ports.Repository) ports.Exporter {
	return &defaultExporter{
		repo: repo,
	}
}

type BizBOKExportPayload struct {
	Workspace        *domain.Workspace                 `json:"workspace"`
	Capabilities     []domain.Capability               `json:"capabilities"`
	ValueStreams     []domain.ValueStream              `json:"value_streams"`
	Processes        []domain.BusinessProcess          `json:"processes"`
	OrgUnits         []domain.OrgUnit                  `json:"org_units"`
	BusinessFunctions []domain.BusinessFunction        `json:"business_functions"`
	BusinessRoles    []domain.BusinessRole             `json:"business_roles"`
	BusinessServices []domain.BusinessService          `json:"business_services"`
	Products         []domain.Product                  `json:"products"`
	StrategicGoals   []domain.StrategicGoal            `json:"strategic_goals"`
	Objectives       []domain.StrategicObjective       `json:"strategic_objectives"`
	InformationConcepts []domain.BusinessInformationConcept `json:"information_concepts"`
	BusinessTerms    []domain.BusinessTerm             `json:"business_terms"`
	Initiatives      []domain.Initiative               `json:"initiatives"`
}

func (e *defaultExporter) ExportBizBOKJSON(ctx context.Context, workspaceID string) ([]byte, error) {
	ws, _ := e.repo.GetWorkspace(ctx, workspaceID)
	caps, _ := e.repo.ListCapabilities(ctx, workspaceID)
	valStreams, _ := e.repo.ListValueStreams(ctx, workspaceID)
	procs, _ := e.repo.ListProcesses(ctx, workspaceID)
	orgs, _ := e.repo.ListOrgUnits(ctx, workspaceID)
	bfs, _ := e.repo.ListBusinessFunctions(ctx, workspaceID)
	roles, _ := e.repo.ListBusinessRoles(ctx, workspaceID)
	svcs, _ := e.repo.ListBusinessServices(ctx, workspaceID)
	prods, _ := e.repo.ListProducts(ctx, workspaceID)
	goals, _ := e.repo.ListStrategicGoals(ctx, workspaceID)
	objs, _ := e.repo.ListStrategicObjectives(ctx, workspaceID)
	concepts, _ := e.repo.ListInformationConcepts(ctx, workspaceID)
	terms, _ := e.repo.ListBusinessTerms(ctx, workspaceID)
	inits, _ := e.repo.ListInitiatives(ctx, workspaceID)

	payload := BizBOKExportPayload{
		Workspace:           ws,
		Capabilities:        caps,
		ValueStreams:        valStreams,
		Processes:           procs,
		OrgUnits:            orgs,
		BusinessFunctions:   bfs,
		BusinessRoles:       roles,
		BusinessServices:    svcs,
		Products:            prods,
		StrategicGoals:      goals,
		Objectives:          objs,
		InformationConcepts: concepts,
		BusinessTerms:       terms,
		Initiatives:         inits,
	}

	return json.MarshalIndent(payload, "", "  ")
}

func (e *defaultExporter) ExportArchiMateXML(ctx context.Context, workspaceID string) ([]byte, error) {
	caps, _ := e.repo.ListCapabilities(ctx, workspaceID)
	valStreams, _ := e.repo.ListValueStreams(ctx, workspaceID)
	procs, _ := e.repo.ListProcesses(ctx, workspaceID)

	var sb strings.Builder
	sb.WriteString(`<?xml version="1.0" encoding="UTF-8"?>` + "\n")
	sb.WriteString(`<model xmlns="http://www.opengroup.org/xsd/archimate/3.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" identifier="id-ba-export">` + "\n")
	sb.WriteString(`  <name>Business Artist Canonical Export</name>` + "\n")
	sb.WriteString(`  <elements>` + "\n")

	for _, c := range caps {
		sb.WriteString(fmt.Sprintf(`    <element identifier="%s" xsi:type="Capability"><name>%s (%s)</name><documentation>%s</documentation></element>`+"\n", c.ID, c.Name, c.Code, c.Description))
	}
	for _, vs := range valStreams {
		sb.WriteString(fmt.Sprintf(`    <element identifier="%s" xsi:type="ValueStream"><name>%s (%s)</name><documentation>%s</documentation></element>`+"\n", vs.ID, vs.Name, vs.Code, vs.Description))
	}
	for _, p := range procs {
		sb.WriteString(fmt.Sprintf(`    <element identifier="%s" xsi:type="BusinessProcess"><name>%s (%s)</name><documentation>%s</documentation></element>`+"\n", p.ID, p.Name, p.Code, p.Description))
	}

	sb.WriteString(`  </elements>` + "\n")
	sb.WriteString(`</model>` + "\n")
	return []byte(sb.String()), nil
}

func (e *defaultExporter) ExportCapabilityCSV(ctx context.Context, workspaceID string) ([]byte, error) {
	caps, err := e.repo.ListCapabilities(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	w := csv.NewWriter(&buf)
	_ = w.Write([]string{"Code", "Name", "Level", "PaceLayer", "StrategicImportance", "CurrentMaturity", "TargetMaturity", "Gap", "Owner", "InvestmentPriority"})

	for _, c := range caps {
		gap := fmt.Sprintf("%.2f", c.TargetMaturity-c.CurrentMaturity)
		_ = w.Write([]string{
			c.Code,
			c.Name,
			fmt.Sprintf("%d", c.Level),
			string(c.PaceLayer),
			string(c.StrategicImportance),
			fmt.Sprintf("%.2f", c.CurrentMaturity),
			fmt.Sprintf("%.2f", c.TargetMaturity),
			gap,
			c.BusinessOwner,
			c.InvestmentPriority,
		})
	}
	w.Flush()
	return buf.Bytes(), nil
}

func (e *defaultExporter) ExportStrategyMarkdown(ctx context.Context, workspaceID string) (string, error) {
	goals, _ := e.repo.ListStrategicGoals(ctx, workspaceID)
	inits, _ := e.repo.ListInitiatives(ctx, workspaceID)

	var sb strings.Builder
	sb.WriteString("# Executive Business Architecture Summary\n\n")
	sb.WriteString("## Strategic Goals\n")
	for _, g := range goals {
		sb.WriteString(fmt.Sprintf("- **[%s] %s** (Horizon: %d, Progress: %.1f%%): %s\n", g.Code, g.Title, g.HorizonYear, g.ProgressPct, g.Description))
	}

	sb.WriteString("\n## Transformation Programs & Initiatives\n")
	for _, i := range inits {
		sb.WriteString(fmt.Sprintf("- **[%s] %s** (%s | Budget: $%.0f): %s\n", i.Code, i.Name, i.Horizon, i.BudgetUSD, i.Description))
	}
	return sb.String(), nil
}
