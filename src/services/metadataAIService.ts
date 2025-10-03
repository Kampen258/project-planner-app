import { mcpClient } from '../mcpClient'

export interface ProjectContext {
  name: string
  description: string
  projectType?: string
  methodology?: string
  teamSize?: number
  riskLevel?: string
  businessValue?: string
  technicalComplexity?: string
}

export interface AIGeneratedCriteria {
  definitionOfDone: string[]
  definitionOfReady: string[]
}

export class MetadataAIService {

  // Generate DoD and DoR suggestions using Claude via MCP
  static async generateDoDAndDoR(context: ProjectContext): Promise<AIGeneratedCriteria> {
    try {
      if (!mcpClient.isClientConnected()) {
        // Fallback to predefined suggestions if MCP is not available
        return this.getFallbackCriteria(context)
      }

      // Create a comprehensive prompt for Claude
      const prompt = this.buildCriteriaPrompt(context)

      // Use the existing MCP task generation but customize for DoD/DoR
      const response = await this.generateCriteriaViaMCP(prompt, context)

      return response
    } catch (error) {
      console.error('Error generating DoD/DoR suggestions:', error)
      // Return fallback criteria if AI generation fails
      return this.getFallbackCriteria(context)
    }
  }

  // Build a comprehensive prompt for Claude to generate DoD and DoR
  private static buildCriteriaPrompt(context: ProjectContext): string {
    const { name, description, projectType, methodology, teamSize, riskLevel, businessValue, technicalComplexity } = context

    return `You are an expert project management consultant. Please generate comprehensive and specific Definition of Done (DoD) and Definition of Ready (DoR) criteria for the following project:

PROJECT DETAILS:
- Name: ${name}
- Description: ${description}
- Type: ${projectType || 'Not specified'}
- Methodology: ${methodology || 'Not specified'}
- Team Size: ${teamSize || 'Not specified'}
- Risk Level: ${riskLevel || 'Not specified'}
- Business Value: ${businessValue || 'Not specified'}
- Technical Complexity: ${technicalComplexity || 'Not specified'}

Please provide:

1. DEFINITION OF DONE (DoD) - 6-10 specific, measurable criteria that define when a task/story is truly complete
2. DEFINITION OF READY (DoR) - 6-10 specific criteria that must be met before work can begin on a task/story

Make the criteria:
- Specific to this project type and context
- Measurable and actionable
- Appropriate for the team size and methodology
- Realistic for the technical complexity level
- Aligned with the business value and risk level

Format the response as clear, concise bullet points that teams can easily understand and follow.`
  }

  // Generate criteria using MCP (simulated for now)
  private static async generateCriteriaViaMCP(_prompt: string, _context: ProjectContext): Promise<AIGeneratedCriteria> {
    try {
      // For now, we'll use a simulated response based on the project context
      // In a real implementation, this would call Claude via MCP with the prompt

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      return this.getContextAwareCriteria(_context)
    } catch (error) {
      console.error('MCP generation failed:', error)
      return this.getFallbackCriteria(_context)
    }
  }

  // Generate context-aware criteria based on project type and characteristics
  private static getContextAwareCriteria(context: ProjectContext): AIGeneratedCriteria {
    const { projectType, methodology, riskLevel, technicalComplexity } = context

    let dod: string[] = []
    let dor: string[] = []

    // Base criteria that apply to most projects
    dod = [
      'Code is written and committed to version control',
      'All automated tests pass successfully',
      'Code has been peer reviewed and approved',
      'Documentation is updated and accurate',
      'Feature works as expected in all target environments'
    ]

    dor = [
      'Requirements are clearly defined and understood',
      'Acceptance criteria are written and agreed upon',
      'All dependencies have been identified and resolved',
      'Technical approach is documented and approved',
      'Effort estimation is complete and realistic'
    ]

    // Customize based on project type
    if (projectType?.toLowerCase().includes('web')) {
      dod.push(
        'Cross-browser compatibility verified',
        'Performance benchmarks meet requirements',
        'Security scanning completed with no critical issues',
        'Responsive design tested on multiple devices'
      )
      dor.push(
        'UI/UX designs are finalized and approved',
        'API contracts are defined and documented',
        'Browser support requirements are specified'
      )
    }

    if (projectType?.toLowerCase().includes('mobile')) {
      dod.push(
        'App tested on target devices and OS versions',
        'App store guidelines compliance verified',
        'Performance on low-end devices validated'
      )
      dor.push(
        'Target platforms and OS versions defined',
        'Device-specific requirements documented',
        'App store submission requirements understood'
      )
    }

    // Customize based on methodology
    if (methodology === 'agile' || methodology === 'scrum') {
      dod.push('Demo prepared for sprint review')
      dor.push(
        'Story is sized and fits within sprint capacity',
        'Sprint goal alignment confirmed'
      )
    }

    // Customize based on risk level
    if (riskLevel === 'high' || riskLevel === 'critical') {
      dod.push(
        'Risk mitigation measures implemented',
        'Rollback plan tested and documented',
        'Additional stakeholder approval obtained'
      )
      dor.push(
        'Risk assessment completed',
        'Mitigation strategies defined',
        'Escalation procedures documented'
      )
    }

    // Customize based on technical complexity
    if (technicalComplexity === 'high' || technicalComplexity === 'very-high') {
      dod.push(
        'Architecture review completed',
        'Performance impact assessed',
        'Technical debt documented'
      )
      dor.push(
        'Technical spike completed if needed',
        'Architecture patterns agreed upon',
        'Technical risks identified and assessed'
      )
    }

    return {
      definitionOfDone: dod.slice(0, 10), // Limit to 10 items
      definitionOfReady: dor.slice(0, 10) // Limit to 10 items
    }
  }

  // Fallback criteria for when AI generation is not available
  private static getFallbackCriteria(_context: ProjectContext): AIGeneratedCriteria {
    return {
      definitionOfDone: [
        'Feature is implemented according to requirements',
        'Code is reviewed and approved by team member',
        'All unit tests pass',
        'Integration tests pass',
        'Documentation is updated',
        'Feature is deployed to staging environment',
        'Manual testing completed successfully',
        'No critical bugs identified',
        'Performance requirements met',
        'Security considerations addressed'
      ],
      definitionOfReady: [
        'User story is clearly written',
        'Acceptance criteria are defined',
        'Story is estimated by the team',
        'Dependencies are identified',
        'Design mockups are available if needed',
        'Technical approach is outlined',
        'Risks are identified and assessed',
        'Definition of Done is understood',
        'Required resources are available',
        'Story fits within sprint capacity'
      ]
    }
  }

  // Generate suggestions for specific criteria enhancement
  static async enhanceCriteria(
    existingCriteria: string[],
    type: 'dod' | 'dor',
    context: ProjectContext
  ): Promise<string[]> {
    try {
      // This would enhance existing criteria with AI suggestions
      // For now, return context-aware suggestions
      const generated = await this.generateDoDAndDoR(context)
      const newCriteria = type === 'dod' ? generated.definitionOfDone : generated.definitionOfReady

      // Merge existing with new, avoiding duplicates
      const combined = [...existingCriteria]
      newCriteria.forEach(criterion => {
        const similar = combined.find(existing =>
          existing.toLowerCase().includes(criterion.toLowerCase().substring(0, 20))
        )
        if (!similar) {
          combined.push(criterion)
        }
      })

      return combined
    } catch (error) {
      console.error('Error enhancing criteria:', error)
      return existingCriteria
    }
  }
}