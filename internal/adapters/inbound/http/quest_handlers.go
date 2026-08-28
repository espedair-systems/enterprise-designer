package http

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"arch-base-deploy/internal/core/domain"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

var (
	questMu           sync.RWMutex
	questSurveys      = make(map[string]domain.QuestSurvey)
	questQuestionBank = make(map[string]domain.QuestQuestionBankItem)
	questReference    = make(map[string]domain.QuestReferenceDataset)
	questSubmissions  = make(map[string]domain.QuestSubmission)
)

func init() {
	// Seed Initial Q Designer Data - Example 1: Fleet Driver Safety
	seedSurveyID := "survey-fleet-safety-2026"
	questSurveys[seedSurveyID] = domain.QuestSurvey{
		ID:          seedSurveyID,
		AppID:       "fleet-logistics",
		Title:       "Enterprise Fleet Driver Safety & Incident Audit 2026",
		Slug:        "fleet-safety-audit",
		Description: "Pre-trip commercial vehicle inspection, telematics verification, and driver safety sign-off.",
		Status:      "published",
		Version:     "1.2.0",
		Sections: []domain.QuestSection{
			{
				ID:          "sec-1",
				Title:       "Operator Identity & Vehicle Assignment",
				Description: "Verify driver credentials, license endorsements, and assigned CAN bus unit.",
				SortOrder:   1,
				Questions: []domain.QuestQuestion{
					{
						ID:           "q-101",
						SurveyID:     seedSurveyID,
						SectionID:    "sec-1",
						Code:         "OP-01",
						Text:         "Select Assigned Commercial Vehicle Unit (VIN / Fleet ID)",
						QuestionType: "single_choice",
						Required:     true,
						SortOrder:    1,
						Options: []domain.QuestOption{
							{ID: "opt-1", Label: "Volvo FH Electric (VIN: 1HGCR2F83HA001294)", Value: "vin_volvo_1294", Score: 10},
							{ID: "opt-2", Label: "Scania R500 Long-Haul (VIN: 2SCNR5F99KA004412)", Value: "vin_scania_4412", Score: 10},
							{ID: "opt-3", Label: "Mercedes-Benz eActros (VIN: 3MBEA7F11LA008891)", Value: "vin_mercedes_8891", Score: 10},
						},
					},
					{
						ID:           "q-102",
						SurveyID:     seedSurveyID,
						SectionID:    "sec-1",
						Code:         "OP-02",
						Text:         "Current Vehicle Odometer Reading (km)",
						QuestionType: "number",
						Required:     true,
						SortOrder:    2,
						HelpText:     "Enter total kilometers displayed on the primary digital dashboard cluster.",
					},
				},
			},
			{
				ID:          "sec-2",
				Title:       "Pre-Trip Telematics & Mechanical Health",
				Description: "Physical inspection of tire pressure, emergency braking, and CAN bus sensors.",
				SortOrder:   2,
				Questions: []domain.QuestQuestion{
					{
						ID:           "q-201",
						SurveyID:     seedSurveyID,
						SectionID:    "sec-2",
						Code:         "SF-01",
						Text:         "Pre-Trip Brake System & Pneumatic Pressure Rating",
						QuestionType: "rating",
						Required:     true,
						SortOrder:    1,
						HelpText:     "Scale: 1 (Defective / Ground Vehicle) to 5 (Optimal / Calibrated)",
					},
					{
						ID:           "q-202",
						SurveyID:     seedSurveyID,
						SectionID:    "sec-2",
						Code:         "SF-02",
						Text:         "Safety Critical Checklist",
						QuestionType: "multiple_choice",
						Required:     true,
						SortOrder:    2,
						Options: []domain.QuestOption{
							{ID: "opt-chk-1", Label: "Emergency Stop Switch Functional", Value: "estop_ok", Score: 25},
							{ID: "opt-chk-2", Label: "GPS & GSM Telematics Antenna Active", Value: "telematics_ok", Score: 25},
							{ID: "opt-chk-3", Label: "First Aid & Hazmat Kit Verified", Value: "firstaid_ok", Score: 25},
							{ID: "opt-chk-4", Label: "Tire Tread Depth > 4.5mm", Value: "tires_ok", Score: 25},
						},
					},
					{
						ID:           "q-203",
						SurveyID:     seedSurveyID,
						SectionID:    "sec-2",
						Code:         "SF-03",
						Text:         "Operator Remarks or Incident Notes",
						QuestionType: "textarea",
						Required:     false,
						SortOrder:    3,
					},
				},
			},
		},
		CreatedAt: time.Now().Add(-72 * time.Hour),
		UpdatedAt: time.Now().Add(-1 * time.Hour),
	}

	// Example 2: SOC 2 Type II
	soc2ID := "survey-soc2-type2-2026"
	questSurveys[soc2ID] = domain.QuestSurvey{
		ID:          soc2ID,
		AppID:       "fleet-logistics",
		Title:       "SOC 2 Type II Compliance & Security Control Audit",
		Slug:        "soc2-type2-audit",
		Description: "Annual SOC 2 Trust Services Criteria evaluation covering logical access, MFA, change control, and patch management.",
		Status:      "published",
		Version:     "2.1.0",
		CreatedAt:   time.Now().Add(-48 * time.Hour),
		UpdatedAt:   time.Now().Add(-2 * time.Hour),
	}

	// Example 3: AI Governance
	aiID := "survey-ai-governance-2026"
	questSurveys[aiID] = domain.QuestSurvey{
		ID:          aiID,
		AppID:       "fleet-logistics",
		Title:       "Enterprise AI Governance & Risk Assessment (EU AI Act & NIST AI RMF)",
		Slug:        "ai-governance-assessment",
		Description: "Evaluation of autonomous machine learning models for regulatory risk tiering, disparity/fairness testing, and human-in-the-loop oversight.",
		Status:      "published",
		Version:     "1.0.0",
		CreatedAt:   time.Now().Add(-36 * time.Hour),
		UpdatedAt:   time.Now().Add(-4 * time.Hour),
	}

	// Example 4: Vendor RFP
	rfpID := "survey-vendor-rfp-2026"
	questSurveys[rfpID] = domain.QuestSurvey{
		ID:          rfpID,
		AppID:       "fleet-logistics",
		Title:       "Strategic Vendor RFP / RFQ Evaluation & Due Diligence",
		Slug:        "vendor-rfp-evaluation",
		Description: "Comprehensive procurement evaluation of enterprise software vendors, SLA commitments, disaster recovery, and compliance.",
		Status:      "published",
		Version:     "1.1.0",
		CreatedAt:   time.Now().Add(-24 * time.Hour),
		UpdatedAt:   time.Now().Add(-3 * time.Hour),
	}

	// Example 5: Architecture Health
	archID := "survey-arch-health-2026"
	questSurveys[archID] = domain.QuestSurvey{
		ID:          archID,
		AppID:       "fleet-logistics",
		Title:       "Architecture & Technical Debt Modernization Scorecard",
		Slug:        "architecture-health-scorecard",
		Description: "Enterprise software maintainability, hexagonal architecture adherence, coupling metrics, and cloud modernization review.",
		Status:      "published",
		Version:     "1.0.0",
		CreatedAt:   time.Now().Add(-12 * time.Hour),
		UpdatedAt:   time.Now().Add(-30 * time.Minute),
	}

	// Seed Question Bank Items
	questQuestionBank["qb-1"] = domain.QuestQuestionBankItem{
		ID:           "qb-1",
		Code:         "SEC-MFA-01",
		Title:        "Hardware Multi-Factor Authentication Enforcement",
		Text:         "Verify that all root and administrative accounts enforce FIDO2 or WebAuthn hardware tokens.",
		Category:     "Security",
		QuestionType: "single_choice",
		DefaultOptions: []domain.QuestOption{
			{ID: "o-1", Label: "100% Enforced with Hardware Keys", Value: "fido2_enforced", Score: 100},
			{ID: "o-2", Label: "Software Authenticator App (TOTP)", Value: "totp_enforced", Score: 75},
			{ID: "o-3", Label: "SMS / Email Verification Only", Value: "sms_fallback", Score: 25},
			{ID: "o-4", Label: "Disabled / Single Factor", Value: "disabled", Score: 0},
		},
		Tags:      []string{"soc2", "cc6.1", "identity", "mfa"},
		CreatedAt: time.Now().Add(-48 * time.Hour),
	}
	questQuestionBank["qb-2"] = domain.QuestQuestionBankItem{
		ID:           "qb-2",
		Code:         "AI-RISK-01",
		Title:        "Autonomous Decision Criticality Level",
		Text:         "Classify the autonomy impact on customer life, liberty, financial standing, or physical safety.",
		Category:     "AI Governance",
		QuestionType: "dropdown",
		DefaultOptions: []domain.QuestOption{
			{ID: "o-1", Label: "Life-Critical / Safety-Impacting (Annex III High Risk)", Value: "critical_safety", Score: 20},
			{ID: "o-2", Label: "Financial / Credit Decisioning", Value: "financial_impact", Score: 40},
			{ID: "o-3", Label: "Operational Assistance / Advisory", Value: "advisory", Score: 80},
			{ID: "o-4", Label: "Low Risk / Informational Only", Value: "informational", Score: 100},
		},
		Tags:      []string{"eu_ai_act", "nist_ai_rmf", "risk_tier"},
		CreatedAt: time.Now().Add(-48 * time.Hour),
	}
	questQuestionBank["qb-3"] = domain.QuestQuestionBankItem{
		ID:           "qb-3",
		Code:         "VEN-SLA-01",
		Title:        "Vendor Production Uptime Guarantee",
		Text:         "Evaluate contractual uptime commitments and service credit penalties.",
		Category:     "Procurement",
		QuestionType: "dropdown",
		DefaultOptions: []domain.QuestOption{
			{ID: "o-1", Label: "99.99% Availability", Value: "sla_9999", Score: 100},
			{ID: "o-2", Label: "99.95% Availability", Value: "sla_9995", Score: 85},
			{ID: "o-3", Label: "99.9% Availability", Value: "sla_999", Score: 70},
		},
		Tags:      []string{"rfp", "vendor", "sla"},
		CreatedAt: time.Now().Add(-24 * time.Hour),
	}

	// Seed Reference Datasets
	questReference["ref-cloud-providers"] = domain.QuestReferenceDataset{
		ID:          "ref-cloud-providers",
		ListKey:     "cloud_providers",
		ListName:    "Cloud Hosting Providers",
		Description: "Standard cloud infrastructure and on-premise datacenter targets",
		Items: []domain.QuestOption{
			{ID: "c-1", Label: "Amazon Web Services (AWS)", Value: "aws", Score: 10},
			{ID: "c-2", Label: "Microsoft Azure", Value: "azure", Score: 10},
			{ID: "c-3", Label: "Google Cloud Platform (GCP)", Value: "gcp", Score: 10},
			{ID: "c-4", Label: "On-Premises Dedicated Datacenter", Value: "onprem", Score: 8},
			{ID: "c-5", Label: "Hybrid Multi-Cloud", Value: "hybrid", Score: 9},
		},
		UpdatedAt: time.Now(),
	}
	questReference["ref-sla-tiers"] = domain.QuestReferenceDataset{
		ID:          "ref-sla-tiers",
		ListKey:     "sla_availability_tiers",
		ListName:    "SLA Availability Tiers",
		Description: "Standard enterprise service level commitment tiers",
		Items: []domain.QuestOption{
			{ID: "s-1", Label: "99.99% Availability (Tier 4 Fault Tolerant)", Value: "99_99", Score: 100},
			{ID: "s-2", Label: "99.95% Availability (Tier 3 High Availability)", Value: "99_95", Score: 85},
			{ID: "s-3", Label: "99.9% Availability (Tier 2 Standard Business)", Value: "99_9", Score: 70},
			{ID: "s-4", Label: "99.5% Availability (Tier 1 Basic)", Value: "99_5", Score: 50},
			{ID: "s-5", Label: "< 99.0% Availability (Best Effort)", Value: "below_99", Score: 20},
		},
		UpdatedAt: time.Now(),
	}
	questReference["ref-environments"] = domain.QuestReferenceDataset{
		ID:          "ref-environments",
		ListKey:     "deployment_environments",
		ListName:    "Deployment Environments",
		Description: "Software deployment lifecycle tiers",
		Items: []domain.QuestOption{
			{ID: "e-1", Label: "Production Tier 1 (Customer Critical)", Value: "prod_tier1", Score: 10},
			{ID: "e-2", Label: "Production Tier 2 (Internal Business)", Value: "prod_tier2", Score: 8},
			{ID: "e-3", Label: "Staging / Pre-Production", Value: "staging", Score: 6},
			{ID: "e-4", Label: "QA / Automated Test Cluster", Value: "qa", Score: 4},
			{ID: "e-5", Label: "Development / Sandbox", Value: "dev", Score: 2},
		},
		UpdatedAt: time.Now(),
	}

	// Seed Sample Submission
	questSubmissions["sub-1"] = domain.QuestSubmission{
		ID:           "sub-20260828-9921",
		SurveyID:     seedSurveyID,
		RespondentID: "driver-operator-0881",
		Status:       "completed",
		Score:        98.5,
		Answers: map[string]interface{}{
			"q-101": "vin_volvo_1294",
			"q-102": 142850,
			"q-201": 5,
			"q-202": []string{"estop_ok", "telematics_ok", "firstaid_ok", "tires_ok"},
			"q-203": "Unit pre-trip completed with zero mechanical anomalies.",
			"q-301": "certified",
		},
		SubmittedAt: time.Now().Add(-2 * time.Hour),
	}
}

