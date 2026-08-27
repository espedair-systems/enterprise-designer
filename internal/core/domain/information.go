package domain

import (
	"time"
)

// ConceptClassification categorizes data concepts from a business perspective.
type ConceptClassification string

const (
	ClassificationMasterData      ConceptClassification = "Master Data Concept"
	ClassificationTransactional   ConceptClassification = "Transactional Concept"
	ClassificationReferenceData   ConceptClassification = "Reference Data"
	ClassificationAnalytical      ConceptClassification = "Analytical / Aggregate"
)

// ConceptAttribute represents a core business attribute belonging to an information concept.
type ConceptAttribute struct {
	Name        string `json:"name"`
	Type        string `json:"type"` // Text, Number, Date, Currency, Identifier
	Description string `json:"description"`
	IsPII       bool   `json:"is_pii"`
	IsKey       bool   `json:"is_key"`
}

// BusinessInformationConcept represents a high-level conceptual business data entity (e.g. Customer, Account, Invoice, Policy).
type BusinessInformationConcept struct {
	ID                    string                `json:"id"`
	WorkspaceID           string                `json:"workspace_id"`
	Code                  string                `json:"code"` // e.g. "BIC-CUST"
	Name                  string                `json:"name"`
	Description           string                `json:"description"`
	Classification        ConceptClassification `json:"classification"`
	DomainOwnerRole       string                `json:"domain_owner_role"` // Workday Business Steward
	AuthoritativeSource   string                `json:"authoritative_source"` // System of Record
	RelatedCapabilityIDs  []string              `json:"related_capability_ids,omitempty"`
	Attributes            []ConceptAttribute    `json:"attributes,omitempty"`
	ParentConceptID       *string               `json:"parent_concept_id,omitempty"`
	Tags                  []string              `json:"tags,omitempty"`
	CreatedAt             time.Time             `json:"created_at"`
	UpdatedAt             time.Time             `json:"updated_at"`
}

// BusinessTerm represents an entry in the authoritative Business Glossary.
type BusinessTerm struct {
	ID             string    `json:"id"`
	WorkspaceID    string    `json:"workspace_id"`
	Term           string    `json:"term"`
	Definition     string    `json:"definition"`
	Acronym        string    `json:"acronym,omitempty"`
	DomainCategory string    `json:"domain_category"` // Finance, Operations, Sales, HR
	Steward        string    `json:"steward"`         // Workday Role
	Synonyms       []string  `json:"synonyms,omitempty"`
	ConceptID      *string   `json:"concept_id,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
