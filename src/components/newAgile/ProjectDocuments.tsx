import React, { useState, useEffect } from 'react';
import { documentService, type Document, type DocumentTemplate } from '../../services/documentService';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface ProjectDocumentsProps {
  projectId: string;
  projectName: string;
  className?: string;
}

type DocumentTypeFilter = 'all' | 'dod' | 'dor' | 'requirements' | 'architecture' | 'testing' | 'deployment';

const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({
  projectId,
  projectName,
  className = ''
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<DocumentTypeFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
    loadTemplates();
  }, [projectId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getProjectDocuments(projectId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      // Use mock documents for demo
      setDocuments(getMockDocuments());
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const temps = await documentService.getTemplates();
      setTemplates(temps);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Use mock templates for demo
      setTemplates(getMockTemplates());
    }
  };

  const getMockDocuments = (): Document[] => {
    return [
      {
        id: `${projectId}-doc-1`,
        user_id: user?.id || 'user1',
        project_id: projectId,
        template_id: 'dod-template-1',
        title: 'Definition of Done',
        document_type: 'dod',
        content: {
          sections: [
            {
              title: 'Code Quality',
              items: [
                'Code has been reviewed by at least one peer',
                'Unit tests written with >80% coverage',
                'Code follows established coding standards',
                'No critical or high severity security vulnerabilities'
              ]
            },
            {
              title: 'Testing',
              items: [
                'All acceptance criteria have been met',
                'Manual testing completed in staging environment',
                'Cross-browser compatibility verified',
                'Performance requirements validated'
              ]
            },
            {
              title: 'Documentation',
              items: [
                'API documentation updated if applicable',
                'User-facing documentation updated',
                'Technical documentation reflects changes'
              ]
            }
          ]
        },
        version: 1,
        status: 'active' as const,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: `${projectId}-doc-2`,
        user_id: user?.id || 'user1',
        project_id: projectId,
        template_id: 'dor-template-1',
        title: 'Definition of Ready',
        document_type: 'dor',
        content: {
          sections: [
            {
              title: 'Requirements',
              items: [
                'User story clearly defined with acceptance criteria',
                'Dependencies identified and resolved',
                'Design mockups available and approved',
                'API contracts defined where needed'
              ]
            },
            {
              title: 'Estimation & Planning',
              items: [
                'Story has been estimated by the team',
                'Technical approach discussed and agreed upon',
                'Testing strategy outlined',
                'Risks identified and mitigated'
              ]
            }
          ]
        },
        version: 1,
        status: 'active' as const,
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-10T09:00:00Z'
      },
      {
        id: `${projectId}-doc-3`,
        user_id: user?.id || 'user1',
        project_id: projectId,
        template_id: 'req-template-1',
        title: 'Project Requirements Document',
        document_type: 'requirements',
        content: {
          sections: [
            {
              title: 'Functional Requirements',
              items: [
                'User authentication system',
                'Project management dashboard',
                'Task creation and assignment',
                'Progress tracking and reporting'
              ]
            },
            {
              title: 'Non-Functional Requirements',
              items: [
                'Response time <200ms for API calls',
                'Support 1000+ concurrent users',
                '99.9% uptime requirement',
                'GDPR compliance'
              ]
            }
          ]
        },
        version: 2,
        status: 'active' as const,
        created_at: '2024-01-05T14:00:00Z',
        updated_at: '2024-01-20T16:30:00Z'
      }
    ];
  };

  const getMockTemplates = (): DocumentTemplate[] => {
    return [
      {
        id: 'dod-template-1',
        name: 'Definition of Done',
        category: 'dod',
        description: 'Checklist of criteria that must be met before a task can be considered complete',
        default_structure: {
          sections: [
            { title: 'Code Quality', items: [] },
            { title: 'Testing', items: [] },
            { title: 'Documentation', items: [] }
          ]
        },
        is_system: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'dor-template-1',
        name: 'Definition of Ready',
        category: 'dor',
        description: 'Checklist of criteria that must be met before work can begin on a task',
        default_structure: {
          sections: [
            { title: 'Requirements', items: [] },
            { title: 'Estimation & Planning', items: [] }
          ]
        },
        is_system: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'req-template-1',
        name: 'Requirements Document',
        category: 'requirements',
        description: 'Comprehensive project requirements documentation',
        default_structure: {
          sections: [
            { title: 'Functional Requirements', items: [] },
            { title: 'Non-Functional Requirements', items: [] },
            { title: 'Constraints', items: [] }
          ]
        },
        is_system: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'arch-template-1',
        name: 'Architecture Document',
        category: 'architecture',
        description: 'System architecture and design documentation',
        default_structure: {
          sections: [
            { title: 'System Overview', items: [] },
            { title: 'Components', items: [] },
            { title: 'Data Flow', items: [] }
          ]
        },
        is_system: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  };

  const handleCreateDocument = async (template: DocumentTemplate) => {
    try {
      if (!user?.id) return;

      const result = await documentService.createDocumentFromTemplate(
        user.id,
        projectId,
        template.category,
        `${template.name} - ${projectName}`
      );

      if (result.success && result.document) {
        setDocuments(prev => [result.document!, ...prev]);
        setShowCreateModal(false);
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (activeFilter === 'all') return true;
    return doc.document_type === activeFilter;
  });

  // Document type configuration
  const getDocumentTypeConfig = (type: string) => {
    const configs = {
      dod: {
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        icon: '✅',
        label: 'Definition of Done',
        description: 'Completion criteria'
      },
      dor: {
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        icon: '🚀',
        label: 'Definition of Ready',
        description: 'Readiness criteria'
      },
      requirements: {
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        icon: '📋',
        label: 'Requirements',
        description: 'Project requirements'
      },
      architecture: {
        color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        icon: '🏗️',
        label: 'Architecture',
        description: 'System design'
      },
      testing: {
        color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        icon: '🧪',
        label: 'Testing',
        description: 'Test documentation'
      },
      deployment: {
        color: 'bg-red-500/20 text-red-300 border-red-500/30',
        icon: '🚀',
        label: 'Deployment',
        description: 'Deployment guides'
      }
    };
    return configs[type as keyof typeof configs] || {
      color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      icon: '📄',
      label: 'Document',
      description: 'General document'
    };
  };

  // Filter tabs
  const filterTabs = [
    { key: 'all', label: 'All Documents', count: documents.length },
    { key: 'dod', label: 'Definition of Done', count: documents.filter(d => d.document_type === 'dod').length },
    { key: 'dor', label: 'Definition of Ready', count: documents.filter(d => d.document_type === 'dor').length },
    { key: 'requirements', label: 'Requirements', count: documents.filter(d => d.document_type === 'requirements').length },
    { key: 'architecture', label: 'Architecture', count: documents.filter(d => d.document_type === 'architecture').length },
  ];

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Project Documents</h2>
              <p className="text-white/70">{projectName} - DoD, DoR & Project Documentation</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2 border border-white/30 bg-white/20 hover:bg-white/30 text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Document</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as DocumentTypeFilter)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                activeFilter === tab.key
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="p-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white/80 mb-2">No documents found</h3>
            <p className="text-white/60 mb-4">Create your first project document to get started.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              Create Document
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map(document => {
              const config = getDocumentTypeConfig(document.document_type);
              const isExpanded = expandedDocument === document.id;

              return (
                <div key={document.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  {/* Document Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-xl">{config.icon}</span>
                          <div>
                            <h3 className="font-semibold text-white">{document.title}</h3>
                            <p className="text-sm text-white/60">{config.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-white/60">
                          <span className={`px-2 py-1 rounded-full border ${config.color}`}>
                            {config.label}
                          </span>
                          <span>Version {document.version}</span>
                          <span>Status: {document.status}</span>
                          <span>Updated: {new Date(document.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setExpandedDocument(isExpanded ? null : document.id)}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Document Content */}
                  {isExpanded && document.content?.sections && (
                    <div className="border-t border-white/10 p-4 bg-white/5">
                      <div className="space-y-6">
                        {document.content.sections.map((section: any, sectionIndex: number) => (
                          <div key={sectionIndex}>
                            <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                              <span className="w-2 h-2 bg-white/60 rounded-full"></span>
                              <span>{section.title}</span>
                            </h4>
                            <div className="space-y-2 ml-4">
                              {section.items?.map((item: string, itemIndex: number) => (
                                <div key={itemIndex} className="flex items-start space-x-3 text-sm text-white/80">
                                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Create New Document</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-white/70 mb-6">Choose a document template to get started:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => {
                  const config = getDocumentTypeConfig(template.category);
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleCreateDocument(template)}
                      className="p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-left transition-colors group"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{config.icon}</span>
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-white/90">{template.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full border ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-white/60">{template.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDocuments;