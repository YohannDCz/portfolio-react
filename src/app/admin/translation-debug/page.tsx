'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Database,
  Languages,
  RefreshCw,
  Settings,
  TestTube,
  TrendingUp,
  XCircle,
  Zap
} from "lucide-react"
import { useEffect, useState } from 'react'

interface HealthStatus {
  status: string;
  timestamp?: string;
  providers?: Record<string, string>;
  error?: string;
}

interface Analytics {
  totalRequests?: number;
  successfulRequests?: number;
  failedRequests?: number;
  totalCharacters?: number;
  successRate?: number;
  avgResponseTime?: number;
  languagePairs?: Record<string, number>;
  providerStats?: Record<string, {
    requests: number;
    success: number;
    avgResponseTime: number;
  }>;
}

interface ErrorData {
  errors?: Array<{
    provider: string;
    source_language: string;
    target_language: string;
    error_message: string;
    created_at: string;
  }>;
  errorCounts?: Record<string, number>;
}

interface CacheStats {
  totalEntries?: number;
  totalCharacters?: number;
  hitRate?: number;
  providerStats?: Record<string, {
    entries: number;
    characters: number;
  }>;
}

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  responseTime: number;
  status: number;
}

export default function TranslationDebugPage() {
  const [loading, setLoading] = useState(true)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [errors, setErrors] = useState<ErrorData | null>(null)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Test form state
  const [testText, setTestText] = useState('Hello, this is a test translation.')
  const [testSource, setTestSource] = useState('en')
  const [testTarget, setTestTarget] = useState('fr')
  const [testProvider, setTestProvider] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadHealthStatus(),
        loadAnalytics(),
        loadErrorStats(),
        loadCacheStats()
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHealthStatus = async () => {
    try {
      const response = await fetch('/api/translate')
      const data = await response.json()
      setHealthStatus(data)
    } catch (error: any) {
      console.error('Failed to load health status:', error)
      setHealthStatus({ status: 'error', error: error.message })
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/translate/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  const loadErrorStats = async () => {
    try {
      const response = await fetch('/api/translate/errors')
      if (response.ok) {
        const data = await response.json()
        setErrors(data)
      }
    } catch (error) {
      console.error('Failed to load error stats:', error)
    }
  }

  const loadCacheStats = async () => {
    try {
      const response = await fetch('/api/translate/cache-stats')
      if (response.ok) {
        const data = await response.json()
        setCacheStats(data)
      }
    } catch (error) {
      console.error('Failed to load cache stats:', error)
    }
  }

  const runTest = async () => {
    setTestLoading(true)
    setTestResult(null)

    try {
      const startTime = Date.now()
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          source: testSource,
          target: testTarget,
          provider: testProvider || undefined
        })
      })

      const endTime = Date.now()
      const data = await response.json()

      setTestResult({
        success: response.ok,
        data,
        responseTime: endTime - startTime,
        status: response.status
      })
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        responseTime: 0,
        status: 0
      })
    } finally {
      setTestLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const clearCache = async () => {
    try {
      const response = await fetch('/api/translate/cache', { method: 'DELETE' })
      if (response.ok) {
        await loadCacheStats()
        alert('Cache cleared successfully')
      } else {
        alert('Failed to clear cache')
      }
    } catch (error: any) {
      alert('Error clearing cache: ' + error.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading translation diagnostics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Translation System Debug</h1>
          <p className="text-muted-foreground">Monitor and debug the automatic translation system</p>
        </div>
        <Button
          onClick={refreshData}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {getStatusIcon(healthStatus?.status || '')}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(healthStatus?.status || '')}`}>
              {healthStatus?.status?.toUpperCase() || 'UNKNOWN'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last checked: {healthStatus?.timestamp ? new Date(healthStatus.timestamp).toLocaleString() : 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats?.hitRate ? `${cacheStats.hitRate.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {cacheStats?.totalEntries || 0} cached entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.successRate ? `${analytics.successRate.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalRequests || 0} total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.avgResponseTime ? `${analytics.avgResponseTime}ms` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Translation Providers Status
              </CardTitle>
              <CardDescription>
                Current status of all configured translation providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthStatus?.providers ? Object.entries(healthStatus.providers).map(([name, status]) => (
                  <div key={name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status === 'healthy' ? 'healthy' : 'error')}
                      <div>
                        <h3 className="font-medium capitalize">{name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {name === 'deepl' && 'High-quality neural translation'}
                          {name === 'google' && 'Google Cloud Translate'}
                          {name === 'libretranslate' && 'Open source translation'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={status === 'healthy' ? 'default' : 'destructive'}>
                      {status}
                    </Badge>
                  </div>
                )) : (
                  <p className="text-muted-foreground">No provider status available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics ? (
                  <>
                    <div className="flex justify-between">
                      <span>Total Requests:</span>
                      <span className="font-medium">{analytics.totalRequests?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Successful:</span>
                      <span className="font-medium text-green-600">{analytics.successfulRequests?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="font-medium text-red-600">{analytics.failedRequests?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Characters Processed:</span>
                      <span className="font-medium">{analytics.totalCharacters?.toLocaleString() || 0}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No analytics data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Language Pairs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.languagePairs ? (
                  <div className="space-y-2">
                    {Object.entries(analytics.languagePairs)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([pair, count]) => (
                        <div key={pair} className="flex justify-between">
                          <span className="text-sm">{pair}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-muted-foreground">No language data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {analytics?.providerStats && (
            <Card>
              <CardHeader>
                <CardTitle>Provider Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.providerStats).map(([provider, stats]) => (
                    <div key={provider} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{provider}</span>
                        <Badge variant="outline">{stats.requests} requests</Badge>
                      </div>
                      <Progress
                        value={(stats.success / stats.requests) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Success: {((stats.success / stats.requests) * 100).toFixed(1)}%</span>
                        <span>Avg: {stats.avgResponseTime}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Recent Errors
              </CardTitle>
              <CardDescription>
                Latest translation errors and their frequency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errors?.errors && errors.errors.length > 0 ? (
                <div className="space-y-3">
                  {errors.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>
                        {error.provider} - {error.source_language} → {error.target_language}
                      </AlertTitle>
                      <AlertDescription>
                        <div className="mt-2">
                          <p>{error.error_message}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {new Date(error.created_at).toLocaleString()}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent errors found</p>
              )}
            </CardContent>
          </Card>

          {errors?.errorCounts && Object.keys(errors.errorCounts).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Error Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(errors.errorCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([error, count]) => (
                      <div key={error} className="flex justify-between">
                        <span className="text-sm truncate">{error}</span>
                        <Badge variant="destructive">{count}</Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cache Tab */}
        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Cache Statistics
              </CardTitle>
              <CardDescription>
                Translation cache performance and management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cacheStats ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Entries</p>
                      <p className="text-2xl font-bold">{cacheStats.totalEntries?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Characters</p>
                      <p className="text-2xl font-bold">{cacheStats.totalCharacters?.toLocaleString()}</p>
                    </div>
                  </div>

                  {cacheStats.providerStats && (
                    <div className="space-y-2">
                      <h4 className="font-medium">By Provider</h4>
                      {Object.entries(cacheStats.providerStats).map(([provider, stats]) => (
                        <div key={provider} className="flex justify-between items-center">
                          <span className="capitalize">{provider}</span>
                          <div className="text-right">
                            <div className="font-medium">{stats.entries} entries</div>
                            <div className="text-sm text-muted-foreground">{stats.characters} chars</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={clearCache}
                    variant="destructive"
                    size="sm"
                    className="mt-4"
                  >
                    Clear All Cache
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">No cache data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Translation Test
              </CardTitle>
              <CardDescription>
                Test the translation system with custom input
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-source">Source Language</Label>
                  <Input
                    id="test-source"
                    value={testSource}
                    onChange={(e) => setTestSource(e.target.value)}
                    placeholder="en"
                  />
                </div>
                <div>
                  <Label htmlFor="test-target">Target Language</Label>
                  <Input
                    id="test-target"
                    value={testTarget}
                    onChange={(e) => setTestTarget(e.target.value)}
                    placeholder="fr"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="test-provider">Provider (optional)</Label>
                <Input
                  id="test-provider"
                  value={testProvider}
                  onChange={(e) => setTestProvider(e.target.value)}
                  placeholder="deepl, google, or libretranslate"
                />
              </div>

              <div>
                <Label htmlFor="test-text">Text to Translate</Label>
                <Textarea
                  id="test-text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Enter text to translate..."
                  rows={3}
                />
              </div>

              <Button onClick={runTest} disabled={testLoading}>
                {testLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run Test
                  </>
                )}
              </Button>

              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  <AlertTitle>
                    Test Result {testResult.success ? '✅' : '❌'}
                  </AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <p><strong>Status:</strong> {testResult.status}</p>
                      <p><strong>Response Time:</strong> {testResult.responseTime}ms</p>
                      {testResult.success ? (
                        <>
                          <p><strong>Result:</strong> {testResult.data.translatedText}</p>
                          <p><strong>Provider:</strong> {testResult.data.provider}</p>
                          <p><strong>Cached:</strong> {testResult.data.cached ? 'Yes' : 'No'}</p>
                          {testResult.data.detectedSourceLanguage && (
                            <p><strong>Detected Language:</strong> {testResult.data.detectedSourceLanguage}</p>
                          )}
                        </>
                      ) : (
                        <p><strong>Error:</strong> {testResult.error || testResult.data?.error}</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Logs
              </CardTitle>
              <CardDescription>
                Recent translation system activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Real-time logs would be displayed here. This feature requires additional implementation
                for log streaming from the backend.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
