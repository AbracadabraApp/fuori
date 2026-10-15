# Fuori iPhone app. The Xcode project is generated from project.yml.
SIM ?= iPhone 17 Pro
DEST = platform=iOS Simulator,name=$(SIM)

project:            ## Generate Fuori.xcodeproj from project.yml
	xcodegen generate --quiet

build: project      ## Build for the simulator
	set -o pipefail && xcodebuild -project Fuori.xcodeproj -scheme Fuori -destination '$(DEST)' build | xcbeautify --quiet

test: project       ## Package tests (fast, no simulator) and the scheme's tests
	cd FuoriKit && swift test
	set -o pipefail && xcodebuild -project Fuori.xcodeproj -scheme Fuori -destination '$(DEST)' test | xcbeautify --quiet

.PHONY: project build test
