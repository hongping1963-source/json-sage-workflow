import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import axios from 'axios';

function App() {
  const [jsonInput, setJsonInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await axios.post('http://localhost:5000/api/analyze', {
        json: jsonInput
      });

      if (response.data.status === 'success') {
        setResult(response.data.result);
      } else {
        setError(response.data.message || 'Analysis failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisResult = () => {
    if (!result) return null;

    return (
      <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>Analysis Result:</Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Type:</strong> {result.type}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>Structure:</strong>
        </Typography>
        <Box sx={{ pl: 2 }}>
          {result.structure.type === 'object' && (
            <>
              <Typography>• Properties: {result.structure.properties}</Typography>
              <Typography>• Keys: {result.structure.keys.join(', ')}</Typography>
            </>
          )}
          {result.structure.type === 'array' && (
            <>
              <Typography>• Length: {result.structure.length}</Typography>
              <Typography>• Sample Types: {result.structure.sample_types.join(', ')}</Typography>
            </>
          )}
        </Box>

        {result.insights.length > 0 && (
          <>
            <Typography variant="body1" sx={{ mt: 2 }} gutterBottom>
              <strong>Insights:</strong>
            </Typography>
            <Box sx={{ pl: 2 }}>
              {result.insights.map((insight, index) => (
                <Typography key={index}>• {insight}</Typography>
              ))}
            </Box>
          </>
        )}
      </Paper>
    );
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          JsonSage AI Agent
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={10}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Enter your JSON here..."
          sx={{ mb: 2 }}
          error={!!error}
        />
        
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button 
            variant="contained" 
            onClick={handleAnalyze}
            disabled={loading || !jsonInput.trim()}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze JSON'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderAnalysisResult()}

        <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6" gutterBottom>External Resources:</Typography>
          <Link href="https://www.npmjs.com/settings/zhanghongping/packages" target="_blank" sx={{ display: 'block', mb: 1 }}>
            NPM Package
          </Link>
          <Link href="https://github.com/hongping1963-source/json-sage-workflow" target="_blank">
            GitHub Repository
          </Link>
        </Paper>
      </Box>
    </Container>
  );
}

export default App;
