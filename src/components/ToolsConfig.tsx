import React, { useState, useEffect } from 'react';
import { Settings, Check, X, RefreshCw, Save } from 'lucide-react';
import { API_CONSTANTS } from '../constants';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface Tool {
  name: string;
  enabled: boolean;
  description: string;
  category: string;
}

interface ToolsConfigProps {
  apiBaseUrl?: string;
}

const ToolsConfig: React.FC<ToolsConfigProps> = ({ apiBaseUrl = '' }) => {
  const [tools, setTools] = useState<Record<string, Tool>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialConfig, setInitialConfig] = useState<Record<string, boolean>>({});

  const fetchTools = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBaseUrl}${API_CONSTANTS.ENDPOINTS.TOOLS_AVAILABLE}`);
      if (!response.ok) throw new Error('Failed to fetch tools');
      
      const data = await response.json();
      setTools(data.tools);
      
      // Store initial configuration for change detection
      const config = Object.fromEntries(
        Object.entries(data.tools).map(([name, tool]) => [name, (tool as Tool).enabled])
      );
      setInitialConfig(config);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTool = (toolName: string) => {
    setTools(prev => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        enabled: !prev[toolName].enabled
      }
    }));
    
    // Check if configuration has changed
    const newEnabled = !tools[toolName].enabled;
    const originalEnabled = initialConfig[toolName];
    
    setHasChanges(Object.entries(tools).some(([name, tool]) => {
      if (name === toolName) return newEnabled !== originalEnabled;
      return tool.enabled !== initialConfig[name];
    }));
  };

  const saveConfiguration = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const config = Object.fromEntries(
        Object.entries(tools).map(([name, tool]) => [name, tool.enabled])
      );
      
      const response = await fetch(`${apiBaseUrl}${API_CONSTANTS.ENDPOINTS.TOOLS_CONFIGURE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) throw new Error('Failed to save configuration');
      
      const result = await response.json();
      console.log('Configuration saved:', result);
      
      // Update initial config to match current state
      setInitialConfig(config);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBaseUrl}${API_CONSTANTS.ENDPOINTS.TOOLS_RESET}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to reset tools');
      
      await fetchTools(); // Reload tools after reset
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset tools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  // Group tools by category
  const toolsByCategory = Object.entries(tools).reduce((acc, [name, tool]) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push({ ...tool, name });
    return acc;
  }, {} as Record<string, (Tool & { name: string })[]>);

  const enabledCount = Object.values(tools).filter(tool => tool.enabled).length;
  const totalCount = Object.keys(tools).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Tool Configuration</h2>
          <Badge variant="secondary">
            {enabledCount}/{totalCount} enabled
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Unsaved changes
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTools}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            disabled={loading}
          >
            Reset All
          </Button>
          {hasChanges && (
            <Button
              onClick={saveConfiguration}
              disabled={loading}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {loading && Object.keys(tools).length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          Loading tools configuration...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
            <Card key={category} className="p-4">
              <h3 className="font-medium mb-3 text-zinc-700 dark:text-zinc-300">
                {category}
              </h3>
              <div className="space-y-3">
                {categoryTools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                          {tool.name}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    <Button
                      variant={tool.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTool(tool.name)}
                      disabled={loading}
                      className={`ml-2 min-w-[80px] ${tool.enabled ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                      {tool.enabled ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          Disabled
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {Object.keys(tools).length > 0 && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          Changes take effect immediately for new conversations. Current conversations may continue using previous tool configuration.
        </div>
      )}
    </div>
  );
};

export default ToolsConfig;