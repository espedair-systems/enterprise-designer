package domain

import "errors"

// Standard Domain Sentinel Errors
var (
	// ErrNotFound is returned when a requested resource does not exist.
	ErrNotFound = errors.New("resource not found")

	// ErrInvalidInput is returned when entity validation fails.
	ErrInvalidInput = errors.New("invalid input validation")

	// ErrConflict is returned on duplicate keys or conflicting state.
	ErrConflict = errors.New("resource conflict or duplicate identifier")

	// ErrUnauthorized indicates missing or invalid permissions.
	ErrUnauthorized = errors.New("unauthorized operation")
)
