import { supabase } from '../lib/supabase';

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  default_structure: any;
  is_system: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  project_id: string;
  template_id?: string;
  title: string;
  document_type: string;
  content: any;
  version: number;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  document_id: string;
  item_text: string;
  category?: string;
  is_required: boolean;
  sort_order: number;
  created_at: string;
}

export interface TaskChecklistStatus {
  id: string;
  task_id: string;
  checklist_item_id: string;
  is_completed: boolean;
  notes?: string;
  completed_at?: string;
  completed_by?: string;
}

export class DocumentService {
  // Get all available templates
  async getTemplates(): Promise<DocumentTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  // Create a document from template
  async createDocumentFromTemplate(
    userId: string,
    projectId: string,
    templateType: string,
    title?: string,
    customizations?: any
  ): Promise<{ success: boolean; document?: Document; message?: string; error?: string }> {
    try {
      // Get the template
      const { data: template, error: templateError } = await supabase
        .from('document_templates')
        .select('*')
        .eq('category', templateType)
        .eq('is_system', true)
        .single();

      if (templateError || !template) {
        return { success: false, error: 'Template not found' };
      }

      // Get project name for default title
      const { data: project } = await supabase
        .from('projects')
        .select('title')
        .eq('id', projectId)
        .single();

      const docTitle = title || `${template.name} - ${project?.title || 'Project'}`;

      // Start with template structure
      let content = { ...template.default_structure };

      // Apply customizations if provided
      if (customizations) {
        content = this.applyCustomizations(content, customizations);
      }

      // Create the document
      const { data: document, error } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          project_id: projectId,
          template_id: template.id,
          title: docTitle,
          document_type: templateType,
          content,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      // Create checklist items if it's a DoD/DoR type document
      if (templateType === 'dod' || templateType === 'dor') {
        await this.createChecklistItems(document.id, content);
      }

      // Create version history entry
      await this.createVersionHistory(document.id, 1, content, 'Initial creation', 'ai');

      return {
        success: true,
        document,
        message: `Created ${template.name} document successfully`
      };
    } catch (error) {
      console.error('Error creating document from template:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get documents for a project
  async getProjectDocuments(projectId: string, documentType?: string): Promise<Document[]> {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId);

      if (documentType) {
        query = query.eq('document_type', documentType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching project documents:', error);
      return [];
    }
  }

  // Update document section
  async updateDocumentSection(
    documentId: string,
    sectionName: string,
    action: 'add_item' | 'remove_item' | 'update_item' | 'reorder',
    content: any
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Get current document
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        return { success: false, error: 'Document not found' };
      }

      let updatedContent = { ...document.content };
      const section = updatedContent.sections?.find((s: any) => s.title === sectionName);

      if (!section) {
        return { success: false, error: 'Section not found' };
      }

      // Perform the requested action
      switch (action) {
        case 'add_item':
          if (!section.items) section.items = [];
          section.items.push(content.item);
          break;

        case 'remove_item':
          if (section.items) {
            section.items = section.items.filter((_: any, index: number) => index !== content.index);
          }
          break;

        case 'update_item':
          if (section.items && section.items[content.index]) {
            section.items[content.index] = content.item;
          }
          break;

        case 'reorder':
          if (section.items) {
            const [movedItem] = section.items.splice(content.fromIndex, 1);
            section.items.splice(content.toIndex, 0, movedItem);
          }
          break;
      }

      // Update the document
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          content: updatedContent,
          version: document.version + 1
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      // Create version history
      await this.createVersionHistory(
        documentId,
        document.version + 1,
        updatedContent,
        `${action} in section: ${sectionName}`,
        'user'
      );

      // Update checklist items if it's a DoD/DoR document
      if (document.document_type === 'dod' || document.document_type === 'dor') {
        await this.updateChecklistItems(documentId, updatedContent);
      }

      return {
        success: true,
        message: 'Document updated successfully'
      };
    } catch (error) {
      console.error('Error updating document section:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate contextual suggestions
  generateDocumentSuggestions(documentType: string, projectContext: string): {
    suggestions: string[];
    message: string;
  } {
    const suggestions: string[] = [];

    // Web/Frontend project suggestions
    if (projectContext.toLowerCase().includes('web') ||
        projectContext.toLowerCase().includes('frontend') ||
        projectContext.toLowerCase().includes('react') ||
        projectContext.toLowerCase().includes('vue') ||
        projectContext.toLowerCase().includes('angular')) {

      if (documentType === 'dod') {
        suggestions.push(
          'Cross-browser testing completed (Chrome, Firefox, Safari, Edge)',
          'Responsive design verified on mobile, tablet, and desktop',
          'Lighthouse score meets minimum thresholds (Performance, Accessibility, SEO)',
          'No console errors in production build',
          'Images optimized and lazy-loaded where appropriate',
          'SEO meta tags properly configured',
          'Analytics tracking implemented'
        );
      } else if (documentType === 'dor') {
        suggestions.push(
          'Design mockups approved by design team',
          'API endpoints documented and available',
          'Component dependencies identified',
          'Browser compatibility requirements defined',
          'Performance budget established'
        );
      }
    }

    // Mobile app suggestions
    if (projectContext.toLowerCase().includes('mobile') ||
        projectContext.toLowerCase().includes('ios') ||
        projectContext.toLowerCase().includes('android') ||
        projectContext.toLowerCase().includes('react native') ||
        projectContext.toLowerCase().includes('flutter')) {

      if (documentType === 'dod') {
        suggestions.push(
          'Tested on multiple device sizes and orientations',
          'App store guidelines compliance verified',
          'Offline functionality tested (if applicable)',
          'Push notification delivery confirmed',
          'App performance within acceptable memory limits',
          'Accessibility features implemented'
        );
      } else if (documentType === 'dor') {
        suggestions.push(
          'Target device specifications defined',
          'Native features integration requirements clear',
          'App store submission requirements understood',
          'Device permissions clearly defined'
        );
      }
    }

    // Backend/API project suggestions
    if (projectContext.toLowerCase().includes('backend') ||
        projectContext.toLowerCase().includes('api') ||
        projectContext.toLowerCase().includes('server') ||
        projectContext.toLowerCase().includes('microservice')) {

      if (documentType === 'dod') {
        suggestions.push(
          'API documentation updated (OpenAPI/Swagger)',
          'All endpoints properly authenticated and authorized',
          'Database migrations tested',
          'Error handling and logging implemented',
          'Performance benchmarks met',
          'Security vulnerabilities scanned',
          'Load testing completed'
        );
      } else if (documentType === 'dor') {
        suggestions.push(
          'API contract defined and agreed upon',
          'Database schema changes planned',
          'Security requirements identified',
          'Error handling strategy defined',
          'Monitoring and logging requirements clear'
        );
      }
    }

    // Data/ML project suggestions
    if (projectContext.toLowerCase().includes('data') ||
        projectContext.toLowerCase().includes('ml') ||
        projectContext.toLowerCase().includes('machine learning') ||
        projectContext.toLowerCase().includes('ai') ||
        projectContext.toLowerCase().includes('analytics')) {

      if (documentType === 'dod') {
        suggestions.push(
          'Model performance metrics meet baseline requirements',
          'Data validation checks implemented',
          'Model documented (architecture, training data, hyperparameters)',
          'Inference latency within acceptable limits',
          'Model versioning and tracking configured',
          'Data privacy and compliance requirements met',
          'Model bias testing completed'
        );
      } else if (documentType === 'dor') {
        suggestions.push(
          'Training data availability confirmed',
          'Model requirements and constraints defined',
          'Performance metrics and success criteria established',
          'Data quality requirements specified',
          'Computational resources allocated'
        );
      }
    }

    return {
      suggestions,
      message: `Generated ${suggestions.length} contextual suggestions based on your ${projectContext.toLowerCase()} project`
    };
  }

  // Check task against DoD
  async checkTaskAgainstDoD(taskId: string, dodDocumentId: string): Promise<{
    task_id: string;
    task_title: string;
    dod_compliance: number;
    total_items: number;
    completed_items: number;
    can_mark_done: boolean;
    checklist: any[];
    summary: string;
  } | null> {
    try {
      // Get task details
      const { data: task } = await supabase
        .from('tasks')
        .select('title')
        .eq('id', taskId)
        .single();

      if (!task) return null;

      // Get DoD checklist items
      const { data: checklistItems } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('document_id', dodDocumentId)
        .order('sort_order');

      if (!checklistItems) return null;

      // Get completion status for each item
      const { data: completionStatus } = await supabase
        .from('task_checklist_status')
        .select('*')
        .eq('task_id', taskId);

      const statusMap = new Map(
        (completionStatus || []).map(status => [status.checklist_item_id, status])
      );

      // Build results
      const results = checklistItems.map(item => {
        const status = statusMap.get(item.id);
        return {
          item: item.item_text,
          category: item.category,
          is_required: item.is_required,
          is_completed: status?.is_completed || false,
          notes: status?.notes || null
        };
      });

      const totalItems = checklistItems.length;
      const completedItems = results.filter(r => r.is_completed).length;
      const completionPercentage = totalItems > 0 ? (completedItems / totalItems * 100) : 0;
      const canMarkDone = results.every(r => !r.is_required || r.is_completed);

      return {
        task_id: taskId,
        task_title: task.title,
        dod_compliance: Math.round(completionPercentage),
        total_items: totalItems,
        completed_items: completedItems,
        can_mark_done: canMarkDone,
        checklist: results,
        summary: `Task is ${Math.round(completionPercentage)}% compliant with Definition of Done`
      };
    } catch (error) {
      console.error('Error checking task against DoD:', error);
      return null;
    }
  }

  // Helper methods
  private applyCustomizations(content: any, customizations: any): any {
    // Deep merge customizations with content
    return { ...content, ...customizations };
  }

  private async createChecklistItems(documentId: string, content: any): Promise<void> {
    if (!content.sections) return;

    const items = [];
    let sortOrder = 0;

    for (const section of content.sections) {
      if (section.items) {
        for (const item of section.items) {
          items.push({
            document_id: documentId,
            item_text: item,
            category: section.title,
            is_required: true,
            sort_order: sortOrder++
          });
        }
      }
    }

    if (items.length > 0) {
      const { error } = await supabase
        .from('checklist_items')
        .insert(items);

      if (error) {
        console.error('Error creating checklist items:', error);
      }
    }
  }

  private async updateChecklistItems(documentId: string, content: any): Promise<void> {
    // Delete existing items
    await supabase
      .from('checklist_items')
      .delete()
      .eq('document_id', documentId);

    // Create new items
    await this.createChecklistItems(documentId, content);
  }

  private async createVersionHistory(
    documentId: string,
    versionNumber: number,
    content: any,
    changesSummary: string,
    createdBy: string
  ): Promise<void> {
    const { error } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: versionNumber,
        content,
        changes_summary: changesSummary,
        created_by: createdBy
      });

    if (error) {
      console.error('Error creating version history:', error);
    }
  }
}

export const documentService = new DocumentService();