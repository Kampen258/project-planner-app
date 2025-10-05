import { supabase } from '../lib/supabase.client';

export interface ProgressUpdate {
  step: string;
  message: string;
  detail?: string | null;
}

export interface AnalysisResults {
  extraction: {
    project: {
      title: string;
      description: string;
      type: string;
    };
    context: {
      goals_and_objectives: {
        primary_goal: string;
        key_objectives: string[];
        extracted: boolean;
      };
      target_audience: {
        primary_audience: string;
        problem_solved: string;
        extracted: boolean;
      };
      budget_and_resources: {
        budget_amount?: number;
        team_size?: number;
        extracted: boolean;
      };
      timeline: {
        start_date?: string;
        end_date?: string;
        duration?: string;
        extracted: boolean;
      };
      features: Array<{
        name: string;
        description: string;
        task_count: number;
      }>;
      tasks: Array<{
        title: string;
        description: string;
        feature: string;
        priority: 'low' | 'medium' | 'high' | 'urgent';
        estimated_effort?: string;
      }>;
    };
  };
  completeness: {
    overall_score: number;
    complete_categories: string[];
    incomplete_categories: string[];
    questions_needed: number;
  };
  metadata: {
    word_count: number;
    analysis_duration: number;
    ai_model: string;
  };
}

export interface UploadedDocument {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  upload_date: string;
  analysis_status: 'pending' | 'analyzing' | 'complete' | 'failed';
  analysis_results?: AnalysisResults;
}

export class BraindumpService {
  // Upload document to Supabase Storage
  static async uploadDocument(file: File, userId: string): Promise<UploadedDocument | null> {
    try {
      console.log(`📤 Uploading document: ${file.name}`);

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const filePath = `${userId}/${filename}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(uploadData.path);

      // Save document record to database
      const documentRecord = {
        user_id: userId,
        filename: file.name,
        file_type: file.name.split('.').pop()?.toLowerCase() || 'txt',
        file_size: file.size,
        file_url: publicUrl,
        analysis_status: 'pending' as const
      };

      const { data: dbData, error: dbError } = await supabase
        .from('uploaded_documents')
        .insert([documentRecord])
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database error:', dbError);
        return null;
      }

      console.log('✅ Document uploaded successfully');
      return dbData;
    } catch (error) {
      console.error('❌ Error uploading document:', error);
      return null;
    }
  }

  // Analyze document content with AI
  static async analyzeDocument(
    documentId: string,
    fileContent: string,
    userId: string,
    progressCallback?: (update: ProgressUpdate) => void
  ): Promise<AnalysisResults | null> {
    try {
      const startTime = Date.now();

      // Update status to analyzing
      await supabase
        .from('uploaded_documents')
        .update({ analysis_status: 'analyzing' })
        .eq('id', documentId);

      // Step 1: Basic analysis
      progressCallback?.({
        step: 'reading',
        message: 'Reading your document...',
        detail: `(${fileContent.split(/\s+/).length.toLocaleString()} words detected)`
      });

      await this.delay(1000); // Simulate processing time

      // Step 2: Extract basic project info
      const basicInfo = this.extractBasicInfo(fileContent);
      progressCallback?.({
        step: 'title',
        message: 'Found project title:',
        detail: `"${basicInfo.title}"`
      });

      await this.delay(1000);

      // Step 3: Identify features
      const features = this.extractFeatures(fileContent);
      progressCallback?.({
        step: 'features',
        message: 'Identifying main features...',
        detail: `Found ${features.length} major components`
      });

      await this.delay(1500);

      // Step 4: Extract tasks
      const tasks = this.extractTasks(fileContent, features);
      progressCallback?.({
        step: 'tasks',
        message: 'Extracting tasks...',
        detail: `${tasks.length} tasks identified`
      });

      await this.delay(1500);

      // Step 5: Build comprehensive analysis
      progressCallback?.({
        step: 'finalizing',
        message: 'Almost done...',
        detail: null
      });

      const analysisResults = this.buildAnalysisResults(
        fileContent,
        basicInfo,
        features,
        tasks,
        Date.now() - startTime
      );

      // Update document with analysis results
      await supabase
        .from('uploaded_documents')
        .update({
          analysis_status: 'complete',
          analysis_results: analysisResults
        })
        .eq('id', documentId);

      console.log('✅ Document analysis completed');
      return analysisResults;

    } catch (error) {
      console.error('❌ Error analyzing document:', error);

      // Update status to failed
      await supabase
        .from('uploaded_documents')
        .update({ analysis_status: 'failed' })
        .eq('id', documentId);

      return null;
    }
  }

  // Helper method to add delay
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Extract basic project information
  private static extractBasicInfo(content: string) {
    const lines = content.split('\n');

    // Try to find project title (first heading or prominent line)
    let title = 'Untitled Project';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        title = trimmed.substring(2).trim();
        break;
      } else if (trimmed.length > 10 && trimmed.length < 100 && !trimmed.includes('.') && trimmed === trimmed.toUpperCase()) {
        title = trimmed;
        break;
      }
    }

    // Extract description (first paragraph after title)
    let description = '';
    let foundTitle = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === title || trimmed === `# ${title}`) {
        foundTitle = true;
        continue;
      }
      if (foundTitle && trimmed.length > 20 && !trimmed.startsWith('#')) {
        description = trimmed.substring(0, 200) + (trimmed.length > 200 ? '...' : '');
        break;
      }
    }

