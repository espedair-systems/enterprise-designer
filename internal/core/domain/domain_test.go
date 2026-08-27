package domain

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCapabilityModel(t *testing.T) {
	cap := Capability{
		ID:                  "cap-01",
		WorkspaceID:         "ws-default",
		Code:                "CAP-01",
		Name:                "Customer Management",
		Description:         "Core enterprise customer lifecycle management",
		Level:               Level1,
		PaceLayer:           PaceDifferentiation,
		StrategicImportance: StrategicCore,
		CurrentMaturity:     3.2,
		TargetMaturity:      4.5,
		InvestmentPriority:  "High",
		RiskScore:           2.1,
		BusinessOwner:       "Chief Commercial Officer",
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	assert.Equal(t, "CAP-01", cap.Code)
	assert.Equal(t, Level1, cap.Level)
	assert.Equal(t, PaceDifferentiation, cap.PaceLayer)
	assert.Equal(t, StrategicCore, cap.StrategicImportance)
	assert.InDelta(t, 1.3, cap.TargetMaturity-cap.CurrentMaturity, 0.001)
}

func TestValueStreamModel(t *testing.T) {
	vs := ValueStream{
		ID:               "vs-01",
		WorkspaceID:      "ws-default",
		Code:             "VS-ONBOARD",
		Name:             "Customer Onboarding",
		Type:             ValueStreamCoreCustomer,
		Trigger:          "Customer signs contract",
		ValueProposition: "Instant access to digital accounts",
		Stakeholder:      "New Customer",
		Owner:            "VP Digital Experience",
	}

	stage := ValueStage{
		ID:                  "stg-01",
		ValueStreamID:       vs.ID,
		OrderIndex:          1,
		Name:                "Identity Verification",
		EntranceCriteria:    "KYC documents submitted",
		ExitCriteria:        "Identity verified by compliance",
		ValueProduced:       "Verified Customer Identity",
		LeadTimeHours:       2.5,
		ProcessingTimeHours: 0.5,
		FlowEfficiencyPct:   20.0,
	}

	assert.Equal(t, "VS-ONBOARD", vs.Code)
	assert.Equal(t, ValueStreamCoreCustomer, vs.Type)
	assert.Equal(t, "stg-01", stage.ID)
	assert.Equal(t, 20.0, stage.FlowEfficiencyPct)
}

func TestBusinessProcessAndSIPOC(t *testing.T) {
	proc := BusinessProcess{
		ID:             "proc-01",
		WorkspaceID:    "ws-default",
		Code:           "PROC-KYC-01",
		Name:           "Digital KYC Validation",
		Category:       ProcessCore,
		Classification: ProcessSemiAutomated,
		OwnerRole:      "Compliance Operations Lead",
		SIPOC: SIPOC{
			Suppliers: []string{"Customer", "Identity Bureau"},
			Inputs:    []string{"Passport Scan", "Selfie Liveness"},
			Outputs:   []string{"Biometric Match Report", "Risk Score"},
			Customers: []string{"Account Opening Engine"},
		},
		AvgCycleTimeMinutes:  15.0,
		OverallAutomationPct: 85.0,
	}

	assert.Equal(t, ProcessCore, proc.Category)
	assert.Equal(t, 2, len(proc.SIPOC.Suppliers))
	assert.Equal(t, 85.0, proc.OverallAutomationPct)
}

func TestDomainValidations(t *testing.T) {
	// Capability validation
	validCap := Capability{Name: "Core Banking", Level: Level1, CurrentMaturity: 3.0, TargetMaturity: 4.0}
	assert.NoError(t, validCap.Validate())

	invalidCap := Capability{Name: "", Level: Level1}
	assert.ErrorIs(t, invalidCap.Validate(), ErrInvalidInput)

	invalidCapMaturity := Capability{Name: "Core Banking", Level: Level1, CurrentMaturity: 6.0}
	assert.ErrorIs(t, invalidCapMaturity.Validate(), ErrInvalidInput)

	// Process validation
	validProc := BusinessProcess{Name: "Loan Origination", AvgCycleTimeMinutes: 45.0, OverallAutomationPct: 75.0}
	assert.NoError(t, validProc.Validate())

	invalidProc := BusinessProcess{Name: "Loan Origination", OverallAutomationPct: 150.0}
	assert.ErrorIs(t, invalidProc.Validate(), ErrInvalidInput)

	// Org validation
	validOrg := OrgUnit{Name: "Finance & Risk", HeadcountFTE: 25.0}
	assert.NoError(t, validOrg.Validate())

	invalidOrg := OrgUnit{Name: "", HeadcountFTE: 10.0}
	assert.ErrorIs(t, invalidOrg.Validate(), ErrInvalidInput)
}

