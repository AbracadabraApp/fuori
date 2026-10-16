import Foundation

/// Short codes for errors (E-7K2F), as on the web (lib/errors.ts): shown to the
/// learner, sent with the request as x-fuori-id and in the report to /v1/log,
/// so `railway logs | grep E-7K2F` finds both sides.
public enum ErrorCode {
    /// No 0/O or 1/I/L, so a code read aloud or copied by hand stays right
    static let alphabet = Array("ABCDEFGHJKMNPQRSTUVWXYZ23456789")

    public static func make() -> String {
        "E-" + String((0..<4).map { _ in alphabet.randomElement()! })
    }

    /// The message with its code after it, unless the server already put it in
    public static func message(_ message: String, code: String) -> String {
        message.contains(code) ? message : "\(message) (\(code))"
    }
}
