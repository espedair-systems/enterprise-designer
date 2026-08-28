package domain

import "time"

// QuestSurvey represents an enterprise survey / questionnaire definition stored in DES_BASE.quest_surveys.
type QuestSurvey struct {
	ID          string          `json:"id"`
	AppID       string          `json:"app_id"`
	Title       string          `json:"title"`
	Slug        string          `json:"slug"`
	Description string          `json:"description"`
	Status      string          `json:"status"` // 'draft' | 'published' | 'archived'
	Version     string          `json:"version"`
	Sections    []QuestSection  `json:"sections,omitempty"`
	Settings    QuestSettings   `json:"settings"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

// QuestSection groups questions with logical layout and branching.
type QuestSection struct {
	ID          string          `json:"id"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	SortOrder   int             `json:"sort_order"`
	Questions   []QuestQuestion `json:"questions"`
}

// QuestQuestion represents an individual question in DES_BASE.quest_questions.
type QuestQuestion struct {
	ID           string                 `json:"id"`
	SurveyID     string                 `json:"survey_id"`
	SectionID    string                 `json:"section_id,omitempty"`
	Code         string                 `json:"code"` // e.g. Q-001
	Text         string                 `json:"text"`
	QuestionType string                 `json:"question_type"` // text, textarea, single_choice, multiple_choice, rating, date, file_upload
	Required     bool                   `json:"required"`
	Options      []QuestOption          `json:"options,omitempty"`
	Validation   map[string]interface{} `json:"validation,omitempty"`
	LogicRules   []QuestLogicRule       `json:"logic_rules,omitempty"`
	HelpText     string                 `json:"help_text,omitempty"`
	SortOrder    int                    `json:"sort_order"`
}

// QuestOption represents a choice in single/multi choice questions.
type QuestOption struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Value string `json:"value"`
	Score int    `json:"score,omitempty"`
}

// QuestLogicRule defines conditional branching jumps.
type QuestLogicRule struct {
	Condition string `json:"condition"` // equals, not_equals, greater_than
	Value     string `json:"value"`
	Action    string `json:"action"` // jump_to_section, show_question, hide_question
	TargetID  string `json:"target_id"`
}

// QuestSettings holds survey presentation constraints.
type QuestSettings struct {
	AllowAnonymous bool   `json:"allow_anonymous"`
	RequireAuth    bool   `json:"require_auth"`
	ShowProgressBar bool  `json:"show_progress_bar"`
	ThemeColor     string `json:"theme_color"`
}

// QuestQuestionBankItem represents a reusable enterprise question in DES_BASE.quest_question_bank.
type QuestQuestionBankItem struct {
	ID           string        `json:"id"`
	Code         string        `json:"code"`
	Title        string        `json:"title"`
	Text         string        `json:"text"`
	Category     string        `json:"category"` // Demographics, Feedback, Safety Audit, Telematics
	QuestionType string        `json:"question_type"`
	DefaultOptions []QuestOption `json:"default_options,omitempty"`
	Tags         []string      `json:"tags,omitempty"`
	CreatedAt    time.Time     `json:"created_at"`
}

// QuestReferenceDataset represents a choice lookup dataset in DES_BASE.quest_reference_data.
type QuestReferenceDataset struct {
	ID          string        `json:"id"`
	ListKey     string        `json:"list_key"`
	ListName    string        `json:"list_name"`
	Description string        `json:"description"`
	Items       []QuestOption `json:"items"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

// QuestSubmission represents an audit submission record in DES_BASE.quest_submissions.
type QuestSubmission struct {
	ID           string                 `json:"id"`
	SurveyID     string                 `json:"survey_id"`
	RespondentID string                 `json:"respondent_id"`
	Status       string                 `json:"status"` // completed, partial
	Score        float64                `json:"score,omitempty"`
	Answers      map[string]interface{} `json:"answers"`
	SubmittedAt  time.Time              `json:"submitted_at"`
}
