package memory

import (
	"context"
	"fmt"
	"sync"
	"time"

	"arch-base-deploy/internal/core/domain"
	"arch-base-deploy/internal/core/ports"
)

type memoryRepository struct {
	mu sync.RWMutex

	workspaces       map[string]domain.Workspace
	capabilities     map[string]map[string]domain.Capability // workspaceID -> id -> item
	valueStreams     map[string]map[string]domain.ValueStream
	processes        map[string]map[string]domain.BusinessProcess
	orgUnits         map[string]map[string]domain.OrgUnit
	businessFunctions map[string]map[string]domain.BusinessFunction
	businessRoles    map[string]map[string]domain.BusinessRole
	businessServices map[string]map[string]domain.BusinessService
	products         map[string]map[string]domain.Product
	drivers          map[string]map[string]domain.StrategicDriver
	goals            map[string]map[string]domain.StrategicGoal
	objectives       map[string]map[string]domain.StrategicObjective
	canvas           map[string]*domain.BusinessModelCanvas
	infoConcepts     map[string]map[string]domain.BusinessInformationConcept
	terms            map[string]map[string]domain.BusinessTerm
	initiatives      map[string]map[string]domain.Initiative
	audits           map[string][]domain.AuditEntry
}

// NewMemoryRepository creates an in-memory repository populated with rich enterprise business architecture seed data.
func NewMemoryRepository() ports.Repository {
	repo := &memoryRepository{
		workspaces:        make(map[string]domain.Workspace),
		capabilities:      make(map[string]map[string]domain.Capability),
		valueStreams:      make(map[string]map[string]domain.ValueStream),
		processes:         make(map[string]map[string]domain.BusinessProcess),
		orgUnits:          make(map[string]map[string]domain.OrgUnit),
		businessFunctions: make(map[string]map[string]domain.BusinessFunction),
		businessRoles:     make(map[string]map[string]domain.BusinessRole),
		businessServices:  make(map[string]map[string]domain.BusinessService),
		products:          make(map[string]map[string]domain.Product),
		drivers:           make(map[string]map[string]domain.StrategicDriver),
		goals:             make(map[string]map[string]domain.StrategicGoal),
		objectives:        make(map[string]map[string]domain.StrategicObjective),
		canvas:            make(map[string]*domain.BusinessModelCanvas),
		infoConcepts:      make(map[string]map[string]domain.BusinessInformationConcept),
		terms:             make(map[string]map[string]domain.BusinessTerm),
		initiatives:       make(map[string]map[string]domain.Initiative),
		audits:            make(map[string][]domain.AuditEntry),
	}
	repo.seedDefaultEnterprise()
	return repo
}

func (r *memoryRepository) ensureWorkspaceMaps(wsID string) {
	if _, ok := r.capabilities[wsID]; !ok {
		r.capabilities[wsID] = make(map[string]domain.Capability)
	}
	if _, ok := r.valueStreams[wsID]; !ok {
		r.valueStreams[wsID] = make(map[string]domain.ValueStream)
	}
	if _, ok := r.processes[wsID]; !ok {
		r.processes[wsID] = make(map[string]domain.BusinessProcess)
	}
	if _, ok := r.orgUnits[wsID]; !ok {
		r.orgUnits[wsID] = make(map[string]domain.OrgUnit)
	}
	if _, ok := r.businessFunctions[wsID]; !ok {
		r.businessFunctions[wsID] = make(map[string]domain.BusinessFunction)
	}
	if _, ok := r.businessRoles[wsID]; !ok {
		r.businessRoles[wsID] = make(map[string]domain.BusinessRole)
	}
	if _, ok := r.businessServices[wsID]; !ok {
		r.businessServices[wsID] = make(map[string]domain.BusinessService)
	}
	if _, ok := r.products[wsID]; !ok {
		r.products[wsID] = make(map[string]domain.Product)
	}
	if _, ok := r.drivers[wsID]; !ok {
		r.drivers[wsID] = make(map[string]domain.StrategicDriver)
	}
	if _, ok := r.goals[wsID]; !ok {
		r.goals[wsID] = make(map[string]domain.StrategicGoal)
	}
	if _, ok := r.objectives[wsID]; !ok {
		r.objectives[wsID] = make(map[string]domain.StrategicObjective)
	}
	if _, ok := r.infoConcepts[wsID]; !ok {
		r.infoConcepts[wsID] = make(map[string]domain.BusinessInformationConcept)
	}
	if _, ok := r.terms[wsID]; !ok {
		r.terms[wsID] = make(map[string]domain.BusinessTerm)
	}
	if _, ok := r.initiatives[wsID]; !ok {
		r.initiatives[wsID] = make(map[string]domain.Initiative)
	}
}

func (r *memoryRepository) ListWorkspaces(ctx context.Context) ([]domain.Workspace, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	list := make([]domain.Workspace, 0, len(r.workspaces))
	for _, w := range r.workspaces {
		list = append(list, w)
	}
	return list, nil
}

func (r *memoryRepository) GetWorkspace(ctx context.Context, id string) (*domain.Workspace, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	w, ok := r.workspaces[id]
	if !ok {
		return nil, fmt.Errorf("%w: workspace not found: %s", domain.ErrNotFound, id)
	}
	return &w, nil
}

func (r *memoryRepository) SaveWorkspace(ctx context.Context, ws *domain.Workspace) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.workspaces[ws.ID] = *ws
	r.ensureWorkspaceMaps(ws.ID)
	return nil
}

// Capabilities
func (r *memoryRepository) ListCapabilities(ctx context.Context, workspaceID string) ([]domain.Capability, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.Capability, 0, len(r.capabilities[workspaceID]))
	for _, c := range r.capabilities[workspaceID] {
		items = append(items, c)
	}
	return items, nil
}

func (r *memoryRepository) GetCapability(ctx context.Context, workspaceID, id string) (*domain.Capability, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	c, ok := r.capabilities[workspaceID][id]
	if !ok {
		return nil, fmt.Errorf("%w: capability not found: %s", domain.ErrNotFound, id)
	}
	return &c, nil
}

func (r *memoryRepository) SaveCapability(ctx context.Context, cap *domain.Capability) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(cap.WorkspaceID)
	if cap.CreatedAt.IsZero() {
		cap.CreatedAt = time.Now()
	}
	cap.UpdatedAt = time.Now()
	r.capabilities[cap.WorkspaceID][cap.ID] = *cap
	return nil
}

func (r *memoryRepository) DeleteCapability(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.capabilities[workspaceID], id)
	return nil
}

// Value Streams
func (r *memoryRepository) ListValueStreams(ctx context.Context, workspaceID string) ([]domain.ValueStream, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.ValueStream, 0, len(r.valueStreams[workspaceID]))
	for _, vs := range r.valueStreams[workspaceID] {
		items = append(items, vs)
	}
	return items, nil
}

func (r *memoryRepository) GetValueStream(ctx context.Context, workspaceID, id string) (*domain.ValueStream, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	vs, ok := r.valueStreams[workspaceID][id]
	if !ok {
		return nil, fmt.Errorf("%w: value stream not found: %s", domain.ErrNotFound, id)
	}
	return &vs, nil
}

func (r *memoryRepository) SaveValueStream(ctx context.Context, vs *domain.ValueStream) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(vs.WorkspaceID)
	if vs.CreatedAt.IsZero() {
		vs.CreatedAt = time.Now()
	}
	vs.UpdatedAt = time.Now()
	r.valueStreams[vs.WorkspaceID][vs.ID] = *vs
	return nil
}

func (r *memoryRepository) DeleteValueStream(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.valueStreams[workspaceID], id)
	return nil
}

// Business Processes
func (r *memoryRepository) ListProcesses(ctx context.Context, workspaceID string) ([]domain.BusinessProcess, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.BusinessProcess, 0, len(r.processes[workspaceID]))
	for _, p := range r.processes[workspaceID] {
		items = append(items, p)
	}
	return items, nil
}

func (r *memoryRepository) GetProcess(ctx context.Context, workspaceID, id string) (*domain.BusinessProcess, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	p, ok := r.processes[workspaceID][id]
	if !ok {
		return nil, fmt.Errorf("%w: process not found: %s", domain.ErrNotFound, id)
	}
	return &p, nil
}

func (r *memoryRepository) SaveProcess(ctx context.Context, proc *domain.BusinessProcess) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(proc.WorkspaceID)
	if proc.CreatedAt.IsZero() {
		proc.CreatedAt = time.Now()
	}
	proc.UpdatedAt = time.Now()
	r.processes[proc.WorkspaceID][proc.ID] = *proc
	return nil
}

func (r *memoryRepository) DeleteProcess(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.processes[workspaceID], id)
	return nil
}

// Organization & Functions
func (r *memoryRepository) ListOrgUnits(ctx context.Context, workspaceID string) ([]domain.OrgUnit, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.OrgUnit, 0, len(r.orgUnits[workspaceID]))
	for _, o := range r.orgUnits[workspaceID] {
		items = append(items, o)
	}
	return items, nil
}

func (r *memoryRepository) GetOrgUnit(ctx context.Context, workspaceID, id string) (*domain.OrgUnit, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	o, ok := r.orgUnits[workspaceID][id]
	if !ok {
		return nil, fmt.Errorf("%w: org unit not found: %s", domain.ErrNotFound, id)
	}
	return &o, nil
}

func (r *memoryRepository) SaveOrgUnit(ctx context.Context, org *domain.OrgUnit) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(org.WorkspaceID)
	if org.CreatedAt.IsZero() {
		org.CreatedAt = time.Now()
	}
	org.UpdatedAt = time.Now()
	r.orgUnits[org.WorkspaceID][org.ID] = *org
	return nil
}

func (r *memoryRepository) DeleteOrgUnit(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.orgUnits[workspaceID], id)
	return nil
}

func (r *memoryRepository) ListBusinessFunctions(ctx context.Context, workspaceID string) ([]domain.BusinessFunction, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.BusinessFunction, 0, len(r.businessFunctions[workspaceID]))
	for _, bf := range r.businessFunctions[workspaceID] {
		items = append(items, bf)
	}
	return items, nil
}

func (r *memoryRepository) GetBusinessFunction(ctx context.Context, workspaceID, id string) (*domain.BusinessFunction, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	bf, ok := r.businessFunctions[workspaceID][id]
	if !ok {
		return nil, fmt.Errorf("%w: business function not found: %s", domain.ErrNotFound, id)
	}
	return &bf, nil
}

func (r *memoryRepository) SaveBusinessFunction(ctx context.Context, bf *domain.BusinessFunction) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(bf.WorkspaceID)
	if bf.CreatedAt.IsZero() {
		bf.CreatedAt = time.Now()
	}
	bf.UpdatedAt = time.Now()
	r.businessFunctions[bf.WorkspaceID][bf.ID] = *bf
	return nil
}

func (r *memoryRepository) DeleteBusinessFunction(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.businessFunctions[workspaceID], id)
	return nil
}

func (r *memoryRepository) ListBusinessRoles(ctx context.Context, workspaceID string) ([]domain.BusinessRole, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.BusinessRole, 0, len(r.businessRoles[workspaceID]))
	for _, br := range r.businessRoles[workspaceID] {
		items = append(items, br)
	}
	return items, nil
}

func (r *memoryRepository) GetBusinessRole(ctx context.Context, workspaceID, id string) (*domain.BusinessRole, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	br, ok := r.businessRoles[workspaceID][id]
	if !ok {
		return nil, fmt.Errorf("%w: business role not found: %s", domain.ErrNotFound, id)
	}
	return &br, nil
}

func (r *memoryRepository) SaveBusinessRole(ctx context.Context, role *domain.BusinessRole) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(role.WorkspaceID)
	if role.CreatedAt.IsZero() {
		role.CreatedAt = time.Now()
	}
	role.UpdatedAt = time.Now()
	r.businessRoles[role.WorkspaceID][role.ID] = *role
	return nil
}

func (r *memoryRepository) DeleteBusinessRole(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.businessRoles[workspaceID], id)
	return nil
}

// Business Services & Products
func (r *memoryRepository) ListBusinessServices(ctx context.Context, workspaceID string) ([]domain.BusinessService, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.BusinessService, 0, len(r.businessServices[workspaceID]))
	for _, bs := range r.businessServices[workspaceID] {
		items = append(items, bs)
	}
	return items, nil
}

func (r *memoryRepository) GetBusinessService(ctx context.Context, workspaceID, id string) (*domain.BusinessService, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	bs, ok := r.businessServices[workspaceID][id]
	if !ok {
		return nil, fmt.Errorf("%w: business service not found: %s", domain.ErrNotFound, id)
	}
	return &bs, nil
}

func (r *memoryRepository) SaveBusinessService(ctx context.Context, svc *domain.BusinessService) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(svc.WorkspaceID)
	if svc.CreatedAt.IsZero() {
		svc.CreatedAt = time.Now()
	}
	svc.UpdatedAt = time.Now()
	r.businessServices[svc.WorkspaceID][svc.ID] = *svc
	return nil
}

