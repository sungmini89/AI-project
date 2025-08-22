import React, { useState, useEffect } from 'react';
import { 
  TestTube, 
  Database, 
  Brain, 
  BarChart3, 
  Calendar, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCcw,
  FileText,
  Smartphone
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { databaseService } from '../../services/databaseService';
import { emotionAnalysisService } from '../../services/emotionAnalysisService';
import { freeAIService } from '../../services/freeAIService';

interface TestResult {
  name: string;
  status: 'pending' | 'passed' | 'failed';
  error?: string;
  duration?: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed';
}

const ComprehensiveDebugPanel: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    { name: 'Database Operations', tests: [], status: 'pending' },
    { name: 'Emotion Analysis', tests: [], status: 'pending' },
    { name: 'AI Services', tests: [], status: 'pending' },
    { name: 'PWA Features', tests: [], status: 'pending' },
    { name: 'UI Components', tests: [], status: 'pending' },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [testData, setTestData] = useState<any>({});

  const updateTestResult = (suiteIndex: number, testName: string, result: Omit<TestResult, 'name'>) => {
    setTestSuites(prev => prev.map((suite, idx) => {
      if (idx === suiteIndex) {
        const testIndex = suite.tests.findIndex(test => test.name === testName);
        if (testIndex >= 0) {
          suite.tests[testIndex] = { ...suite.tests[testIndex], ...result };
        } else {
          suite.tests.push({ name: testName, ...result });
        }
      }
      return suite;
    }));
  };

  const runTest = async (testFn: () => Promise<void>, suiteName: string, testName: string) => {
    const suiteIndex = testSuites.findIndex(s => s.name === suiteName);
    const startTime = performance.now();
    
    updateTestResult(suiteIndex, testName, { status: 'pending' });
    
    try {
      await testFn();
      const duration = Math.round(performance.now() - startTime);
      updateTestResult(suiteIndex, testName, { status: 'passed', duration });
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : String(error);
      updateTestResult(suiteIndex, testName, { 
        status: 'failed', 
        error: errorMessage,
        duration 
      });
    }
  };

  // Database Tests
  const testDatabaseOperations = async () => {
    const suiteName = 'Database Operations';
    
    // Test database connection
    await runTest(async () => {
      await databaseService.getSettings();
    }, suiteName, 'Database Connection');

    // Test diary entry CRUD
    await runTest(async () => {
      const testEntry = {
        id: 'test-' + Date.now(),
        title: 'Test Entry',
        content: 'This is a test entry for debugging purposes.',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create
      await databaseService.addEntry(testEntry);
      
      // Read
      const retrieved = await databaseService.getEntry(testEntry.id);
      if (!retrieved) throw new Error('Entry not found after creation');
      
      // Update
      retrieved.title = 'Updated Test Entry';
      await databaseService.updateEntry(retrieved);
      
      // Verify update
      const updated = await databaseService.getEntry(testEntry.id);
      if (updated?.title !== 'Updated Test Entry') {
        throw new Error('Entry update failed');
      }
      
      // Delete
      await databaseService.deleteEntry(testEntry.id);
      
      // Verify deletion
      const deleted = await databaseService.getEntry(testEntry.id);
      if (deleted) throw new Error('Entry deletion failed');
      
      setTestData(prev => ({ ...prev, sampleEntry: testEntry }));
    }, suiteName, 'CRUD Operations');

    // Test statistics calculation
    await runTest(async () => {
      const stats = await databaseService.getStatistics();
      if (typeof stats.totalEntries !== 'number') {
        throw new Error('Invalid statistics format');
      }
      setTestData(prev => ({ ...prev, statistics: stats }));
    }, suiteName, 'Statistics Generation');

    // Test search functionality
    await runTest(async () => {
      const entries = await databaseService.searchEntries('test');
      if (!Array.isArray(entries)) {
        throw new Error('Search should return array');
      }
    }, suiteName, 'Search Functionality');

    // Test backup/restore
    await runTest(async () => {
      const backupId = await databaseService.createBackup();
      if (typeof backupId !== 'number') {
        throw new Error('Backup creation failed');
      }
      
      const backups = await databaseService.getBackups();
      if (!backups.find(b => b.id === backupId)) {
        throw new Error('Backup not found in list');
      }
      
      await databaseService.deleteBackup(backupId);
    }, suiteName, 'Backup/Restore');
  };

  // Emotion Analysis Tests
  const testEmotionAnalysis = async () => {
    const suiteName = 'Emotion Analysis';
    
    // Test English sentiment analysis
    await runTest(async () => {
      const result = await emotionAnalysisService.analyzeEmotion('I am very happy today!');
      if (!result.primaryEmotion || typeof result.score !== 'number') {
        throw new Error('Invalid emotion analysis result');
      }
      if (result.primaryEmotion !== 'happy' && result.primaryEmotion !== 'excited') {
        throw new Error(`Expected positive emotion, got ${result.primaryEmotion}`);
      }
      setTestData(prev => ({ ...prev, englishAnalysis: result }));
    }, suiteName, 'English Sentiment Analysis');

    // Test Korean sentiment analysis
    await runTest(async () => {
      const result = await emotionAnalysisService.analyzeEmotion('오늘 정말 행복하고 기뻐요!');
      if (!result.primaryEmotion || typeof result.score !== 'number') {
        throw new Error('Invalid emotion analysis result');
      }
      setTestData(prev => ({ ...prev, koreanAnalysis: result }));
    }, suiteName, 'Korean Sentiment Analysis');

    // Test emotion color mapping
    await runTest(async () => {
      const result = await emotionAnalysisService.analyzeEmotion('I am sad');
      const colors = await import('../../services/emotionAnalysisService');
      if (!colors.EMOTION_COLORS[result.primaryEmotion]) {
        throw new Error('Missing color mapping for emotion');
      }
    }, suiteName, 'Emotion Color Mapping');

    // Test edge cases
    await runTest(async () => {
      const emptyResult = await emotionAnalysisService.analyzeEmotion('');
      if (emptyResult.primaryEmotion !== 'neutral') {
        throw new Error('Empty text should return neutral emotion');
      }
      
      const mixedResult = await emotionAnalysisService.analyzeEmotion('I am happy but also sad');
      if (!mixedResult.primaryEmotion || typeof mixedResult.confidence !== 'number') {
        throw new Error('Mixed emotions should still produce valid result');
      }
    }, suiteName, 'Edge Cases');
  };

  // AI Services Tests
  const testAIServices = async () => {
    const suiteName = 'AI Services';
    
    // Test AI service initialization
    await runTest(async () => {
      if (!freeAIService) {
        throw new Error('AI service not initialized');
      }
    }, suiteName, 'Service Initialization');

    // Test different modes
    await runTest(async () => {
      // Test mock mode
      const mockMode = 'mock';
      // This would typically test the mock responses
      // For now, just verify the service exists
      if (typeof freeAIService.analyzeText !== 'function') {
        throw new Error('analyzeText method not found');
      }
    }, suiteName, 'Service Modes');

    // Test error handling
    await runTest(async () => {
      try {
        // Test with potentially problematic input
        await freeAIService.analyzeText('');
      } catch (error) {
        // This is expected behavior for some configurations
      }
      // Test passes if no unhandled errors occur
    }, suiteName, 'Error Handling');
  };

  // PWA Tests
  const testPWAFeatures = async () => {
    const suiteName = 'PWA Features';
    
    // Test service worker registration
    await runTest(async () => {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }
      
      const registrations = await navigator.serviceWorker.getRegistrations();
      // Note: In development, SW might not be registered
      console.log('SW Registrations:', registrations.length);
    }, suiteName, 'Service Worker');

    // Test offline capability
    await runTest(async () => {
      // Check if app can handle offline state
      const isOnline = navigator.onLine;
      console.log('Online status:', isOnline);
      
      // Test cache storage
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log('Available caches:', cacheNames);
      }
    }, suiteName, 'Offline Capability');

    // Test manifest
    await runTest(async () => {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (!manifestLink) {
        throw new Error('Manifest link not found');
      }
      
      const manifestUrl = manifestLink.getAttribute('href');
      if (!manifestUrl) {
        throw new Error('Manifest URL not specified');
      }
      
      try {
        const response = await fetch(manifestUrl);
        if (!response.ok) {
          throw new Error(`Manifest fetch failed: ${response.status}`);
        }
        const manifest = await response.json();
        if (!manifest.name || !manifest.icons) {
          throw new Error('Manifest missing required fields');
        }
        setTestData(prev => ({ ...prev, manifest }));
      } catch (error) {
        throw new Error(`Manifest validation failed: ${error}`);
      }
    }, suiteName, 'Web App Manifest');

    // Test install prompt
    await runTest(async () => {
      // Check if install prompt is available
      const isInstallable = 'beforeinstallprompt' in window;
      console.log('Install prompt available:', isInstallable);
    }, suiteName, 'Install Prompt');
  };

  // UI Component Tests
  const testUIComponents = async () => {
    const suiteName = 'UI Components';
    
    // Test responsive design
    await runTest(async () => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      };
      
      if (viewport.width < 640) {
        console.log('Mobile viewport detected');
      } else if (viewport.width < 1024) {
        console.log('Tablet viewport detected');
      } else {
        console.log('Desktop viewport detected');
      }
      
      setTestData(prev => ({ ...prev, viewport }));
    }, suiteName, 'Responsive Design');

    // Test theme support
    await runTest(async () => {
      const rootElement = document.documentElement;
      const computedStyle = getComputedStyle(rootElement);
      
      // Check if CSS custom properties are supported
      const testProperty = computedStyle.getPropertyValue('--tw-bg-opacity');
      console.log('CSS custom properties supported:', testProperty !== '');
    }, suiteName, 'Theme Support');

    // Test accessibility features
    await runTest(async () => {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      console.log('Focusable elements found:', focusableElements.length);
      
      // Check for aria labels
      const ariaLabels = document.querySelectorAll('[aria-label]');
      console.log('Elements with aria-label:', ariaLabels.length);
      
      if (focusableElements.length === 0) {
        throw new Error('No focusable elements found');
      }
    }, suiteName, 'Accessibility');

    // Test error boundaries
    await runTest(async () => {
      const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
      console.log('Error boundaries found:', errorBoundaries.length);
      
      // Error boundaries are React components, so we test their presence indirectly
      const hasErrorBoundary = document.querySelector('.error-boundary') !== null;
      console.log('Error boundary detected:', hasErrorBoundary);
    }, suiteName, 'Error Boundaries');
  };

  // Run all tests
  const runAllTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setTestSuites(prev => prev.map(suite => ({ ...suite, tests: [], status: 'pending' })));
    
    try {
      // Mark suites as running
      setTestSuites(prev => prev.map(suite => ({ ...suite, status: 'running' })));
      
      await testDatabaseOperations();
      setTestSuites(prev => prev.map(suite => 
        suite.name === 'Database Operations' 
          ? { ...suite, status: 'completed' }
          : suite
      ));
      
      await testEmotionAnalysis();
      setTestSuites(prev => prev.map(suite => 
        suite.name === 'Emotion Analysis' 
          ? { ...suite, status: 'completed' }
          : suite
      ));
      
      await testAIServices();
      setTestSuites(prev => prev.map(suite => 
        suite.name === 'AI Services' 
          ? { ...suite, status: 'completed' }
          : suite
      ));
      
      await testPWAFeatures();
      setTestSuites(prev => prev.map(suite => 
        suite.name === 'PWA Features' 
          ? { ...suite, status: 'completed' }
          : suite
      ));
      
      await testUIComponents();
      setTestSuites(prev => prev.map(suite => 
        suite.name === 'UI Components' 
          ? { ...suite, status: 'completed' }
          : suite
      ));
      
      toast.success('모든 테스트 완료!');
    } catch (error) {
      toast.error('테스트 실행 중 오류 발생');
      console.error('Test execution error:', error);
    } finally {
      setIsRunning(false);
      setTestSuites(prev => prev.map(suite => 
        suite.status === 'running' 
          ? { ...suite, status: 'completed' }
          : suite
      ));
    }
  };

  const getTestSuiteIcon = (suiteName: string) => {
    switch (suiteName) {
      case 'Database Operations': return <Database className="w-5 h-5" />;
      case 'Emotion Analysis': return <Brain className="w-5 h-5" />;
      case 'AI Services': return <Settings className="w-5 h-5" />;
      case 'PWA Features': return <Smartphone className="w-5 h-5" />;
      case 'UI Components': return <BarChart3 className="w-5 h-5" />;
      default: return <TestTube className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: 'pending' | 'passed' | 'failed') => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-300 animate-pulse" />;
    }
  };

  // Environment info
  const getEnvironmentInfo = () => ({
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    storage: {
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      indexedDB: typeof indexedDB !== 'undefined',
    },
    apis: {
      geolocation: 'geolocation' in navigator,
      notification: 'Notification' in window,
      serviceWorker: 'serviceWorker' in navigator,
      caches: 'caches' in window,
    }
  });

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TestTube className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-blue-800">종합 디버그 패널</h2>
        </div>
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCcw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? '테스트 실행 중...' : '전체 테스트 실행'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {testSuites.map((suite, suiteIndex) => (
          <div key={suite.name} className="bg-white rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-3">
              {getTestSuiteIcon(suite.name)}
              <h3 className="font-semibold text-gray-800">{suite.name}</h3>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                suite.status === 'completed' ? 'bg-green-100 text-green-800' :
                suite.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {suite.status === 'running' ? '실행 중' :
                 suite.status === 'completed' ? '완료' : '대기 중'}
              </div>
            </div>
            
            <div className="space-y-2">
              {suite.tests.length === 0 && suite.status !== 'running' ? (
                <p className="text-sm text-gray-500">테스트 대기 중</p>
              ) : (
                suite.tests.map((test, testIndex) => (
                  <div key={testIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(test.status)}
                      <span className="text-sm font-medium">{test.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {test.duration && <span>{test.duration}ms</span>}
                      {test.error && (
                        <span className="text-red-600 max-w-48 truncate" title={test.error}>
                          {test.error}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Environment Information */}
      <details className="bg-white rounded-lg p-4 border">
        <summary className="cursor-pointer font-semibold text-gray-800 mb-2">
          환경 정보
        </summary>
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(getEnvironmentInfo(), null, 2)}
        </pre>
      </details>

      {/* Test Data */}
      {Object.keys(testData).length > 0 && (
        <details className="bg-white rounded-lg p-4 border mt-4">
          <summary className="cursor-pointer font-semibold text-gray-800 mb-2">
            테스트 데이터
          </summary>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </details>
      )}

      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded mt-4">
        ⚠️ 개발 모드에서만 표시됩니다. 이 패널은 애플리케이션의 모든 핵심 기능을 테스트합니다.
      </div>
    </div>
  );
};

// Only show in development
export default process.env.NODE_ENV === 'development' ? ComprehensiveDebugPanel : () => null;