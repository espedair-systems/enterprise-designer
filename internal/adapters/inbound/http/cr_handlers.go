package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type CreateCRRequest struct {
	Title       string `json:"title"`
	Content     string `json:"content"`
	Description string `json:"description,omitempty"`
	ViewID      string `json:"view_id,omitempty"`
	AppName     string `json:"app_name,omitempty"`
}

type CreateCRResponse struct {
	Message  string `json:"message"`
	Filename string `json:"filename"`
	FilePath string `json:"file_path"`
	Index    int    `json:"index"`
}

type CRSummary struct {
	Filename    string    `json:"filename"`
	FilePath    string    `json:"file_path"`
	Index       int       `json:"index"`
	Title       string    `json:"title"`
	ModTime     time.Time `json:"mod_time"`
	SizeBytes   int64     `json:"size_bytes"`
	PreviewText string    `json:"preview_text,omitempty"`
}

var crNumberRegex = regexp.MustCompile(`^.*-(\d+)\.md$`)

// getCRDirectory returns the configured directory for storing Change Requests.
func (h *Handler) getCRDirectory() (string, string, int) {
	dir := ".design/CR"
	prefix := "cr-"
	digits := 4

	if h.cfg != nil {
		if h.cfg.CR.Path != "" {
			dir = h.cfg.CR.Path
		}
		if h.cfg.CR.Prefix != "" {
			prefix = h.cfg.CR.Prefix
		}
		if h.cfg.CR.Digits > 0 {
			digits = h.cfg.CR.Digits
		}
	}
	return dir, prefix, digits
}

// CreateChangeRequest generates a new sequentially numbered cr-000x.md file in the configured CR folder.
func (h *Handler) CreateChangeRequest(w http.ResponseWriter, r *http.Request) {
	var req CreateCRRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request payload: " + err.Error()})
		return
	}

	crDir, prefix, digits := h.getCRDirectory()

	// Ensure destination directory exists
	if err := os.MkdirAll(crDir, 0755); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create CR directory: " + err.Error()})
		return
	}

	// Scan directory for existing CR files and determine next sequence index
	entries, err := os.ReadDir(crDir)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to read CR directory: " + err.Error()})
		return
	}

	maxIndex := 0
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		matches := crNumberRegex.FindStringSubmatch(name)
		if len(matches) == 2 {
			if num, parseErr := strconv.Atoi(matches[1]); parseErr == nil {
				if num > maxIndex {
					maxIndex = num
				}
			}
		}
	}

	nextIndex := maxIndex + 1

	// Format filename with padded digits (e.g. cr-0001.md)
	formatStr := fmt.Sprintf("%%s%%0%dd.md", digits)
	filename := fmt.Sprintf(formatStr, prefix, nextIndex)
	fullPath := filepath.Join(crDir, filename)

	// Format CR Document Content
	title := req.Title
	if strings.TrimSpace(title) == "" {
		title = "UI Change Request"
	}

	timestamp := time.Now().Format(time.RFC3339)
	desc := req.Description
	if strings.TrimSpace(desc) == "" {
		desc = "[Please describe your requested changes, enhancements, or bug report here]"
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("# Change Request: %s\n\n", title))
	sb.WriteString(fmt.Sprintf("- **CR ID**: `%s%0*d`\n", prefix, digits, nextIndex))
	sb.WriteString(fmt.Sprintf("- **File**: `%s`\n", filename))
	sb.WriteString(fmt.Sprintf("- **Created At**: %s\n", timestamp))
	sb.WriteString(fmt.Sprintf("- **Application**: Enterprise Designer (`enterprise-designer`)\n"))
	sb.WriteString(fmt.Sprintf("- **Authoritative Database**: PostgreSQL `DES_BASE` (Port 8088)\n"))
	if req.ViewID != "" {
		sb.WriteString(fmt.Sprintf("- **Active View / Canvas ID**: `%s`\n", req.ViewID))
	}
	if req.AppName != "" {
		sb.WriteString(fmt.Sprintf("- **Active Project**: %s\n", req.AppName))
	}
	sb.WriteString("\n---\n\n")

	sb.WriteString("## UI Location Reference\n\n")
	if strings.TrimSpace(req.Content) != "" {
		sb.WriteString(req.Content)
		sb.WriteString("\n\n")
	} else {
		sb.WriteString("*(No location snippet provided)*\n\n")
	}

	sb.WriteString("---\n\n")
	sb.WriteString("## Requested Changes & Specification\n\n")
	sb.WriteString(desc)
	sb.WriteString("\n")

	if err := os.WriteFile(fullPath, []byte(sb.String()), 0644); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to write CR file: " + err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, CreateCRResponse{
		Message:  fmt.Sprintf("Change Request %s created successfully in %s", filename, crDir),
		Filename: filename,
		FilePath: fullPath,
		Index:    nextIndex,
	})
}

// ListChangeRequests returns all existing CR markdown files found in the configured CR folder.
func (h *Handler) ListChangeRequests(w http.ResponseWriter, r *http.Request) {
	crDir, _, _ := h.getCRDirectory()

	if _, err := os.Stat(crDir); os.IsNotExist(err) {
		writeJSON(w, http.StatusOK, map[string]any{"data": []CRSummary{}, "cr_dir": crDir})
		return
	}

	entries, err := os.ReadDir(crDir)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to read CR directory: " + err.Error()})
		return
	}

	var results []CRSummary
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".md") {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}

		index := 0
		matches := crNumberRegex.FindStringSubmatch(entry.Name())
		if len(matches) == 2 {
			index, _ = strconv.Atoi(matches[1])
		}

		results = append(results, CRSummary{
			Filename:  entry.Name(),
			FilePath:  filepath.Join(crDir, entry.Name()),
			Index:     index,
			Title:     strings.TrimSuffix(entry.Name(), ".md"),
			ModTime:   info.ModTime(),
			SizeBytes: info.Size(),
		})
	}

	writeJSON(w, http.StatusOK, map[string]any{"data": results, "cr_dir": crDir, "count": len(results)})
}
