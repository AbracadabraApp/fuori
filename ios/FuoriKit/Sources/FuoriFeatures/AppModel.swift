import Foundation
import Observation
import FuoriCore
import FuoriNetworking
#if canImport(UIKit)
import UIKit
#endif

/// The app's state: which country (which server) the learner lives in, that
/// country's content and the learner's visits. One per app; screens read it
/// from the environment.
///
/// Each country is its own server with its own learner (one Keychain token
/// per server host), so switching country switches server: progress and the
/// people met stay with each country (docs/onboarding-design.md → Ship first).
@MainActor
@Observable
public final class AppModel {
    public enum Phase: Equatable {
        /// First launch: no country chosen yet (the country choice screen)
        case choosingCountry
        case loading
        /// The greeter, after the country is loaded, until a level is stored
        case onboarding
        case ready
        case failed(String)
        /// The server no longer accepts this build (426): only an update helps
        case tooOld(String)
    }

    /// A country the learner can live in: its server and what it shows
    public struct Country: Identifiable, Equatable, Sendable {
        public let server: URL
        public let content: Content
        public var id: String { server.absoluteString }
    }

    public private(set) var phase: Phase
    public private(set) var content: Content?
    public private(set) var visits: [String: Int] = [:]
    /// This phone's learner on the current server (shown in Settings → Developer)
    public private(set) var learnerId: String?
    /// The server in use; nil until a country is chosen
    public private(set) var server: URL?
    /// Every country's card, for the country choice and Settings (loaded from
    /// each server's /v1/content, which needs no sign-in)
    public private(set) var countries: [Country] = []
    /// Whether this server saves how characters address the learner (/v1/me addressOn)
    public private(set) var addressOn = false
    /// "f" or "m" once chosen (onboarding or Settings); nil until then
    public private(set) var addressedAs: String?
    /// Shown under the Settings row when saving the choice failed
    public private(set) var addressError: String?
    /// The greeter's screen while phase is .onboarding
    public private(set) var onboarding: OnboardingModel?

    private(set) var api: APIClient?
    private let servers: [URL]
    private let makeAPI: (URL) -> APIClient

    /// The chosen country's server, kept between launches
    static let countryKey = "country.server"

    /// - servers: every country's server (Info.plist FuoriCountryServers)
    /// - fixedServer: a server set from outside (the -FuoriServer launch
    ///   argument, e.g. a local server), which skips the country choice
    public init(servers: [URL], fixedServer: URL? = nil, makeAPI: @escaping (URL) -> APIClient) {
        self.servers = servers
        self.makeAPI = makeAPI
        let chosen = fixedServer ?? UserDefaults.standard.string(forKey: Self.countryKey).flatMap(URL.init(string:))
        if let chosen {
            server = chosen
            api = makeAPI(chosen)
            phase = .loading
        } else {
            phase = .choosingCountry
        }
    }

    /// At launch: the chosen country's content, or every country's cards for the choice
    public func start() async {
        if server == nil {
            await loadCountries()
        } else {
            await load()
            await loadCountries()
        }
    }

    /// Every country's card. A server that doesn't answer is left out; if none
    /// does while choosing, the failure is shown with a retry.
    public func loadCountries() async {
        let clients = servers.map { ($0, makeAPI($0)) }
        let found = await withTaskGroup(of: Country?.self) { group in
            for (url, client) in clients {
                group.addTask { (try? await client.content()).map { Country(server: url, content: $0) } }
            }
            var all: [Country] = []
            for await country in group { if let country { all.append(country) } }
            return all
        }
        countries = servers.compactMap { url in found.first { $0.server == url } }
        if server == nil {
            phase = countries.isEmpty ? .failed("Can't reach the server. Check the connection and try again.") : .choosingCountry
        }
    }

    /// A country picked in Settings, applied once the sheet has finished
    /// closing (applyPendingCountry). Switching while the sheet is still on
    /// screen tore down the screen presenting it, mid-dismiss, and left the
    /// app on an endless spinner (Josh, 2026-10-16: Mexico conversation →
    /// Settings → Italy).
    public var pendingCountry: Country?

    /// Settings → Developer → Restart onboarding, applied the same way once the
    /// sheet has closed
    public var pendingRestart = false

    /// Called when the settings sheet has gone: switch to the country picked in
    /// it, or go back to the start of onboarding
    public func applyPendingCountry() async {
        if pendingRestart {
            pendingRestart = false
            await restartOnboarding()
            return
        }
        guard let country = pendingCountry else { return }
        pendingCountry = nil
        await choose(country)
    }

    /// The learner picked a country (first launch, or Settings → Explore)
    public func choose(_ country: Country) async {
        UserDefaults.standard.set(country.server.absoluteString, forKey: Self.countryKey)
        guard country.server != server || content == nil else { return }
        server = country.server
        api = makeAPI(country.server)
        onboarding?.stop()
        onboarding = nil
        content = nil
        visits = [:]
        learnerId = nil
        await load()
    }

    /// Onboarding done: start with the settings for the level (Beginner:
    /// English translation on, which also slows the voice; Intermediate and
    /// Advanced: off). The learner can change them in Settings.
    private func finishOnboarding(level: String) {
        UserDefaults.standard.set(level == "beginner", forKey: SettingsKey.english)
        if let api { Task { addressedAs = (try? await api.me())?.addressedAs ?? addressedAs } }
        onboarding = nil
        phase = .ready
    }

    /// Back to the first launch, for testing onboarding (hidden: Settings →
    /// touch and hold Version). Clears this country's level on the server so
    /// the greeter welcomes them again, forgets the chosen country and shows
    /// the country choice. Each country's learner is kept (its Keychain
    /// token), so progress and the people met aren't lost.
    public func restartOnboarding() async {
        if let api {
            do {
                try await api.onboardingReset()
            } catch {
                let code = report(error, step: "onboarding reset")
                let message = (error as? APIError)?.message ?? error.localizedDescription
                phase = .failed(ErrorCode.message(message, code: code))
                return
            }
        }
        onboarding?.stop()
        onboarding = nil
        UserDefaults.standard.removeObject(forKey: Self.countryKey)
        server = nil
        api = nil
        content = nil
        visits = [:]
        learnerId = nil
        phase = .choosingCountry
        await loadCountries()
    }

    /// Load the content, then the learner's visits (signing in on first launch).
    /// A failure is shown on screen with the server's message, never swallowed.
    public func load() async {
        guard let api else {
            await loadCountries()
            return
        }
        phase = .loading
        do {
            content = try await api.content()
            let me = try await api.me()
            visits = me.visits
            learnerId = me.learnerId
            addressOn = me.addressOn == true
            addressedAs = me.addressedAs
            retryPendingSaves()
            // Not placed yet in this country: the greeter first (existing
            // learners too, once: Josh, 2026-10-16)
            if me.onboarded == false, let content, let greeter = content.onboarding {
                onboarding = OnboardingModel(onboarding: greeter, language: content.language, api: api, askAddress: addressOn) { [weak self] level in
                    self?.finishOnboarding(level: level)
                }
                phase = .onboarding
            } else {
                phase = .ready
            }
        } catch let error as APIError where error.code == .upgradeRequired {
            phase = .tooOld(error.message)
        } catch {
            let code = report(error, step: "load")
            let message = (error as? APIError)?.message ?? error.localizedDescription
            phase = .failed(ErrorCode.message(message, code: code))
        }
    }

    /// Settings: how characters address them ("f" or "m"). Shown at once;
    /// a failure puts the old choice back and is reported. A 404 means the
    /// server has it off: the row goes away.
    public func chooseAddress(_ choice: String) async {
        guard let api, choice != addressedAs else { return }
        let before = addressedAs
        addressedAs = choice
        addressError = nil
        do {
            try await api.chooseAddress(choice)
        } catch {
            addressedAs = before
            let code = report(error, step: "settings address")
            if (error as? APIError)?.code == .notFound {
                addressOn = false
            } else {
                addressError = ErrorCode.message("Couldn't save that. Try again.", code: code)
            }
        }
    }

    // MARK: - Saving conversations

    /// Conversations whose save failed, retried at the next launch. Kept per
    /// server: a conversation can only be saved by the server it happened on.
    private func pendingKey(_ server: URL?) -> String { "conversations.pendingSave.\(server?.host() ?? "none")" }
    /// Before 2026-10-16 there was one list (and one country, Italy)
    private static let legacyPendingKey = "conversations.pendingSave"

    private func pending(_ key: String) -> Set<String> { Set(UserDefaults.standard.stringArray(forKey: key) ?? []) }

    /// Saves a conversation when the learner leaves it: the character writes
    /// what they remember (POST /v1/conversations/{id}/end). Runs on after the
    /// app goes to the background for as long as iOS allows. A failed save is
    /// kept and retried at the next launch, never dropped.
    ///
    /// `on` is the server the conversation happened on: a conversation left
    /// because the learner switched country must still be saved by its own
    /// country's server, not the new one (it used to go to the new one, fail,
    /// and be retried there at every launch).
    public func save(conversationId id: String, on origin: (api: APIClient, server: URL)? = nil) {
        guard let api = origin?.api ?? api else { return }
        let conversationServer = origin?.server ?? server
        let key = pendingKey(conversationServer)
        UserDefaults.standard.set(Array(pending(key).union([id])), forKey: key)
        #if canImport(UIKit)
        let task = UIApplication.shared.beginBackgroundTask(withName: "save conversation")
        #endif
        Task {
            do {
                try await api.endConversation(id)
                UserDefaults.standard.set(Array(pending(key).subtracting([id])), forKey: key)
                // Still in the same country: refresh the visit stamps
                if conversationServer == server { visits = (try? await api.me().visits) ?? visits }
            } catch {
                // Kept in the pending list and retried at the next launch
                report(error, step: "save", context: ["conversationId": id], using: api)
            }
            #if canImport(UIKit)
            UIApplication.shared.endBackgroundTask(task)
            #endif
        }
    }

    private func retryPendingSaves() {
        let key = pendingKey(server)
        if let legacy = UserDefaults.standard.stringArray(forKey: Self.legacyPendingKey) {
            UserDefaults.standard.set(Array(pending(key).union(legacy)), forKey: key)
            UserDefaults.standard.removeObject(forKey: Self.legacyPendingKey)
        }
        for id in pending(key) { save(conversationId: id) }
    }

    /// Sends the error to the server log (/v1/log) and returns its code
    @discardableResult
    private func report(_ error: Error, step: String, context: [String: String]? = nil, using client: APIClient? = nil) -> String {
        let code = (error as? APIError)?.requestId ?? ErrorCode.make()
        guard let client = client ?? api else { return code }
        let report = APIClient.ErrorReport(id: code, step: step, error: error, context: context)
        Task { await client.report(report) }
        return code
    }

    func conversation(city: City, place: Place, character: Character) -> ConversationModel? {
        guard let content, let api, let server else { return nil }
        // Saved by the server the conversation happened on, even after a country switch
        return ConversationModel(city: city, place: place, character: character, language: content.language, api: api) { [weak self] id in
            self?.save(conversationId: id, on: (api, server))
        }
    }
}
