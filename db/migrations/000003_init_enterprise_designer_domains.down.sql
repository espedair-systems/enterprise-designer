-- ============================================================================
-- Migration 000003 Down: Drop Enterprise Designer Domain Models & Metamodels
-- Authoritative Schema Namespace: DES_BASE (PostgreSQL 16+)
-- ============================================================================

DROP TABLE IF EXISTS cr_requests CASCADE;
DROP TABLE IF EXISTS usecase_models CASCADE;
DROP TABLE IF EXISTS openapi_endpoints CASCADE;
DROP TABLE IF EXISTS schema_registries CASCADE;
DROP TABLE IF EXISTS quest_submissions CASCADE;
DROP TABLE IF EXISTS quest_reference_data CASCADE;
DROP TABLE IF EXISTS quest_question_bank CASCADE;
DROP TABLE IF EXISTS quest_surveys CASCADE;
