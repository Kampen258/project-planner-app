import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';
import FileUploadComponent from './FileUploadComponent';
import AnalysisProgressComponent from './AnalysisProgressComponent';
import ResultsPresentationComponent from './ResultsPresentationComponent';
import ReviewInterfaceComponent from './ReviewInterfaceComponent';
import { BraindumpService, type AnalysisResults, type ProgressUpdate, type UploadedDocument } from '../../services/braindumpService';

type BraindumpStep =
  | 'upload'
  | 'analyzing'
  | 'results'
  | 'review'
  | 'interview'
  | 'organization'
  | 'creation';

const BraindumpOrchestrator: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [currentStep, setCurrentStep] = useState<BraindumpStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    setUploadedFile(file);

    try {
      // Upload file to Supabase Storage
      const document = await BraindumpService.uploadDocument(file, user.id);

      if (!document) {
        throw new Error('Failed to upload document');
      }

      setUploadedDocument(document);

      // Start analysis
      setCurrentStep('analyzing');

      // Read file content for analysis
      const fileContent = await file.text();

      // Analyze document with progress updates
      const results = await BraindumpService.analyzeDocument(
        document.id,
        fileContent,
        user.id,
        (update: ProgressUpdate) => {
          setProgressUpdates(prev => [...prev, update]);
        }
      );

      if (results) {
        setAnalysisResults(results);
        setIsAnalysisComplete(true);
      } else {
        throw new Error('Analysis failed');
      }

    } catch (error) {
      console.error('Error in braindump process:', error);
      // Handle error - could show error component
    }
  }, [user]);

  // Handle analysis completion
  const handleAnalysisComplete = useCallback(() => {
    setCurrentStep('results');
  }, []);

  // Handle results navigation
  const handleReviewEverything = useCallback(() => {
    setCurrentStep('review');
  }, []);

  const handleContinueToInterview = useCallback(() => {
    if (!analysisResults?.completeness.incomplete_categories.length) {
      // No questions needed, go straight to creation
      handleCreateProject();
    } else {
      setCurrentStep('interview');
    }
  }, [analysisResults]);

  // Handle review navigation
  const handleContinueToQuestions = useCallback(() => {
    if (!analysisResults?.completeness.incomplete_categories.length) {
      // No questions needed, go straight to creation
      handleCreateProject();
    } else {
      setCurrentStep('interview');
    }
  }, [analysisResults]);

  const handleEditMore = useCallback(() => {
    // For now, just go back to results
    setCurrentStep('results');
  }, []);

  // Handle project creation
  const handleCreateProject = useCallback(async () => {
    if (!analysisResults || !user) return;

    try {
      // Create project using extracted data
      const { ProjectService } = await import('../../services/projectService');

      const projectData = {
        title: analysisResults.extraction.project.title,
        description: analysisResults.extraction.project.description,
        status: 'planning' as const,
        user_id: user.id,
        created_via: 'braindump' as const,
        source_document_id: uploadedDocument?.id,
        initial_success_score: analysisResults.completeness.overall_score,
        metadata: {
          priority: 'medium' as const,
          project_type: analysisResults.extraction.project.type,
          features_count: analysisResults.extraction.context.features.length,
          tasks_count: analysisResults.extraction.context.tasks.length,
          word_count: analysisResults.metadata.word_count
        }
      };

      const createdProject = await ProjectService.createProject(projectData);

      if (createdProject) {
        // Create tasks if they were extracted
        if (analysisResults.extraction.context.tasks.length > 0) {
          const { TaskService } = await import('../../services/taskService');

          for (const task of analysisResults.extraction.context.tasks.slice(0, 50)) { // Limit to 50 tasks
            const taskData = {
              name: task.title,
              description: task.description || '',
              project_id: createdProject.id,
              user_id: user.id,
              priority: task.priority,
              status: 'todo' as const,
              order_index: 0
            };

            await TaskService.createTask(taskData);
          }
        }

        console.log('✅ Project and tasks created successfully');

        // Navigate to the new project
        navigate(`/projects/${createdProject.id}`);
      } else {
        throw new Error('Failed to create project');
      }

    } catch (error) {
      console.error('Error creating project:', error);
      // Handle error
    }
  }, [analysisResults, user, uploadedDocument, navigate]);

  // Handle cancel/back navigation
  const handleCancel = useCallback(() => {
    navigate('/projects/new');
  }, [navigate]);

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <FileUploadComponent
            onFileUpload={handleFileUpload}
            onCancel={handleCancel}
            isUploading={!!uploadedFile && !uploadedDocument}
          />
        );

      case 'analyzing':
        return (
          <AnalysisProgressComponent
            updates={progressUpdates}
            onComplete={handleAnalysisComplete}
            isComplete={isAnalysisComplete}
          />
        );

      case 'results':
        if (!analysisResults) return <div>Loading...</div>;
        return (
          <ResultsPresentationComponent
            results={analysisResults}
            onReviewEverything={handleReviewEverything}
            onContinueToInterview={handleContinueToInterview}
          />
        );

      case 'review':
        if (!analysisResults) return <div>Loading...</div>;
        return (
          <ReviewInterfaceComponent
            results={analysisResults}
            onContinueToQuestions={handleContinueToQuestions}
            onEditMore={handleEditMore}
            onUpdateResults={(updatedResults) => setAnalysisResults(updatedResults)}
          />
        );

      case 'interview':
        // TODO: Implement chat interview component
        return (
          <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Interview Component</h2>
              <p className="text-white/80 mb-6">Chat interview functionality coming soon!</p>
              <button
                onClick={handleCreateProject}
                className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 px-6 py-3 rounded-xl transition-colors font-medium border border-blue-400/30"
              >
                Skip Interview & Create Project
              </button>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return renderCurrentStep();
};

export default BraindumpOrchestrator;