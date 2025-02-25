// export default IDE;
import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';
import { Button, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './IDE.css';

// Create axios instance with the base URL
const api = axios.create({
  baseURL: 'http://localhost:5000', // Ensure this matches your backend server port
});

const IDE = () => {
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('cpp');
  const [outputLog, setOutputLog] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [testResults, setTestResults] = useState(null);
  const [debugSuggestions, setDebugSuggestions] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [projectStructure, setProjectStructure] = useState([]);

  useEffect(() => {
    // Fetch project structure on component mount
    fetchProjectStructure();
  }, []);

  const fetchProjectStructure = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/project-structure');
      setProjectStructure(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching project structure:', error);
      setOutputLog(`Error fetching project structure: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const runCode = async () => {
    setIsLoading(true);
    setOutputLog('Running code...');
    
    try {
      const response = await api.post('/api/run-code', {
        code,
        language
      });
      
      setOutputLog(response.data.output);
    } catch (error) {
      setOutputLog(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTests = async () => {
    setIsLoading(true);
    setOutputLog('Generating tests...');
    
    try {
      const response = await api.post('/api/generate-tests', {
        code,
        language
      });
      
      setTestResults(response.data);
    } catch (error) {
      setOutputLog(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
      setOutputLog('Generated tests!');
    }
  };

  const debugCode = async () => {
    setIsLoading(true);
    setOutputLog('Analyzing code for bugs...');
    
    try {
      const response = await api.post('/api/debug-code', {
        code,
        language
      });
      
      setDebugSuggestions(response.data.suggestions);
    } catch (error) {
      setOutputLog(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
      setOutputLog('Debugging Completed!');
    }
  };

  const generateCodeFromPrompt = async () => {
    if (!aiPrompt.trim()) {
      setOutputLog('Please enter a prompt for code generation');
      return;
    }
    
    setIsLoading(true);
    setOutputLog('Generating code from prompt...');
    
    try {
      const response = await api.post('/api/generate-code', {
        prompt: aiPrompt,
        language
      });
      
      setCode(response.data.generatedCode);
      setOutputLog('Code generated successfully!');
    } catch (error) {
      setOutputLog(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerCIBuild = async () => {
    setIsLoading(true);
    setOutputLog('Triggering CI build...');
    
    try {
      const response = await api.post('/api/trigger-ci-build', {
        code,
        language
      });
      
      setOutputLog(response.data.buildLog);
    } catch (error) {
      setOutputLog(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ide-container">
      <div className="sidebar">
        <h3>Project Files</h3>
        {isLoading && projectStructure.length === 0 ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <ul className="file-tree">
            {projectStructure.map((item, index) => (
              <li key={index}>{item.type === 'directory' ? '📁' : '📄'} {item.name}</li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="main-content">
        <div className="top-bar">
          <select value={language} onChange={handleLanguageChange}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
          </select>
          
          <div className="button-group">
            <Button variant="primary" onClick={runCode} disabled={isLoading}>Run Code</Button>
            <Button variant="info" onClick={generateTests} disabled={isLoading}>Generate Tests</Button>
            <Button variant="warning" onClick={debugCode} disabled={isLoading}>Debug</Button>
            <Button variant="success" onClick={triggerCIBuild} disabled={isLoading}>Build & Deploy</Button>
          </div>
        </div>
        
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Tab eventKey="editor" title="Code Editor">
            <MonacoEditor
              height="60vh"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                automaticLayout: true,
                lineNumbers: 'on',
                tabSize: 2,
              }}
            />
          </Tab>
          <Tab eventKey="ai-assistant" title="AI Assistant">
            <div className="ai-assistant-panel">
              <div>
                <textarea
                  className="ai-prompt"
                  placeholder="Describe what you want to build (e.g., 'Create a function that sorts an array of objects by a specific property')"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                />
                <Button variant="primary" onClick={generateCodeFromPrompt} disabled={isLoading}>Generate Code</Button>
              </div>
            </div>
          </Tab>
          <Tab eventKey="tests" title="Tests">
            <div className="test-results">
              {testResults ? (
                <>
                  <h4>Test Results</h4>
                  <div className="test-summary">
                    <span className={`test-badge ${testResults.passed === testResults.total ? 'success' : 'danger'}`}>
                      {testResults.passed}/{testResults.total} Tests Passing
                    </span>
                  </div>
                  <ul>
                    {testResults.tests.map((test, index) => (
                      <li key={index} className={test.passed ? 'test-pass' : 'test-fail'}>
                        {test.name}: {test.passed ? '✓' : '✗'} 
                        {!test.passed && <div className="test-error">{test.error}</div>}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>No tests have been run yet. Click "Generate Tests" to create tests for your code.</p>
              )}
            </div>
          </Tab>
          <Tab eventKey="debug" title="Debug">
            <div className="debug-panel">
              {debugSuggestions.length > 0 ? (
                <>
                  <h4>Debugging Suggestions</h4>
                  <ul className="debug-list">
                    {debugSuggestions.map((suggestion, index) => (
                      <li key={index} className="debug-item">
                        <div className="debug-issue">
                          <span className="issue-type">{suggestion.type}</span>
                          <span className="issue-location">Line {suggestion.line}</span>
                        </div>
                        <p className="issue-description">{suggestion.description}</p>
                        {suggestion.fixCode && (
                          <div className="fix-suggestion">
                            <code>{suggestion.fixCode}</code>
                            <Button 
                              size="sm" 
                              variant="outline-success"
                              onClick={() => setCode(code.replace(suggestion.originalCode, suggestion.fixCode))}
                            >
                              Apply Fix
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>No debugging information available. Click "Debug" to analyze your code for issues.</p>
              )}
            </div>
          </Tab>
        </Tabs>
        
        <div className="output-panel">
          <h4>Output</h4>
          <div className="output-log">
            {isLoading && <Spinner animation="border" size="sm" />}
            <pre>{outputLog}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDE;