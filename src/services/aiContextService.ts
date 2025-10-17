import { supabase } from '../lib/supabase';
import { User, Project, Task } from '../types';
// import { Document } from './documentService'; // Temporarily disabled until DB migration

// Temporary interface until migration
interface Document {
  id: string;
  title: string;
  document_type: string;
  project_id: string;
}

export interface UserContext {
  user: User;
  projects: Project[];
  tasks: Task[];
  overdueTasks: Task[];
  upcomingTasks: Task[];
  documents: Document[];
  workload: {
    totalActiveTasks: number;
    highPriorityTasks: number;
    overdueTasks: number;
  };
  patterns?: {
    mostProductiveTime?: string;
    averageTaskCompletionTime?: number;
    preferredTaskPriority?: 'low' | 'medium' | 'high';
  };
}

export class AIContextService {
  async buildUserContext(userId: string): Promise<UserContext> {
    try {
      // Get user info
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!user) throw new Error('User not found');

      // Get active projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['planning', 'in_progress'])
        .order('updated_at', { ascending: false });

      // Get all active tasks
      const { data: allTasks } = await supabase
        .from('tasks')
        .select(`
          *,
          projects:project_id (title)
        `)
        .eq('user_id', userId)
        .neq('status', 'done')
        .order('due_date', { ascending: true });

      const tasks = allTasks || [];

      // Categorize tasks
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const overdueTasks = tasks.filter(task =>
        task.due_date && task.due_date < today
      );

      const upcomingTasks = tasks.filter(task =>
        task.due_date && task.due_date >= today && task.due_date <= nextWeek
      );

      // Get project documents (temporarily disabled until DB migration)
      // const { data: documents } = await supabase
      //   .from('documents')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .eq('status', 'active')
      //   .order('created_at', { ascending: false });
      const documents: Document[] = []; // Temporary empty array

      // Calculate workload metrics
      const workload = {
        totalActiveTasks: tasks.length,
        highPriorityTasks: tasks.filter(task => task.priority === 'high').length,
        overdueTasks: overdueTasks.length
      };

      return {
        user,
        projects: projects || [],
        tasks,
        overdueTasks,
        upcomingTasks,
        documents: documents,
        workload
      };
    } catch (error) {
      console.error('Error building user context:', error);
      throw error;
    }
  }

  formatContextForAI(context: UserContext): string {
    const { user, projects, tasks, overdueTasks, upcomingTasks, documents, workload } = context;
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let prompt = `You are an AI assistant helping ${user.email} manage their projects and tasks.

TODAY: ${today}
USER: ${user.email} (${user.subscription_tier} subscription)

CURRENT WORKLOAD:
• ${workload.totalActiveTasks} active tasks
• ${workload.highPriorityTasks} high priority tasks
• ${workload.overdueTasks} overdue tasks

ACTIVE PROJECTS (${projects.length}):`;

    projects.slice(0, 10).forEach(project => {
      const projectTasks = tasks.filter(task => task.project_id === project.id);
      prompt += `\n• "${project.title}" (${project.status})
  Progress: ${project.progress}%
  Active tasks: ${projectTasks.length}`;
      if (project.due_date) {
        prompt += `\n  Due: ${new Date(project.due_date).toLocaleDateString()}`;
      }
    });

    if (overdueTasks.length > 0) {
      prompt += `\n\n⚠️ OVERDUE TASKS (${overdueTasks.length}):`;
      overdueTasks.slice(0, 5).forEach(task => {
        const project = projects.find(p => p.id === task.project_id);
        prompt += `\n• [${task.priority}] "${task.title}" - Due: ${new Date(task.due_date!).toLocaleDateString()}`;
        if (project) prompt += ` (${project.title})`;
      });
    }

    if (upcomingTasks.length > 0) {
      prompt += `\n\nUPCOMING TASKS (${upcomingTasks.length}):`;
      upcomingTasks.slice(0, 10).forEach(task => {
        const project = projects.find(p => p.id === task.project_id);
        prompt += `\n• [${task.priority}] "${task.title}" - Due: ${new Date(task.due_date!).toLocaleDateString()}`;
        if (project) prompt += ` (${project.title})`;
      });
    }

    // Add document information
    if (documents.length > 0) {
      prompt += `\n\nPROJECT DOCUMENTS (${documents.length}):`;
      const docsByProject = documents.reduce((acc, doc) => {
        const project = projects.find(p => p.id === doc.project_id);
        const projectName = project?.title || 'Unknown Project';
        if (!acc[projectName]) acc[projectName] = [];
        acc[projectName].push(doc);
        return acc;
      }, {} as Record<string, any[]>);

      Object.entries(docsByProject).forEach(([projectName, projectDocs]) => {
        prompt += `\n• ${projectName}:`;
        projectDocs.forEach(doc => {
          prompt += `\n  - ${doc.title} (${doc.document_type})`;
        });
      });
    }

    prompt += `\n\nCAPABILITIES:
I can help you:
• Create, update, and organize tasks
• Manage project timelines and priorities
• Break down complex projects into actionable tasks
• Analyze your workload and suggest optimizations
• Provide project status updates and insights
• Identify potential blockers or scheduling conflicts

DOCUMENT MANAGEMENT:
• Create Definition of Done (DoD) documents for projects
• Create Definition of Ready (DoR) documents for projects
• Generate Project Charters and planning documents
• Check tasks against DoD compliance
• Suggest improvements based on project type
• Help establish project standards and processes

Be proactive about mentioning overdue tasks, high workload, or scheduling conflicts.
Always ask for clarification when project or task details are ambiguous.
Suggest realistic timelines based on current workload.
When users mention quality issues or unclear requirements, suggest creating DoD/DoR documents.`;

    return prompt;
  }

  async getProjectDetails(projectId: string): Promise<{ project: Project; tasks: Task[] } | null> {
    try {
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (!project) return null;

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      return {
        project,
        tasks: tasks || []
      };
    } catch (error) {
      console.error('Error getting project details:', error);
      return null;
    }
  }

  async analyzeWorkload(userId: string, timeframeDays: number = 7): Promise<{
    totalTasks: number;
    tasksByPriority: Record<string, number>;
    tasksByProject: Record<string, number>;
    estimatedHours: number;
    recommendations: string[];
  }> {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + timeframeDays);

      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          *,
          projects:project_id (title)
        `)
        .eq('user_id', userId)
        .neq('status', 'done')
        .or(`due_date.is.null,due_date.lte.${endDate.toISOString().split('T')[0]}`);

      if (!tasks) return {
        totalTasks: 0,
        tasksByPriority: {},
        tasksByProject: {},
        estimatedHours: 0,
        recommendations: []
      };

      const tasksByPriority = tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const tasksByProject = tasks.reduce((acc, task) => {
        const projectName = (task.projects as any)?.title || 'Unknown Project';
        acc[projectName] = (acc[projectName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Simple estimation: high=4h, medium=2h, low=1h
      const estimatedHours = tasks.reduce((acc, task) => {
        const hours = task.priority === 'high' ? 4 : task.priority === 'medium' ? 2 : 1;
        return acc + hours;
      }, 0);

      const recommendations: string[] = [];
      if (tasksByPriority.high > 5) {
        recommendations.push('You have many high-priority tasks. Consider if some can be reduced to medium priority.');
      }
      if (estimatedHours > timeframeDays * 8) {
        recommendations.push(`Your estimated workload (${estimatedHours}h) exceeds available time. Consider extending deadlines or redistributing tasks.`);
      }
      if (Object.keys(tasksByProject).length > 3) {
        recommendations.push('You\'re working on many projects simultaneously. Consider focusing on fewer projects at a time.');
      }

      return {
        totalTasks: tasks.length,
        tasksByPriority,
        tasksByProject,
        estimatedHours,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing workload:', error);
      throw error;
    }
  }
}

export const aiContextService = new AIContextService();