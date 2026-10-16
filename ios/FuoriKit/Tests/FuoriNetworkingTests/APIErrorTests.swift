import Foundation
import Testing
@testable import FuoriNetworking

/// The server's error shape (lib/api.ts) is read into APIError, unknown codes
/// don't break older builds, and a non-JSON failure still becomes an error.
@Suite struct APIErrorTests {
    @Test func readsServerError() {
        let body = Data(#"{"error":{"code":"rate_limited","message":"Too many","retryable":true,"retryAfterMs":2000}}"#.utf8)
        let error = APIError.from(data: body, status: 429)
        #expect(error.code == .rateLimited)
        #expect(error.retryable)
        #expect(error.retryAfterMs == 2000)
        #expect(error.status == 429)
    }

    @Test func unknownCodeIsUnknown() {
        let body = Data(#"{"error":{"code":"something_new","message":"x","retryable":false}}"#.utf8)
        #expect(APIError.from(data: body, status: 400).code == .unknown)
    }

    @Test func htmlPageIsServerError() {
        let error = APIError.from(data: Data("<html>Bad gateway</html>".utf8), status: 502)
        #expect(error.code == .serverError)
        #expect(error.retryable)
    }

    @Test func readsUpgradeRequired() {
        let body = Data(#"{"error":{"code":"upgrade_required","message":"Update the app","retryable":false}}"#.utf8)
        let error = APIError.from(data: body, status: 426)
        #expect(error.code == .upgradeRequired)
        #expect(!error.retryable)
    }
}
