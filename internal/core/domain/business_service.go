package domain

import (
	"time"
)

// ServiceNature defines internal versus external business services.
type ServiceNature string

const (
	ServiceCustomerFacing ServiceNature = "Customer Facing"
	ServiceInternalShared ServiceNature = "Internal Shared Service"
	ServicePartnerB2B     ServiceNature = "Partner / B2B"
)

// DeliveryChannel represents a channel through which services/products reach customers.
type DeliveryChannel string

const (
	ChannelDigitalWeb    DeliveryChannel = "Web Portal"
	ChannelMobileApp     DeliveryChannel = "Mobile App"
	ChannelPhysicalStore DeliveryChannel = "Physical Store / Branch"
	ChannelAPIOpen       DeliveryChannel = "Open API / Developer"
	ChannelCallCenter    DeliveryChannel = "Customer Contact Center"
	ChannelPartnerNet    DeliveryChannel = "Partner Network"
)

// BusinessService represents an explicitly defined service provided to internal or external customers.
type BusinessService struct {
	ID                    string          `json:"id"`
	WorkspaceID           string          `json:"workspace_id"`
	Code                  string          `json:"code"` // e.g. "BS-PAY-01"
	Name                  string          `json:"name"`
	Description           string          `json:"description"`
	Nature                ServiceNature   `json:"nature"`
	Status                string          `json:"status"` // Active, Beta, Deprecated
	OwnerOrgUnitID        *string         `json:"owner_org_unit_id,omitempty"`
	OwnerRole             string          `json:"owner_role"`
	SLAAvailabilityPct    float64         `json:"sla_availability_pct"` // e.g. 99.9%
	SLAResponseTimeHours  float64         `json:"sla_response_time_hours"`
	SupportedChannels     []DeliveryChannel `json:"supported_channels"`
	TargetCustomerSegments []string       `json:"target_customer_segments"`
	RealizingCapabilityIDs []string       `json:"realizing_capability_ids,omitempty"`
	CreatedAt             time.Time       `json:"created_at"`
	UpdatedAt             time.Time       `json:"updated_at"`
}

// Product represents a marketable package of business services and value propositions.
type Product struct {
	ID               string    `json:"id"`
	WorkspaceID      string    `json:"workspace_id"`
	Code             string    `json:"code"` // e.g. "PROD-PREM-ACC"
	Name             string    `json:"name"`
	Description      string    `json:"description"`
	MarketSegment    string    `json:"market_segment"`
	PricingModel     string    `json:"pricing_model"` // Subscription, Usage, One-time
	LifecycleStage   string    `json:"lifecycle_stage"` // Ideation, Growth, Mature, Sunset
	ProductManager   string    `json:"product_manager"` // Workday Role
	BusinessServiceIDs []string `json:"business_service_ids,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
