package http

import (
	"io/fs"

	httpMiddleware "arch-base-deploy/internal/adapters/inbound/http/middleware"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

// SetupRouter initializes the Chi HTTP router with all API v1 endpoints and embedded web SPA assets.
func SetupRouter(h *Handler, distFS fs.FS) *chi.Mux {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(httpMiddleware.TelemetryLogger())
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// API v1 Routes
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", h.HealthCheck)
		r.Get("/workspaces", h.ListWorkspaces)

		// ESPEDAIR Designer: Applications, Layouts & Template Scaffolding
		r.Get("/designer/apps", h.ListDesignerApps)
		r.Post("/designer/apps", h.CreateDesignerApp)
		r.Get("/designer/apps/{id}", h.GetDesignerApp)
		r.Put("/designer/apps/{id}/layout", h.UpdateDesignerLayout)
		r.Delete("/designer/apps/{id}", h.DeleteDesignerApp)
		r.Post("/designer/apps/{id}/export/source", h.ExportAppSource)
		r.Post("/designer/apps/{id}/export/binary", h.ExportAppBinary)

		// UML Use Cases & Diagrams (uc_ and diag_ tables in DES_BASE)
		r.Get("/designer/apps/{id}/usecases", h.ListUseCases)
		r.Post("/designer/apps/{id}/usecases", h.SaveUseCase)
		r.Delete("/designer/apps/{id}/usecases/{useCaseId}", h.DeleteUseCase)
		r.Get("/designer/apps/{id}/actors", h.ListActors)
		r.Post("/designer/apps/{id}/actors", h.SaveActor)
		r.Delete("/designer/apps/{id}/actors/{actorId}", h.DeleteActor)
		r.Get("/designer/apps/{id}/diagrams", h.GetDiagramLayout)
		r.Post("/designer/apps/{id}/diagrams", h.SaveDiagramLayout)

		// Change Requests (CR)
		r.Get("/cr", h.ListChangeRequests)
		r.Post("/cr", h.CreateChangeRequest)

		// ESPEDAIR Schematics Bridge: ER Modeling, Migrations, AST Linter & Lineage
		r.Post("/schematics/diff", h.GenerateSchemaDiff)
		r.Post("/schematics/migrations/plan", h.PlanMigration)
		r.Post("/schematics/lint", h.LintSQL)
		r.Get("/schematics/lineage", h.GetColumnLevelLineage)

		// Capabilities
		r.Get("/capabilities", h.ListCapabilities)
		r.Post("/capabilities", h.SaveCapability)
		r.Get("/capabilities/{id}", h.GetCapability)
		r.Delete("/capabilities/{id}", h.DeleteCapability)

		// Value Streams
		r.Get("/valuestreams", h.ListValueStreams)
		r.Post("/valuestreams", h.SaveValueStream)
		r.Delete("/valuestreams/{id}", h.DeleteValueStream)

		// Processes
		r.Get("/processes", h.ListProcesses)
		r.Post("/processes", h.SaveProcess)
		r.Delete("/processes/{id}", h.DeleteProcess)

		// Organization, Functions & Roles
		r.Get("/org/units", h.ListOrgUnits)
		r.Post("/org/units", h.SaveOrgUnit)
		r.Get("/org/functions", h.ListBusinessFunctions)
		r.Post("/org/functions", h.SaveBusinessFunction)
		r.Get("/org/roles", h.ListBusinessRoles)
		r.Post("/org/roles", h.SaveBusinessRole)

		// Business Services & Products
		r.Get("/services", h.ListBusinessServices)
		r.Post("/services", h.SaveBusinessService)
		r.Get("/products", h.ListProducts)
		r.Post("/products", h.SaveProduct)

		// Strategy & OKRs
		r.Get("/strategy/drivers", h.ListStrategicDrivers)
		r.Get("/strategy/goals", h.ListStrategicGoals)
		r.Post("/strategy/goals", h.SaveStrategicGoal)
		r.Get("/strategy/objectives", h.ListStrategicObjectives)
		r.Post("/strategy/objectives", h.SaveStrategicObjective)
		r.Get("/strategy/canvas", h.GetBusinessModelCanvas)
		r.Post("/strategy/canvas", h.SaveBusinessModelCanvas)
		r.Get("/strategy/traceability", h.GetStrategyTraceability)

		// Information Concepts & Glossary
		r.Get("/information/concepts", h.ListInformationConcepts)
		r.Post("/information/concepts", h.SaveInformationConcept)
		r.Get("/information/terms", h.ListBusinessTerms)
		r.Post("/information/terms", h.SaveBusinessTerm)

		// Transformation Initiatives & Roadmap
		r.Get("/initiatives", h.ListInitiatives)
		r.Post("/initiatives", h.SaveInitiative)
		r.Delete("/initiatives/{id}", h.DeleteInitiative)

		// Analytics & Heatmaps
		r.Get("/analytics/dashboard", h.GetExecutiveDashboard)
		r.Get("/analytics/heatmap", h.GetCapabilityHeatmap)
		r.Get("/analytics/gaps", h.GetCapabilityGaps)
		r.Get("/analytics/valuestreams", h.GetValueStreamFlowAnalysis)
		r.Get("/analytics/pace", h.GetPaceBreakdown)
		r.Get("/analytics/horizons", h.GetHorizonBudgetSummary)

		// Exports
		r.Get("/export/bizbok", h.ExportBizBOK)
		r.Get("/export/archimate", h.ExportArchiMate)
		r.Get("/export/csv", h.ExportCSV)

		// Audits
		r.Get("/audit", h.ListAuditLogs)

		// Architecture OS Artists Health & Configuration
		r.Get("/artists", h.ListArtistsConfig)
		r.Get("/artists/health", h.CheckArtistsHealth)
		r.Get("/artists/{id}/health", h.CheckSingleArtistHealth)

		// Autonomous Agents & Knowledge Services Health & Configuration
		r.Get("/agents", h.ListAgentsConfig)
		r.Get("/agents/health", h.CheckAgentsHealth)
		r.Get("/agents/{id}/health", h.CheckSingleAgentHealth)

		// PostgreSQL Schema, SQL Query, Explain Plans, Activity & Table Stats
		r.Post("/sql/query", h.ExecuteSQLQuery)
		r.Post("/sql/explain", h.ExecuteSQLExplain)
		r.Get("/database/activity", h.GetDatabaseActivity)
		r.Get("/database/table-stats", h.GetTableStats)

		// LanceDB Vector Search, Status, Grounded Synthesis & OmniGraph Knowledge Network
		r.Post("/vector/search", h.HandleVectorSearch)
		r.Post("/vector/hybrid", h.HandleVectorHybridSearch)
		r.Get("/vector/status", h.HandleVectorStatus)
		r.Post("/vector/synthesize", h.HandleVectorSynthesize)
		r.Get("/vector/graph", h.HandleVectorGraph)

		// Q Designer Subsystem (DES_BASE.quest_*)
		r.Get("/designer/q/surveys", ListQuestSurveysHandler)
		r.Post("/designer/q/surveys", CreateQuestSurveyHandler)
		r.Get("/designer/q/surveys/{id}", GetQuestSurveyHandler)
		r.Put("/designer/q/surveys/{id}", UpdateQuestSurveyHandler)
		r.Delete("/designer/q/surveys/{id}", DeleteQuestSurveyHandler)
		r.Get("/designer/q/question-bank", ListQuestQuestionBankHandler)
		r.Post("/designer/q/question-bank", CreateQuestQuestionBankHandler)
		r.Get("/designer/q/reference-data", ListQuestReferenceDataHandler)
		r.Post("/designer/q/reference-data", CreateQuestReferenceDataHandler)
		r.Get("/designer/q/submissions", ListQuestSubmissionsHandler)
		r.Post("/designer/q/submissions", CreateQuestSubmissionHandler)

		// Schema & OpenAPI Designer Subsystem (DES_BASE.schema_* & openapi_*)
		r.Get("/designer/schemas", ListSchemaRegistriesHandler)
		r.Post("/designer/schemas", CreateSchemaRegistryHandler)
		r.Get("/designer/schemas/{id}", GetSchemaRegistryHandler)
		r.Put("/designer/schemas/{id}", UpdateSchemaRegistryHandler)
		r.Delete("/designer/schemas/{id}", DeleteSchemaRegistryHandler)
		r.Get("/designer/openapi/endpoints", ListOpenAPIEndpointsHandler)
		r.Post("/designer/openapi/endpoints", CreateOpenAPIEndpointHandler)
		r.Put("/designer/openapi/endpoints/{id}", UpdateOpenAPIEndpointHandler)
		r.Delete("/designer/openapi/endpoints/{id}", DeleteOpenAPIEndpointHandler)
	})

	// Static Web Assets Mounting
	RegisterWebStaticRoutes(r, distFS)

	return r
}
