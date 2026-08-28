package domain

import "time"

// SchemaRegistryItem represents a JSON Schema or OpenAPI specification registered in DES_BASE.schema_registries.
type SchemaRegistryItem struct {
	ID             string                 `json:"id"`
	AppID          string                 `json:"app_id"`
	Title          string                 `json:"title"`
	Slug           string                 `json:"slug"`
	SchemaType     string                 `json:"schema_type"` // 'json_schema' | 'openapi_spec'
	Dialect        string                 `json:"dialect"`     // 'draft-2020-12' | 'draft-07' | 'openapi-3.1'
	Version        string                 `json:"version"`
	Description    string                 `json:"description"`
	Status         string                 `json:"status"` // 'draft' | 'published' | 'deprecated'
	RawPayloadJSON map[string]interface{} `json:"raw_payload_json,omitempty"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
}

// SchemaPropertyNode represents an interactive node in the Visual Property Tree.
type SchemaPropertyNode struct {
	ID          string                 `json:"id"`
	Key         string                 `json:"key"`
	Title       string                 `json:"title,omitempty"`
	Type        string                 `json:"type"` // 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null' | '$ref'
	Format      string                 `json:"format,omitempty"` // 'uuid' | 'date-time' | 'email' | 'uri'
	Required    bool                   `json:"required"`
	Description string                 `json:"description,omitempty"`
	RefTarget   string                 `json:"ref_target,omitempty"`
	EnumValues  []string               `json:"enum_values,omitempty"`
	Children    []SchemaPropertyNode   `json:"children,omitempty"`
	ItemSchema  *SchemaPropertyNode    `json:"item_schema,omitempty"`
	Constraints map[string]interface{} `json:"constraints,omitempty"` // minLength, maxLength, minimum, maximum, pattern
}

// OpenAPIEndpoint represents an HTTP operation route stored in DES_BASE.openapi_endpoints.
type OpenAPIEndpoint struct {
	ID             string                 `json:"id"`
	SchemaID       string                 `json:"schema_id"`
	Path           string                 `json:"path"`
	Method         string                 `json:"method"` // 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
	OperationID    string                 `json:"operation_id"`
	Summary        string                 `json:"summary"`
	Description    string                 `json:"description"`
	Tags           []string               `json:"tags"`
	Parameters     []OpenAPIParameter     `json:"parameters,omitempty"`
	RequestBody    map[string]interface{} `json:"request_body,omitempty"`
	Responses      map[string]interface{} `json:"responses,omitempty"`
	Security       []string               `json:"security,omitempty"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
}

// OpenAPIParameter defines a path, query, header, or cookie parameter.
type OpenAPIParameter struct {
	Name        string `json:"name"`
	In          string `json:"in"` // 'path' | 'query' | 'header' | 'cookie'
	Required    bool   `json:"required"`
	Description string `json:"description,omitempty"`
	SchemaType  string `json:"schema_type"`
}

// SchemaComponent represents a reusable definition stored in DES_BASE.schema_components.
type SchemaComponent struct {
	ID             string                 `json:"id"`
	SchemaID       string                 `json:"schema_id"`
	Name           string                 `json:"name"`
	ComponentType  string                 `json:"component_type"` // 'schema' | 'response' | 'parameter' | 'security'
	DefinitionJSON map[string]interface{} `json:"definition_json"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
}