func (r *memoryRepository) DeleteBusinessService(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.businessServices[workspaceID], id)
	return nil
}

func (r *memoryRepository) ListProducts(ctx context.Context, workspaceID string) ([]domain.Product, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.Product, 0, len(r.products[workspaceID]))
	for _, p := range r.products[workspaceID] {
		items = append(items, p)
	}
	return items, nil
}

func (r *memoryRepository) GetProduct(ctx context.Context, workspaceID, id string) (*domain.Product, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	p, ok := r.products[workspaceID][id]
	if !ok {
		return nil, fmt.Errorf("%w: product not found: %s", domain.ErrNotFound, id)
	}
	return &p, nil
}

func (r *memoryRepository) SaveProduct(ctx context.Context, prod *domain.Product) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(prod.WorkspaceID)
	if prod.CreatedAt.IsZero() {
		prod.CreatedAt = time.Now()
	}
	prod.UpdatedAt = time.Now()
	r.products[prod.WorkspaceID][prod.ID] = *prod
	return nil
}

func (r *memoryRepository) DeleteProduct(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.products[workspaceID], id)
	return nil
}

// Strategy & OKRs
func (r *memoryRepository) ListStrategicDrivers(ctx context.Context, workspaceID string) ([]domain.StrategicDriver, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.StrategicDriver, 0, len(r.drivers[workspaceID]))
	for _, d := range r.drivers[workspaceID] {
		items = append(items, d)
	}
	return items, nil
}

func (r *memoryRepository) SaveStrategicDriver(ctx context.Context, drv *domain.StrategicDriver) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(drv.WorkspaceID)
	if drv.CreatedAt.IsZero() {
		drv.CreatedAt = time.Now()
	}
	drv.UpdatedAt = time.Now()
	r.drivers[drv.WorkspaceID][drv.ID] = *drv
	return nil
}

func (r *memoryRepository) DeleteStrategicDriver(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.drivers[workspaceID], id)
	return nil
}

func (r *memoryRepository) ListStrategicGoals(ctx context.Context, workspaceID string) ([]domain.StrategicGoal, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.StrategicGoal, 0, len(r.goals[workspaceID]))
	for _, g := range r.goals[workspaceID] {
		items = append(items, g)
	}
	return items, nil
}

func (r *memoryRepository) SaveStrategicGoal(ctx context.Context, goal *domain.StrategicGoal) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(goal.WorkspaceID)
	if goal.CreatedAt.IsZero() {
		goal.CreatedAt = time.Now()
	}
	goal.UpdatedAt = time.Now()
	r.goals[goal.WorkspaceID][goal.ID] = *goal
	return nil
}

func (r *memoryRepository) DeleteStrategicGoal(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.goals[workspaceID], id)
	return nil
}

func (r *memoryRepository) ListStrategicObjectives(ctx context.Context, workspaceID string) ([]domain.StrategicObjective, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.StrategicObjective, 0, len(r.objectives[workspaceID]))
	for _, o := range r.objectives[workspaceID] {
		items = append(items, o)
	}
	return items, nil
}

func (r *memoryRepository) SaveStrategicObjective(ctx context.Context, obj *domain.StrategicObjective) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(obj.WorkspaceID)
	if obj.CreatedAt.IsZero() {
		obj.CreatedAt = time.Now()
	}
	obj.UpdatedAt = time.Now()
	r.objectives[obj.WorkspaceID][obj.ID] = *obj
	return nil
}

func (r *memoryRepository) DeleteStrategicObjective(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.objectives[workspaceID], id)
	return nil
}

func (r *memoryRepository) GetBusinessModelCanvas(ctx context.Context, workspaceID string) (*domain.BusinessModelCanvas, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	bmc, ok := r.canvas[workspaceID]
	if !ok {
		return nil, fmt.Errorf("%w: business model canvas not found for workspace: %s", domain.ErrNotFound, workspaceID)
	}
	return bmc, nil
}

func (r *memoryRepository) SaveBusinessModelCanvas(ctx context.Context, bmc *domain.BusinessModelCanvas) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if bmc.CreatedAt.IsZero() {
		bmc.CreatedAt = time.Now()
	}
	bmc.UpdatedAt = time.Now()
	r.canvas[bmc.WorkspaceID] = bmc
	return nil
}

// Information Concepts & Glossary
func (r *memoryRepository) ListInformationConcepts(ctx context.Context, workspaceID string) ([]domain.BusinessInformationConcept, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.BusinessInformationConcept, 0, len(r.infoConcepts[workspaceID]))
	for _, ic := range r.infoConcepts[workspaceID] {
		items = append(items, ic)
	}
	return items, nil
}

