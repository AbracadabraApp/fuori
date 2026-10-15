import Foundation
import Security
import FuoriNetworking

/// The device token from POST /v1/auth/device, kept in the Keychain so it
/// survives app updates and reinstalls (unlike the web's cookie in Safari).
/// One token per country's server: Italy and Mexico share a database, and
/// Magda's study file is stored under the same id in both, so one learner
/// across countries would mix Italian and Spanish notes. Separate learners per
/// country, as the web's separate cookies already give.
struct KeychainTokenStore: TokenStore {
    /// The server's host, e.g. fuori-production.up.railway.app
    let server: String

    private var query: [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: "fuori.device-token",
            kSecAttrAccount as String: server,
        ]
    }

    func load() -> String? {
        var q = query
        q[kSecReturnData as String] = true
        q[kSecMatchLimit as String] = kSecMatchLimitOne
        var item: CFTypeRef?
        guard SecItemCopyMatching(q as CFDictionary, &item) == errSecSuccess, let data = item as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    func save(_ token: String) {
        SecItemDelete(query as CFDictionary)
        var q = query
        q[kSecValueData as String] = Data(token.utf8)
        q[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        let status = SecItemAdd(q as CFDictionary, nil)
        // Without the Keychain the next launch signs in as a new learner; say so in the log
        if status != errSecSuccess { print("Fuori: saving the device token failed (\(status))") }
    }
}
