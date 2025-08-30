import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { userService } from "@/lib/services/userService";
import { chatService } from "@/lib/services/chatService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function FirebaseDebug() {
  const [user, loading, error] = useAuthState(auth);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);

  const runFirebaseTest = async () => {
    setIsRunning(true);
    const info: any = {};

    // Test account credentials
    const testEmail = "test@example.com";
    const testPassword = "testpass123";
    const testName = "Test User";

    try {
      console.log("🧪 Starting Firebase debug tests...");

      // 1. Check authentication state
      info.auth = {
        user: user
          ? {
              uid: user.uid,
              isAnonymous: user.isAnonymous,
              displayName: user.displayName,
              email: user.email,
            }
          : null,
        loading,
        error: error?.message,
      };

      // 2. Test authentication (try anonymous first, then test account)
      if (!user) {
        console.log("🔄 Testing authentication...");
        try {
          // Try anonymous login first
          console.log("🔄 Trying anonymous login...");
          await userService.signInAnonymously();
          info.authentication = { method: "anonymous", status: "success" };
          console.log("✅ Anonymous login successful");
        } catch (err: any) {
          console.log("⚠️ Anonymous login failed, trying test account...");

          try {
            // Fallback to test account
            console.log("🔄 Creating test account...");
            await userService.signUp(testEmail, testPassword, testName);
            info.authentication = {
              method: "signup",
              status: "success",
              email: testEmail,
            };
            console.log("✅ Test account created and logged in");
          } catch (signupErr: any) {
            if (signupErr.code === "auth/email-already-in-use") {
              // Account exists, try to sign in
              console.log("🔄 Test account exists, signing in...");
              try {
                await userService.signIn(testEmail, testPassword);
                info.authentication = {
                  method: "signin",
                  status: "success",
                  email: testEmail,
                };
                console.log("✅ Test account signed in");
              } catch (signinErr: any) {
                info.authentication = {
                  status: "error",
                  message: signinErr.message,
                };
                console.error("❌ Test account sign in failed:", signinErr);
              }
            } else {
              info.authentication = {
                status: "error",
                message: signupErr.message,
              };
              console.error("❌ Test account creation failed:", signupErr);
            }
          }
        }
      } else {
        info.authentication = {
          status: "already_authenticated",
          uid: user.uid,
        };
      }

      // 3. Test room creation
      if (user) {
        console.log("🏠 Testing room creation...");
        try {
          const roomId = await chatService.createRoom(
            `Test Room ${Date.now()}`,
            user.uid,
            ["ko", "en"]
          );
          info.roomCreation = { status: "success", roomId };
          console.log("✅ Room creation successful:", roomId);

          // 4. Test message sending
          console.log("💬 Testing message sending...");
          try {
            const messageId = await chatService.sendMessage(
              roomId,
              user.uid,
              user.displayName || "Test User",
              "Hello, this is a test message!",
              ["ko"]
            );
            info.messageSending = { status: "success", messageId };
            console.log("✅ Message sending successful:", messageId);
          } catch (err: any) {
            info.messageSending = { status: "error", message: err.message };
            console.error("❌ Message sending failed:", err);
          }
        } catch (err: any) {
          info.roomCreation = { status: "error", message: err.message };
          console.error("❌ Room creation failed:", err);
        }
      }
    } catch (err: any) {
      console.error("❌ Firebase debug test failed:", err);
      info.error = err.message;
    }

    setDebugInfo(info);
    setIsRunning(false);
    console.log("🧪 Firebase debug tests completed:", info);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-800 text-sm">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-sm">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unknown
          </span>
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Firebase Debug Console
          {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runFirebaseTest}
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            "Run Firebase Tests"
          )}
        </Button>

        {Object.keys(debugInfo).length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>

            {debugInfo.auth && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Authentication</h4>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo.auth, null, 2)}
                </pre>
              </div>
            )}

            {debugInfo.authentication && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">
                  Authentication ({debugInfo.authentication.method || "unknown"}
                  )
                </span>
                {getStatusBadge(debugInfo.authentication.status)}
              </div>
            )}

            {debugInfo.roomCreation && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Room Creation</span>
                {getStatusBadge(debugInfo.roomCreation.status)}
              </div>
            )}

            {debugInfo.messageSending && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Message Sending</span>
                {getStatusBadge(debugInfo.messageSending.status)}
              </div>
            )}

            {debugInfo.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-medium text-destructive mb-1">Error</h4>
                <p className="text-sm text-destructive">{debugInfo.error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