func (r *memoryRepository) GetInformationConcept(ctx context.Context, workspaceID, id string) (*domain.BusinessInformationConcept, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	ic, ok := r.infoConcepts[workspaceID][id]
	if !ok {
		return nil, fmt.Errorf("%w: information concept not found: %s", domain.ErrNotFound, id)
	}
	return &ic, nil
}

func (r *memoryRepository) SaveInformationConcept(ctx context.Context, bic *domain.BusinessInformationConcept) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(bic.WorkspaceID)
	if bic.CreatedAt.IsZero() {
		bic.CreatedAt = time.Now()
	}
	bic.UpdatedAt = time.Now()
	r.infoConcepts[bic.WorkspaceID][bic.ID] = *bic
	return nil
}

func (r *memoryRepository) DeleteInformationConcept(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.infoConcepts[workspaceID], id)
	return nil
}

func (r *memoryRepository) ListBusinessTerms(ctx context.Context, workspaceID string) ([]domain.BusinessTerm, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.BusinessTerm, 0, len(r.terms[workspaceID]))
	for _, t := range r.terms[workspaceID] {
		items = append(items, t)
	}
	return items, nil
}

func (r *memoryRepository) SaveBusinessTerm(ctx context.Context, term *domain.BusinessTerm) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(term.WorkspaceID)
	if term.CreatedAt.IsZero() {
		term.CreatedAt = time.Now()
	}
	term.UpdatedAt = time.Now()
	r.terms[term.WorkspaceID][term.ID] = *term
	return nil
}

func (r *memoryRepository) DeleteBusinessTerm(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.terms[workspaceID], id)
	return nil
}

// Initiatives
func (r *memoryRepository) ListInitiatives(ctx context.Context, workspaceID string) ([]domain.Initiative, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	items := make([]domain.Initiative, 0, len(r.initiatives[workspaceID]))
	for _, i := range r.initiatives[workspaceID] {
		items = append(items, i)
	}
	return items, nil
}

func (r *memoryRepository) GetInitiative(ctx context.Context, workspaceID, id string) (*domain.Initiative, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	r.ensureWorkspaceMaps(workspaceID)
	i, ok := r.initiatives[workspaceID][id]
	if !ok {
		return nil, fmt.Errorf("%w: initiative not found: %s", domain.ErrNotFound, id)
	}
	return &i, nil
}

func (r *memoryRepository) SaveInitiative(ctx context.Context, init *domain.Initiative) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(init.WorkspaceID)
	if init.CreatedAt.IsZero() {
		init.CreatedAt = time.Now()
	}
	init.UpdatedAt = time.Now()
	r.initiatives[init.WorkspaceID][init.ID] = *init
	return nil
}

func (r *memoryRepository) DeleteInitiative(ctx context.Context, workspaceID, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ensureWorkspaceMaps(workspaceID)
	delete(r.initiatives[workspaceID], id)
	return nil
}

func (r *memoryRepository) RecordAudit(ctx context.Context, entry *domain.AuditEntry) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if entry.Timestamp.IsZero() {
		entry.Timestamp = time.Now()
	}
	r.audits[entry.WorkspaceID] = append([]domain.AuditEntry{*entry}, r.audits[entry.WorkspaceID]...)
	return nil
}

func (r *memoryRepository) ListAuditLogs(ctx context.Context, workspaceID string, limit int) ([]domain.AuditEntry, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	list := r.audits[workspaceID]
	if limit > 0 && len(list) > limit {
		return list[:limit], nil
	}
	return list, nil
}

func (r *memoryRepository) ListSchemas(ctx context.Context) ([]domain.SchemaInfo, error) {
	return []domain.SchemaInfo{
		{Name: "BT_BASE", Description: "Primary Canonical Architecture Metamodel Schema", TablesCount: 30, Status: "Active", IsActive: true},
		{Name: "BA_BASE", Description: "Business Artist Authoritative Metamodel & Requirements Schema", TablesCount: 30, Status: "Active", IsActive: true},
		{Name: "public", Description: "Standard PostgreSQL Public Schema", TablesCount: 0, Status: "Active", IsActive: false},
		{Name: "admin", Description: "Identity, Access Governance & SSO Schema", TablesCount: 5, Status: "Active", IsActive: false},
	}, nil
}
