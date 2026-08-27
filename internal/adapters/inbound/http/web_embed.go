package http

import (
	"io"
	"io/fs"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

// RegisterWebStaticRoutes mounts the embedded web distribution assets with SPA fallback.
func RegisterWebStaticRoutes(r chi.Router, distFS fs.FS) {
	if distFS == nil {
		r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "text/html")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`<!DOCTYPE html><html><head><title>Base Artist</title></head><body style="background:#0b0f17;color:#fff;font-family:sans-serif;padding:40px;"><h1>Base Artist REST API Server</h1><p>API is active on <code>/api/v1/</code>.</p></body></html>`))
		})
		return
	}

	fileServer := http.FileServer(http.FS(distFS))

	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" {
			path = "index.html"
		}

		f, err := distFS.Open(path)
		if err != nil {
			// SPA fallback: serve index.html for unknown HTML paths
			indexFile, err := distFS.Open("index.html")
			if err != nil {
				http.NotFound(w, r)
				return
			}
			defer indexFile.Close()
			stat, _ := indexFile.Stat()
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			if seeker, ok := indexFile.(io.ReadSeeker); ok {
				http.ServeContent(w, r, "index.html", stat.ModTime(), seeker)
			} else {
				data, _ := io.ReadAll(indexFile)
				_, _ = w.Write(data)
			}
			return
		}
		defer f.Close()

		fileServer.ServeHTTP(w, r)
	})
}
