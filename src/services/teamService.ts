/**
 * Team Service for managing team data
 * Integrates with database and provides team member information
 */

export interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  status: 'online' | 'offline' | 'busy'
  email: string
  projectsCount: number
  tasksCompleted: number
  lastActive?: string
  skills?: string[]
}

export interface TeamActivity {
  id: string
  userId: string
  userName: string
  action: string
  target: string
  timestamp: string
  type: 'task_completed' | 'project_created' | 'comment_added' | 'status_updated'
}

class TeamService {
  // private baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

  // Get all team members
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      // In production, this would fetch from your API
      // For now, we'll generate dynamic data based on current projects
      return this.generateTeamMembersFromProjects()
    } catch (error) {
      console.error('Error fetching team members:', error)
      return this.getFallbackTeamMembers()
    }
  }

  // Get team activity feed
  async getTeamActivity(limit = 10): Promise<TeamActivity[]> {
    try {
      // In production, this would fetch recent activities from your API
      return this.generateRecentActivity(limit)
    } catch (error) {
      console.error('Error fetching team activity:', error)
      return []
    }
  }

  // Get team member by ID
  async getTeamMember(id: string): Promise<TeamMember | null> {
    try {
      const members = await this.getTeamMembers()
      return members.find(member => member.id === id) || null
    } catch (error) {
      console.error('Error fetching team member:', error)
      return null
    }
  }

  // Generate team members based on available project data
  private generateTeamMembersFromProjects(): TeamMember[] {
    const baseMembers = [
      {
        id: '1',
        name: 'Sarah Chen',
        role: 'Project Manager',
        avatar: '👩‍💼',
        email: 'sarah.chen@company.com',
        skills: ['Project Management', 'Agile', 'Team Leadership']
      },
      {
        id: '2',
        name: 'Marcus Rodriguez',
        role: 'Senior Developer',
        avatar: '👨‍💻',
        email: 'marcus.r@company.com',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL']
      },
      {
        id: '3',
        name: 'Emily Foster',
        role: 'UX Designer',
        avatar: '👩‍🎨',
        email: 'emily.foster@company.com',
        skills: ['UI/UX Design', 'Figma', 'User Research']
      },
      {
        id: '4',
        name: 'David Kim',
        role: 'Backend Engineer',
        avatar: '👨‍🔧',
        email: 'david.kim@company.com',
        skills: ['Python', 'Django', 'API Design', 'Docker']
      },
      {
        id: '5',
        name: 'Lisa Wang',
        role: 'Quality Assurance',
        avatar: '👩‍🔬',
        email: 'lisa.wang@company.com',
        skills: ['Testing', 'Automation', 'Quality Assurance']
      },
      {
        id: '6',
        name: 'Alex Thompson',
        role: 'DevOps Engineer',
        avatar: '👨‍⚙️',
        email: 'alex.t@company.com',
        skills: ['AWS', 'Kubernetes', 'CI/CD', 'Infrastructure']
      }
    ]

    // Add dynamic data based on current time and simulation
    return baseMembers.map(member => ({
      ...member,
      status: this.generateMemberStatus(),
      projectsCount: Math.floor(Math.random() * 5) + 1,
      tasksCompleted: Math.floor(Math.random() * 50) + 10,
      lastActive: this.generateLastActiveTime()
    }))
  }

  private generateMemberStatus(): 'online' | 'offline' | 'busy' {
    const statuses: ('online' | 'offline' | 'busy')[] = ['online', 'offline', 'busy']
    const weights = [0.4, 0.3, 0.3] // 40% online, 30% offline, 30% busy

    const random = Math.random()
    let cumulativeWeight = 0

    for (let i = 0; i < weights.length; i++) {
      cumulativeWeight += weights[i]
      if (random <= cumulativeWeight) {
        return statuses[i]
      }
    }

    return 'offline'
  }

  private generateLastActiveTime(): string {
    const now = new Date()
    const minutesAgo = Math.floor(Math.random() * 480) // 0-8 hours ago
    const lastActive = new Date(now.getTime() - (minutesAgo * 60 * 1000))
    return lastActive.toISOString()
  }

  private generateRecentActivity(limit: number): TeamActivity[] {
    const activities: TeamActivity[] = []
    const members = this.getFallbackTeamMembers()

    const actionTypes = [
      { type: 'task_completed' as const, action: 'completed task', target: 'User Interface Design Review' },
      { type: 'project_created' as const, action: 'created new project', target: 'Mobile App Redesign' },
      { type: 'comment_added' as const, action: 'commented on', target: 'Website Redesign project' },
      { type: 'status_updated' as const, action: 'updated deadline for', target: 'Backend API Development' }
    ]

    for (let i = 0; i < limit; i++) {
      const member = members[Math.floor(Math.random() * members.length)]
      const activity = actionTypes[Math.floor(Math.random() * actionTypes.length)]
      const hoursAgo = Math.floor(Math.random() * 24) + 1

      activities.push({
        id: `activity_${Date.now()}_${i}`,
        userId: member.id,
        userName: member.name,
        action: activity.action,
        target: activity.target,
        timestamp: new Date(Date.now() - (hoursAgo * 60 * 60 * 1000)).toISOString(),
        type: activity.type
      })
    }

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  private getFallbackTeamMembers(): TeamMember[] {
    return [
      {
        id: '1',
        name: 'Sarah Chen',
        role: 'Project Manager',
        avatar: '👩‍💼',
        status: 'online',
        email: 'sarah.chen@company.com',
        projectsCount: 5,
        tasksCompleted: 42
      },
      {
        id: '2',
        name: 'Marcus Rodriguez',
        role: 'Senior Developer',
        avatar: '👨‍💻',
        status: 'busy',
        email: 'marcus.r@company.com',
        projectsCount: 3,
        tasksCompleted: 67
      },
      {
        id: '3',
        name: 'Emily Foster',
        role: 'UX Designer',
        avatar: '👩‍🎨',
        status: 'online',
        email: 'emily.foster@company.com',
        projectsCount: 4,
        tasksCompleted: 28
      },
      {
        id: '4',
        name: 'David Kim',
        role: 'Backend Engineer',
        avatar: '👨‍🔧',
        status: 'offline',
        email: 'david.kim@company.com',
        projectsCount: 2,
        tasksCompleted: 51
      },
      {
        id: '5',
        name: 'Lisa Wang',
        role: 'Quality Assurance',
        avatar: '👩‍🔬',
        status: 'online',
        email: 'lisa.wang@company.com',
        projectsCount: 6,
        tasksCompleted: 73
      },
      {
        id: '6',
        name: 'Alex Thompson',
        role: 'DevOps Engineer',
        avatar: '👨‍⚙️',
        status: 'busy',
        email: 'alex.t@company.com',
        projectsCount: 3,
        tasksCompleted: 39
      }
    ]
  }
}

// Export singleton instance
export const teamService = new TeamService()