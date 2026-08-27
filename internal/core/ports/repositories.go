package ports

import (
	"context"

	"arch-base-deploy/internal/core/domain"
)

// Repository aggregates all business architecture data access interfaces.
type Repository interface {
	// Capabilities
	ListCapabilities(ctx context.Context, workspaceID string) ([]domain.Capability, error)
	GetCapability(ctx context.Context, workspaceID, id string) (*domain.Capability, error)
	SaveCapability(ctx context.Context, cap *domain.Capability) error
	DeleteCapability(ctx context.Context, workspaceID, id string) error

	// Value Streams
	ListValueStreams(ctx context.Context, workspaceID string) ([]domain.ValueStream, error)
	GetValueStream(ctx context.Context, workspaceID, id string) (*domain.ValueStream, error)
	SaveValueStream(ctx context.Context, vs *domain.ValueStream) error
	DeleteValueStream(ctx context.Context, workspaceID, id string) error

	// Business Processes
	ListProcesses(ctx context.Context, workspaceID string) ([]domain.BusinessProcess, error)
	GetProcess(ctx context.Context, workspaceID, id string) (*domain.BusinessProcess, error)
	SaveProcess(ctx context.Context, proc *domain.BusinessProcess) error
	DeleteProcess(ctx context.Context, workspaceID, id string) error

	// Organization & Functions
	ListOrgUnits(ctx context.Context, workspaceID string) ([]domain.OrgUnit, error)
	GetOrgUnit(ctx context.Context, workspaceID, id string) (*domain.OrgUnit, error)
	SaveOrgUnit(ctx context.Context, org *domain.OrgUnit) error
	DeleteOrgUnit(ctx context.Context, workspaceID, id string) error

	ListBusinessFunctions(ctx context.Context, workspaceID string) ([]domain.BusinessFunction, error)
	GetBusinessFunction(ctx context.Context, workspaceID, id string) (*domain.BusinessFunction, error)
	SaveBusinessFunction(ctx context.Context, bf *domain.BusinessFunction) error
	DeleteBusinessFunction(ctx context.Context, workspaceID, id string) error

	ListBusinessRoles(ctx context.Context, workspaceID string) ([]domain.BusinessRole, error)
	GetBusinessRole(ctx context.Context, workspaceID, id string) (*domain.BusinessRole, error)
	SaveBusinessRole(ctx context.Context, role *domain.BusinessRole) error
	DeleteBusinessRole(ctx context.Context, workspaceID, id string) error

	// Business Services & Products
	ListBusinessServices(ctx context.Context, workspaceID string) ([]domain.BusinessService, error)
	GetBusinessService(ctx context.Context, workspaceID, id string) (*domain.BusinessService, error)
	SaveBusinessService(ctx context.Context, svc *domain.BusinessService) error
	DeleteBusinessService(ctx context.Context, workspaceID, id string) error

	ListProducts(ctx context.Context, workspaceID string) ([]domain.Product, error)
	GetProduct(ctx context.Context, workspaceID, id string) (*domain.Product, error)
	SaveProduct(ctx context.Context, prod *domain.Product) error
	DeleteProduct(ctx context.Context, workspaceID, id string) error

	// Strategy & OKRs
	ListStrategicDrivers(ctx context.Context, workspaceID string) ([]domain.StrategicDriver, error)
	SaveStrategicDriver(ctx context.Context, drv *domain.StrategicDriver) error
	DeleteStrategicDriver(ctx context.Context, workspaceID, id string) error

	ListStrategicGoals(ctx context.Context, workspaceID string) ([]domain.StrategicGoal, error)
	SaveStrategicGoal(ctx context.Context, goal *domain.StrategicGoal) error
	DeleteStrategicGoal(ctx context.Context, workspaceID, id string) error

	ListStrategicObjectives(ctx context.Context, workspaceID string) ([]domain.StrategicObjective, error)
	SaveStrategicObjective(ctx context.Context, obj *domain.StrategicObjective) error
	DeleteStrategicObjective(ctx context.Context, workspaceID, id string) error

	GetBusinessModelCanvas(ctx context.Context, workspaceID string) (*domain.BusinessModelCanvas, error)
	SaveBusinessModelCanvas(ctx context.Context, bmc *domain.BusinessModelCanvas) error

	// Information Concepts & Glossary
	ListInformationConcepts(ctx context.Context, workspaceID string) ([]domain.BusinessInformationConcept, error)
	GetInformationConcept(ctx context.Context, workspaceID, id string) (*domain.BusinessInformationConcept, error)
	SaveInformationConcept(ctx context.Context, bic *domain.BusinessInformationConcept) error
	DeleteInformationConcept(ctx context.Context, workspaceID, id string) error

	ListBusinessTerms(ctx context.Context, workspaceID string) ([]domain.BusinessTerm, error)
	SaveBusinessTerm(ctx context.Context, term *domain.BusinessTerm) error
	DeleteBusinessTerm(ctx context.Context, workspaceID, id string) error

	// Initiatives & Roadmap
	ListInitiatives(ctx context.Context, workspaceID string) ([]domain.Initiative, error)
	GetInitiative(ctx context.Context, workspaceID, id string) (*domain.Initiative, error)
	SaveInitiative(ctx context.Context, init *domain.Initiative) error
	DeleteInitiative(ctx context.Context, workspaceID, id string) error

	// Workspaces & Auditing
	ListWorkspaces(ctx context.Context) ([]domain.Workspace, error)
	GetWorkspace(ctx context.Context, id string) (*domain.Workspace, error)
	SaveWorkspace(ctx context.Context, ws *domain.Workspace) error
	RecordAudit(ctx context.Context, entry *domain.AuditEntry) error
	ListAuditLogs(ctx context.Context, workspaceID string, limit int) ([]domain.AuditEntry, error)
	ListSchemas(ctx context.Context) ([]domain.SchemaInfo, error)
}
