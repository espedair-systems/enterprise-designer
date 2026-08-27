package services

import (
	"context"
	"math"

	"arch-base-deploy/internal/core/domain"
	"arch-base-deploy/internal/core/ports"
)

type businessArchitectureService struct {
	repo ports.Repository
}

// NewBusinessArchitectureService instantiates the business architecture analytics engine.
func NewBusinessArchitectureService(repo ports.Repository) ports.BusinessArchitectureService {
	return &businessArchitectureService{
		repo: repo,
	}
}

func (s *businessArchitectureService) GetExecutiveDashboard(ctx context.Context, workspaceID string) (*domain.ExecutiveDashboardKPIs, error) {
	caps, err := s.repo.ListCapabilities(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	valStreams, err := s.repo.ListValueStreams(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	procs, err := s.repo.ListProcesses(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	inits, err := s.repo.ListInitiatives(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	infoConcepts, err := s.repo.ListInformationConcepts(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	orgs, err := s.repo.ListOrgUnits(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	goals, err := s.repo.ListStrategicGoals(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	var totalMaturity, totalTargetMaturity float64
	for _, c := range caps {
		totalMaturity += c.CurrentMaturity
		totalTargetMaturity += c.TargetMaturity
	}

	avgMaturity := 0.0
	totalGap := 0.0
	if len(caps) > 0 {
		avgMaturity = math.Round((totalMaturity/float64(len(caps)))*100) / 100
		totalGap = math.Round((totalTargetMaturity-totalMaturity)*100) / 100
	}

	var totalFlowEff float64
	var stageCount int
	for _, vs := range valStreams {
		for _, stg := range vs.Stages {
			totalFlowEff += stg.FlowEfficiencyPct
			stageCount++
		}
	}
	avgFlowEff := 0.0
	if stageCount > 0 {
		avgFlowEff = math.Round((totalFlowEff/float64(stageCount))*100) / 100
	}

	var totalAutoPct float64
	for _, p := range procs {
		totalAutoPct += p.OverallAutomationPct
	}
	avgAutoPct := 0.0
	if len(procs) > 0 {
		avgAutoPct = math.Round((totalAutoPct/float64(len(procs)))*100) / 100
	}

	var totalBudget float64
	activeInits := 0
	for _, i := range inits {
		totalBudget += i.BudgetUSD
		if i.Status == domain.StatusActive || i.Status == domain.StatusApproved {
			activeInits++
		}
	}

	var totalFTE float64
	for _, o := range orgs {
		totalFTE += o.HeadcountFTE
	}

	var totalGoalProgress float64
	for _, g := range goals {
		totalGoalProgress += g.ProgressPct
	}
	strategicAlignment := 75.0
	if len(goals) > 0 {
		strategicAlignment = math.Round((totalGoalProgress/float64(len(goals)))*100) / 100
	}

	return &domain.ExecutiveDashboardKPIs{
		TotalCapabilities:         len(caps),
		AverageCapabilityMaturity: avgMaturity,
		TotalMaturityGap:          totalGap,
		TotalValueStreams:         len(valStreams),
		AvgFlowEfficiencyPct:      avgFlowEff,
		TotalBusinessProcesses:    len(procs),
		AvgProcessAutomationPct:   avgAutoPct,
		StrategicAlignmentScore:   strategicAlignment,
		TotalInitiativeBudgetUSD:  totalBudget,
		TotalActiveInitiatives:    activeInits,
		TotalInformationConcepts:  len(infoConcepts),
		TotalOrgHeadcountFTE:      totalFTE,
	}, nil
}

func (s *businessArchitectureService) GetCapabilityHeatmap(ctx context.Context, workspaceID string) ([]domain.CapabilityHeatmapCell, error) {
	caps, err := s.repo.ListCapabilities(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	cells := make([]domain.CapabilityHeatmapCell, 0, len(caps))
	for _, c := range caps {
		health := "green"
		gap := c.TargetMaturity - c.CurrentMaturity
		if gap >= 1.5 || c.CurrentMaturity < 2.5 {
			health = "red"
		} else if gap >= 0.8 || c.CurrentMaturity < 3.5 {
			health = "yellow"
		} else if c.CurrentMaturity >= 4.0 {
			health = "blue"
		}

		cells = append(cells, domain.CapabilityHeatmapCell{
			CapabilityID:        c.ID,
			Code:                c.Code,
			Name:                c.Name,
			Level:               c.Level,
			CurrentMaturity:     c.CurrentMaturity,
			TargetMaturity:      c.TargetMaturity,
			StrategicImportance: c.StrategicImportance,
			PaceLayer:           c.PaceLayer,
			InvestmentPriority:  c.InvestmentPriority,
			HealthColor:         health,
		})
	}
	return cells, nil
}

func (s *businessArchitectureService) GetCapabilityGaps(ctx context.Context, workspaceID string) ([]domain.CapabilityGap, error) {
	caps, err := s.repo.ListCapabilities(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	gaps := make([]domain.CapabilityGap, 0)
	for _, c := range caps {
		gap := c.TargetMaturity - c.CurrentMaturity
		if gap > 0.0 {
			urgency := gap * 2.0
			if c.StrategicImportance == domain.StrategicCore {
				urgency += 2.0
			} else if c.StrategicImportance == domain.StrategicDifferentiating {
				urgency += 1.0
			}

			action := "Monitor incremental optimization"
			if urgency >= 4.0 {
				action = "Immediate Horizon 1 transformation initiative recommended"
			} else if urgency >= 2.5 {
				action = "Schedule Horizon 2 process & tech modernization"
			}

			gaps = append(gaps, domain.CapabilityGap{
				CapabilityID:      c.ID,
				CapabilityCode:    c.Code,
				CapabilityName:    c.Name,
				CurrentMaturity:   c.CurrentMaturity,
				TargetMaturity:    c.TargetMaturity,
				GapDelta:          math.Round(gap*100) / 100,
				UrgencyScore:      math.Round(urgency*10) / 10,
				RecommendedAction: action,
			})
		}
	}
	return gaps, nil
}

func (s *businessArchitectureService) GetValueStreamFlowAnalysis(ctx context.Context, workspaceID string) ([]domain.ValueStreamMetricSummary, error) {
	valStreams, err := s.repo.ListValueStreams(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	summaries := make([]domain.ValueStreamMetricSummary, 0, len(valStreams))
	for _, vs := range valStreams {
		var totalLead, totalProcess, totalFlow float64
		var maxLead float64
		bottleneck := "None"

		for _, stg := range vs.Stages {
			totalLead += stg.LeadTimeHours
			totalProcess += stg.ProcessingTimeHours
			totalFlow += stg.FlowEfficiencyPct
			if stg.LeadTimeHours > maxLead {
				maxLead = stg.LeadTimeHours
				bottleneck = stg.Name
			}
		}

		avgFlow := 0.0
		if len(vs.Stages) > 0 {
			avgFlow = math.Round((totalFlow/float64(len(vs.Stages)))*100) / 100
		}

		summaries = append(summaries, domain.ValueStreamMetricSummary{
			ValueStreamID:        vs.ID,
			ValueStreamName:      vs.Name,
			StageCount:           len(vs.Stages),
			TotalLeadTimeHours:   math.Round(totalLead*100) / 100,
			TotalProcessHours:    math.Round(totalProcess*100) / 100,
			AvgFlowEfficiencyPct: avgFlow,
			BottleneckStageName:  bottleneck,
		})
	}
	return summaries, nil
}

func (s *businessArchitectureService) GetStrategyTraceabilityMatrix(ctx context.Context, workspaceID string) ([]domain.StrategyTraceabilityItem, error) {
	drivers, err := s.repo.ListStrategicDrivers(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	goals, err := s.repo.ListStrategicGoals(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	objectives, err := s.repo.ListStrategicObjectives(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	caps, err := s.repo.ListCapabilities(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	inits, err := s.repo.ListInitiatives(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	capMap := make(map[string]domain.Capability)
	for _, c := range caps {
		capMap[c.ID] = c
	}

	goalMap := make(map[string]domain.StrategicGoal)
	for _, g := range goals {
		goalMap[g.ID] = g
	}

	driverMap := make(map[string]domain.StrategicDriver)
	for _, d := range drivers {
		driverMap[d.ID] = d
	}

	initByCap := make(map[string]domain.Initiative)
	for _, i := range inits {
		for _, cid := range i.ImpactedCapabilityIDs {
			initByCap[cid] = i
		}
	}

	matrix := make([]domain.StrategyTraceabilityItem, 0)
	for _, obj := range objectives {
		goal := goalMap[obj.GoalID]
		driverName := "Enterprise Growth Strategy"
		if len(goal.DriverIDs) > 0 {
			if d, ok := driverMap[goal.DriverIDs[0]]; ok {
				driverName = d.Name
			}
		}

		for _, cid := range obj.ImpactedCapabilityIDs {
			c, hasCap := capMap[cid]
			if !hasCap {
				continue
			}

			initName := "Unscheduled Capability Investment"
			horizon := "Backlog"
			if init, hasInit := initByCap[cid]; hasInit {
				initName = init.Name
				horizon = string(init.Horizon)
			}

			score := 85.0
			if c.CurrentMaturity < 3.0 && horizon == "Backlog" {
				score = 40.0 // At risk: low maturity with no scheduled initiative
			} else if c.CurrentMaturity >= 4.0 {
				score = 95.0
			}

			matrix = append(matrix, domain.StrategyTraceabilityItem{
				DriverName:      driverName,
				GoalTitle:       goal.Title,
				ObjectiveTitle:  obj.Title,
				CapabilityCode:  c.Code,
				CapabilityName:  c.Name,
				CurrentMaturity: c.CurrentMaturity,
				TargetMaturity:  c.TargetMaturity,
				ValueStreamName: "Customer Journey Flow",
				InitiativeName:  initName,
				Horizon:         horizon,
				AlignmentScore:  score,
			})
		}
	}
	return matrix, nil
}

func (s *businessArchitectureService) GetPaceBreakdown(ctx context.Context, workspaceID string) (*domain.CapabilityPaceBreakdown, error) {
	caps, err := s.repo.ListCapabilities(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	var innoCount, diffCount, recCount int
	var innoMat, diffMat, recMat float64

	for _, c := range caps {
		switch c.PaceLayer {
		case domain.PaceInnovation:
			innoCount++
			innoMat += c.CurrentMaturity
		case domain.PaceDifferentiation:
			diffCount++
			diffMat += c.CurrentMaturity
		case domain.PaceRecord:
			recCount++
			recMat += c.CurrentMaturity
		default:
			diffCount++
			diffMat += c.CurrentMaturity
		}
	}

	innoAvg, diffAvg, recAvg := 0.0, 0.0, 0.0
	if innoCount > 0 {
		innoAvg = math.Round((innoMat/float64(innoCount))*100) / 100
	}
	if diffCount > 0 {
		diffAvg = math.Round((diffMat/float64(diffCount))*100) / 100
	}
	if recCount > 0 {
		recAvg = math.Round((recMat/float64(recCount))*100) / 100
	}

	return &domain.CapabilityPaceBreakdown{
		InnovationCount:       innoCount,
		DifferentiationCount:  diffCount,
		RecordCount:           recCount,
		InnovationAvgMaturity: innoAvg,
		DiffAvgMaturity:       diffAvg,
		RecordAvgMaturity:     recAvg,
	}, nil
}

func (s *businessArchitectureService) GetHorizonBudgetSummary(ctx context.Context, workspaceID string) (*domain.HorizonBudgetSummary, error) {
	inits, err := s.repo.ListInitiatives(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	var h1Budget, h2Budget, h3Budget float64
	var h1Count, h2Count, h3Count int

	for _, i := range inits {
		switch i.Horizon {
		case domain.Horizon1Core:
			h1Count++
			h1Budget += i.BudgetUSD
		case domain.Horizon2Emerging:
			h2Count++
			h2Budget += i.BudgetUSD
		case domain.Horizon3Transform:
			h3Count++
			h3Budget += i.BudgetUSD
		default:
			h1Count++
			h1Budget += i.BudgetUSD
		}
	}

	return &domain.HorizonBudgetSummary{
		Horizon1BudgetUSD: h1Budget,
		Horizon2BudgetUSD: h2Budget,
		Horizon3BudgetUSD: h3Budget,
		Horizon1Count:     h1Count,
		Horizon2Count:     h2Count,
		Horizon3Count:     h3Count,
	}, nil
}
