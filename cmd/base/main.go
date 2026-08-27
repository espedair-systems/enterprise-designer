package main

import (
	"arch-base-deploy/internal/adapters/inbound/cli"
	"arch-base-deploy/web"
)

func main() {
	dist := web.DistFS()
	cli.Execute(dist)
}
