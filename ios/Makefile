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

ARCHIVE = build/Fuori.xcarchive

archive: project    ## Release archive for App Store Connect (registers the bundle id and distribution signing if needed)
	set -o pipefail && xcodebuild -project Fuori.xcodeproj -scheme Fuori -configuration Release -destination 'generic/platform=iOS' -archivePath $(ARCHIVE) -allowProvisioningUpdates archive | xcbeautify --quiet

export: archive     ## Signed .ipa for App Store Connect in build/export (registers the App Store profile)
	xcodebuild -exportArchive -archivePath $(ARCHIVE) -exportPath build/export -exportOptionsPlist ExportOptions.plist -allowProvisioningUpdates

upload: archive     ## Upload a Release build to App Store Connect (TestFlight); bump CURRENT_PROJECT_VERSION in project.yml first
	xcodebuild -exportArchive -archivePath $(ARCHIVE) -exportPath build/upload -exportOptionsPlist UploadOptions.plist -allowProvisioningUpdates

.PHONY: project build test archive export upload