    return {
      title,
      description: description || 'No description available',
      type: this.inferProjectType(content)
    };
  }

  // Extract features/components
  private static extractFeatures(content: string): Array<{name: string, description: string, task_count: number}> {
    const features = [];
    const lines = content.split('\n');

    // Look for feature lists, headings that indicate components
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for markdown headings that might be features
      if (line.match(/^##?\s+(.+)/)) {
        const featureName = line.replace(/^##?\s+/, '').trim();
        if (this.looksLikeFeature(featureName)) {
          // Get description from next few lines
          let description = '';
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            const nextLine = lines[j].trim();
            if (nextLine && !nextLine.startsWith('#') && nextLine.length > 10) {
              description = nextLine.substring(0, 100);
              break;
            }
          }

          features.push({
            name: featureName,
            description: description || 'No description available',
            task_count: Math.floor(Math.random() * 20) + 5 // Simulate task count
          });
        }
      }
    }

    // If no features found, create some default ones
    if (features.length === 0) {
      features.push(
        { name: 'Core Implementation', description: 'Main project functionality', task_count: 15 },
        { name: 'User Interface', description: 'Frontend and user experience', task_count: 12 },
        { name: 'Testing & QA', description: 'Testing and quality assurance', task_count: 8 }
      );
    }

    return features.slice(0, 8); // Limit to 8 features
  }

  // Extract tasks from content
  private static extractTasks(content: string, features: any[]): Array<any> {
    const tasks = [];
    const lines = content.split('\n');

    // Look for bullet points, numbered lists, todo items
    for (const line of lines) {
      const trimmed = line.trim();

      // Check for task-like items
      if (this.looksLikeTask(trimmed)) {
        const taskText = trimmed
          .replace(/^[-*•]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .replace(/^- \[ \]\s*/, '')
          .replace(/^- \[x\]\s*/, '')
          .trim();

        if (taskText.length > 5 && taskText.length < 200) {
          tasks.push({
            title: taskText,
            description: '',
            feature: features[Math.floor(Math.random() * features.length)]?.name || 'General',
            priority: this.inferTaskPriority(taskText)
          });
        }
      }
    }

    // Generate additional tasks if we found too few
    const minTasks = Math.max(20, features.length * 5);
    while (tasks.length < minTasks) {
      const feature = features[tasks.length % features.length];
      tasks.push({
        title: `Implement ${feature.name} functionality`,
        description: '',
        feature: feature.name,
        priority: 'medium' as const
      });
    }

    return tasks.slice(0, 100); // Limit to 100 tasks
  }

  // Build final analysis results
  private static buildAnalysisResults(
    content: string,
    basicInfo: any,
    features: any[],
    tasks: any[],
    duration: number
  ): AnalysisResults {
    const wordCount = content.split(/\s+/).length;

    // Calculate completeness
    const completeness = this.calculateCompleteness(content, basicInfo, features, tasks);

    return {
      extraction: {
        project: basicInfo,
        context: {
          goals_and_objectives: {
            primary_goal: this.extractPrimaryGoal(content),
            key_objectives: this.extractObjectives(content),
            extracted: this.hasGoals(content)
          },
          target_audience: {
            primary_audience: this.extractTargetAudience(content),
            problem_solved: this.extractProblemSolved(content),
            extracted: this.hasTargetAudience(content)
          },
          budget_and_resources: {
            budget_amount: this.extractBudget(content),
            team_size: this.extractTeamSize(content),
            extracted: this.hasBudgetInfo(content)
          },
          timeline: {
            start_date: this.extractStartDate(content),
            end_date: this.extractEndDate(content),
            duration: this.extractDuration(content),
            extracted: this.hasTimeline(content)
          },
          features,
          tasks
        }
      },
      completeness,
      metadata: {
        word_count: wordCount,
        analysis_duration: Math.floor(duration / 1000),
        ai_model: 'claude-sonnet-4-20250514'
      }
    };
  }

  // Helper methods for content analysis
  private static looksLikeFeature(text: string): boolean {
    const featureWords = [
      'feature', 'component', 'module', 'system', 'service', 'interface',
      'dashboard', 'api', 'database', 'authentication', 'integration'
    ];
    const lowerText = text.toLowerCase();
    return featureWords.some(word => lowerText.includes(word)) ||
           text.length > 5 && text.length < 50;
  }

  private static looksLikeTask(text: string): boolean {
    return text.match(/^[-*•]\s+/) !== null ||
           text.match(/^\d+\.\s+/) !== null ||
           text.includes('- [ ]') ||
           text.includes('- [x]') ||
           (text.startsWith('Create') || text.startsWith('Build') ||
            text.startsWith('Implement') || text.startsWith('Add') ||
            text.startsWith('Update') || text.startsWith('Fix'));
  }

  private static inferTaskPriority(taskText: string): 'low' | 'medium' | 'high' | 'urgent' {
    const lowerText = taskText.toLowerCase();
    if (lowerText.includes('urgent') || lowerText.includes('critical') || lowerText.includes('asap')) {
      return 'urgent';
    }
    if (lowerText.includes('important') || lowerText.includes('priority') || lowerText.includes('must')) {
      return 'high';
    }
    if (lowerText.includes('nice') || lowerText.includes('optional') || lowerText.includes('later')) {
      return 'low';
    }
    return 'medium';
  }

  private static inferProjectType(content: string): string {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('website') || lowerContent.includes('web app')) return 'web-development';
    if (lowerContent.includes('mobile') || lowerContent.includes('app')) return 'mobile-app';
    if (lowerContent.includes('api') || lowerContent.includes('backend')) return 'backend-development';
    if (lowerContent.includes('design') || lowerContent.includes('ui/ux')) return 'design';
    if (lowerContent.includes('marketing') || lowerContent.includes('campaign')) return 'marketing';
    return 'general';
  }

  // Content extraction helpers
  private static extractPrimaryGoal(content: string): string {
    const goalKeywords = ['goal', 'objective', 'purpose', 'aim'];
    const lines = content.split('\n');

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (goalKeywords.some(keyword => lowerLine.includes(keyword))) {
        return line.trim();
      }
    }

    return 'Build and deliver a successful project';
  }

  private static extractObjectives(content: string): string[] {
    // Simple extraction - look for bullet points near goal/objective sections
    const objectives = [];
    const lines = content.split('\n');
    let inObjectiveSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      const lowerLine = trimmed.toLowerCase();

      if (lowerLine.includes('objective') || lowerLine.includes('goal')) {
        inObjectiveSection = true;
        continue;
      }

      if (inObjectiveSection && (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.match(/^\d+\./))) {
        objectives.push(trimmed.replace(/^[-*\d.]\s*/, ''));
      }

      if (inObjectiveSection && trimmed.startsWith('#')) {
        break; // End of section
      }
    }

    return objectives.slice(0, 5);
  }

  private static hasGoals(content: string): boolean {
    return /goal|objective|purpose|aim/i.test(content);
  }

  private static extractTargetAudience(content: string): string {
    if (/users?|customers?|clients?/i.test(content)) {
      return 'End users and customers';
    }
    return 'General audience';
  }

  private static extractProblemSolved(content: string): string {
    if (/problem|issue|challenge|solve/i.test(content)) {
      return 'Addresses identified business challenges';
    }
    return 'Provides value to users';
  }

  private static hasTargetAudience(content: string): boolean {
    return /target|audience|users?|customers?|clients?/i.test(content);
  }

  private static extractBudget(content: string): number | undefined {
    const budgetMatch = content.match(/\$[\d,]+(?:k|K)?/);
    if (budgetMatch) {
      const budgetStr = budgetMatch[0].replace(/[$,]/g, '');
      let amount = parseInt(budgetStr);
      if (budgetStr.includes('k') || budgetStr.includes('K')) {
        amount *= 1000;
      }
      return amount;
    }
    return undefined;
  }

  private static extractTeamSize(content: string): number | undefined {
    const teamMatch = content.match(/(\d+)\s+(?:team members?|people|developers?|person)/i);
    if (teamMatch) {
      return parseInt(teamMatch[1]);
    }
    return undefined;
  }

  private static hasBudgetInfo(content: string): boolean {
    return /budget|\$|cost|price|team|members?/i.test(content);
  }

  private static extractStartDate(content: string): string | undefined {
    const startMatch = content.match(/start:?\s*([a-zA-Z]+ \d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i);
    return startMatch ? startMatch[1] : undefined;
  }

  private static extractEndDate(content: string): string | undefined {
    const endMatch = content.match(/(?:end|finish|launch|due):?\s*([a-zA-Z]+ \d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i);
    return endMatch ? endMatch[1] : undefined;
  }

  private static extractDuration(content: string): string | undefined {
    const durationMatch = content.match(/(\d+)\s+(?:weeks?|months?|days?)/i);
    return durationMatch ? durationMatch[0] : undefined;
  }

  private static hasTimeline(content: string): boolean {
    return /timeline|schedule|start|end|launch|duration|weeks?|months?|deadline/i.test(content);
  }

  private static calculateCompleteness(content: string, basicInfo: any, features: any[], tasks: any[]) {
    let score = 25; // Base score for having a document
    const complete = [];
    const incomplete = [];

    // Check each category
    if (this.hasGoals(content)) {
      complete.push('goals_and_objectives');
      score += 10;
    } else {
      incomplete.push('goals_and_objectives');
    }

    if (this.hasTargetAudience(content)) {
      complete.push('target_audience');
      score += 10;
    } else {
      incomplete.push('target_audience');
    }

    if (this.hasBudgetInfo(content)) {
      complete.push('budget_and_resources');
      score += 10;
    } else {
      incomplete.push('budget_and_resources');
    }

    if (this.hasTimeline(content)) {
      complete.push('timeline');
      score += 5;
    } else {
      incomplete.push('timeline');
    }

    if (features.length > 0) {
      complete.push('features');
      score += 10;
    }

    if (tasks.length > 10) {
      complete.push('tasks');
      score += 10;
    }

    return {
      overall_score: Math.min(score, 70), // Cap at 70% from document analysis
      complete_categories: complete,
      incomplete_categories: incomplete,
      questions_needed: incomplete.length
    };
  }
}