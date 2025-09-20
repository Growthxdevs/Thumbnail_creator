"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Copy, RefreshCw } from "lucide-react";

interface EnvData {
  [key: string]: string;
  timestamp: string;
  showValues: boolean;
  isProduction: boolean;
  note: string;
}

export default function DebugPage() {
  const [envData, setEnvData] = useState<EnvData | null>(null);
  const [showValues, setShowValues] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchEnvData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/debug/env?showValues=${showValues}`);
      const data = await response.json();
      setEnvData(data);
    } catch (error) {
      console.error("Error fetching env data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvData();
  }, [showValues]);

  const copyToClipboard = async () => {
    if (envData) {
      await navigator.clipboard.writeText(JSON.stringify(envData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (value: string) => {
    if (value.includes("✅")) return "bg-green-100 text-green-800";
    if (value.includes("❌")) return "bg-red-100 text-red-800";
    if (value.includes("⚠️")) return "bg-yellow-100 text-yellow-800";
    if (value.includes("🚨"))
      return "bg-red-200 text-red-900 border-2 border-red-500";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Environment Debug</CardTitle>
                <CardDescription>
                  Check your environment variables and configuration
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowValues(!showValues)}
                >
                  {showValues ? (
                    <EyeOff className="h-4 w-4 mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  {showValues ? "Hide Values" : "Show Values"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchEnvData}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!envData}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {envData && (
              <div className="space-y-4">
                {/* Warning Note */}
                {envData.note && (
                  <div
                    className={`p-3 rounded-md ${
                      envData.note.includes("🚨")
                        ? "bg-red-100 border-2 border-red-500"
                        : showValues
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        envData.note.includes("🚨")
                          ? "text-red-900"
                          : showValues
                          ? "text-yellow-800"
                          : "text-blue-800"
                      }`}
                    >
                      {envData.note}
                    </p>
                  </div>
                )}

                {/* Environment Variables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(envData)
                    .filter(
                      ([key]) =>
                        ![
                          "timestamp",
                          "showValues",
                          "isProduction",
                          "note",
                        ].includes(key)
                    )
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex-1">
                          <code className="text-sm font-mono text-gray-700">
                            {key}
                          </code>
                        </div>
                        <Badge className={getStatusColor(value)}>{value}</Badge>
                      </div>
                    ))}
                </div>

                {/* Timestamp */}
                <div className="text-sm text-gray-500 text-center">
                  Last updated: {new Date(envData.timestamp).toLocaleString()}
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Loading environment data...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