// ListQuestSurveysHandler returns all survey definitions in DES_BASE.quest_surveys.
func ListQuestSurveysHandler(w http.ResponseWriter, r *http.Request) {
	questMu.RLock()
	defer questMu.RUnlock()

	list := make([]domain.QuestSurvey, 0, len(questSurveys))
	for _, s := range questSurveys {
		list = append(list, s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}

// GetQuestSurveyHandler returns a single survey by ID.
func GetQuestSurveyHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	questMu.RLock()
	defer questMu.RUnlock()

	survey, exists := questSurveys[id]
	if !exists {
		http.Error(w, `{"error":"Survey not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(survey)
}

// CreateQuestSurveyHandler creates a new survey definition.
func CreateQuestSurveyHandler(w http.ResponseWriter, r *http.Request) {
	var req domain.QuestSurvey
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if req.ID == "" {
		req.ID = "survey-" + uuid.New().String()[:8]
	}
	if req.Status == "" {
		req.Status = "draft"
	}
	if req.Version == "" {
		req.Version = "1.0.0"
	}
	now := time.Now()
	req.CreatedAt = now
	req.UpdatedAt = now

	questMu.Lock()
	questSurveys[req.ID] = req
	questMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

// UpdateQuestSurveyHandler updates or autosaves a survey definition.
func UpdateQuestSurveyHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req domain.QuestSurvey
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	questMu.Lock()
	defer questMu.Unlock()

	existing, exists := questSurveys[id]
	if !exists {
		req.ID = id
		req.CreatedAt = time.Now()
	} else {
		req.ID = existing.ID
		req.CreatedAt = existing.CreatedAt
	}
	req.UpdatedAt = time.Now()
	questSurveys[id] = req

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

// DeleteQuestSurveyHandler deletes a survey by ID.
func DeleteQuestSurveyHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	questMu.Lock()
	defer questMu.Unlock()

	delete(questSurveys, id)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true,"message":"Survey deleted from DES_BASE.quest_surveys"}`))
}

// ListQuestQuestionBankHandler returns all reusable question bank items.
func ListQuestQuestionBankHandler(w http.ResponseWriter, r *http.Request) {
	questMu.RLock()
	defer questMu.RUnlock()

	list := make([]domain.QuestQuestionBankItem, 0, len(questQuestionBank))
	for _, item := range questQuestionBank {
		list = append(list, item)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}

// CreateQuestQuestionBankHandler adds a new question to the Question Bank.
func CreateQuestQuestionBankHandler(w http.ResponseWriter, r *http.Request) {
	var item domain.QuestQuestionBankItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}

	if item.ID == "" {
		item.ID = "qb-" + uuid.New().String()[:8]
	}
	item.CreatedAt = time.Now()

	questMu.Lock()
	questQuestionBank[item.ID] = item
	questMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

// ListQuestReferenceDataHandler returns all reference lookup datasets.
func ListQuestReferenceDataHandler(w http.ResponseWriter, r *http.Request) {
	questMu.RLock()
	defer questMu.RUnlock()

	list := make([]domain.QuestReferenceDataset, 0, len(questReference))
	for _, ref := range questReference {
		list = append(list, ref)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}

// CreateQuestReferenceDataHandler creates or updates a reference dataset.
func CreateQuestReferenceDataHandler(w http.ResponseWriter, r *http.Request) {
	var ref domain.QuestReferenceDataset
	if err := json.NewDecoder(r.Body).Decode(&ref); err != nil {
		http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}

	if ref.ID == "" {
		ref.ID = "ref-" + uuid.New().String()[:8]
	}
	ref.UpdatedAt = time.Now()

	questMu.Lock()
	questReference[ref.ID] = ref
	questMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ref)
}

// ListQuestSubmissionsHandler returns all audit submission records.
func ListQuestSubmissionsHandler(w http.ResponseWriter, r *http.Request) {
	questMu.RLock()
	defer questMu.RUnlock()

	list := make([]domain.QuestSubmission, 0, len(questSubmissions))
	for _, sub := range questSubmissions {
		list = append(list, sub)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}

// CreateQuestSubmissionHandler records a submitted survey response.
func CreateQuestSubmissionHandler(w http.ResponseWriter, r *http.Request) {
	var sub domain.QuestSubmission
	if err := json.NewDecoder(r.Body).Decode(&sub); err != nil {
		http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}

	if sub.ID == "" {
		sub.ID = "sub-" + uuid.New().String()[:8]
	}
	if sub.Status == "" {
		sub.Status = "completed"
	}
	sub.SubmittedAt = time.Now()

	questMu.Lock()
	questSubmissions[sub.ID] = sub
	questMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(sub)
}
