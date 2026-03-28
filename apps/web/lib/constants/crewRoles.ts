/**
 * Comprehensive list of film production crew roles organized by department
 * Used for autocomplete and role suggestions in the Get Listed form
 */

export const CREW_ROLES_BY_DEPARTMENT = {
  production: [
    'Production Company',
    'Producer',
    'Executive Producer',
    'Line Producer',
    'Associate Producer',
    'Co-Producer',
    'Supervising Producer',
    'Production Manager',
    'Unit Production Manager',
    'Production Supervisor',
    'Production Coordinator',
    'Assistant Production Coordinator',
    'Production Assistant',
    'Location Manager',
    'Assistant Location Manager',
    'Location Scout',
    'Location Coordinator',
    '1st Assistant Director',
    '2nd Assistant Director',
    '2nd 2nd Assistant Director',
    '3rd Assistant Director',
    'Script Supervisor',
    'Continuity Supervisor',
    'Production Accountant',
    'Assistant Production Accountant',
    'Production Secretary',
    'Office PA',
    'Set PA',
    'Craft Service',
    'Craft Service Assistant',
    'Transportation Coordinator',
    'Transportation Captain',
    'Driver',
    'Picture Car Coordinator',
    'Stunt Coordinator',
    'Stunt Performer',
    'Stunt Double',
    'Animal Trainer',
    'Wrangler',
    'Safety Coordinator',
    'COVID Compliance Officer',
    'Production Designer',
    'Supervising Art Director',
  ],
  camera: [
    'Director of Photography',
    'Cinematographer',
    'Camera Operator',
    '1st Assistant Camera',
    '1st AC',
    'Focus Puller',
    '2nd Assistant Camera',
    '2nd AC',
    'Clapper Loader',
    'Camera Trainee',
    'Camera PA',
    'Steadicam Operator',
    'Steadicam Assistant',
    'DIT',
    'Digital Imaging Technician',
    'Data Wrangler',
    'Video Playback Operator',
    'Video Assist Operator',
    'Drone Operator',
    'Drone Pilot',
    'Aerial Cinematographer',
    'Underwater Camera Operator',
    'Camera Utility',
    'Camera Technician',
    'Still Photographer',
    'BTS Photographer',
    'Behind the Scenes Photographer',
  ],
  lighting: [
    'Gaffer',
    'Chief Lighting Technician',
    'Best Boy Electric',
    'Best Boy Grip',
    'Electric',
    'Electrician',
    'Lamp Operator',
    'Generator Operator',
    'Lighting Designer',
    'Lighting Director',
    'Lighting Technician',
    'Rigging Gaffer',
    'Rigging Electric',
    'Console Operator',
    'Programmer',
    'Lighting Console Programmer',
    'Moving Light Programmer',
    'Lighting Board Operator',
    'Follow Spot Operator',
    'Practical Electrician',
    'Electrician Trainee',
    'Electric PA',
  ],
  grip: [
    'Key Grip',
    'Best Boy Grip',
    'Dolly Grip',
    'Grip',
    'Grip/Electric',
    'Rigging Grip',
    'Rigging Key Grip',
    'Crane Operator',
    'Crane Grip',
    'Remote Head Operator',
    'Grip Trainee',
    'Grip PA',
    'Set Construction',
    'Carpenter',
    'Lead Carpenter',
    'Scenic Carpenter',
    'Set Builder',
    'Welder',
    'Fabricator',
  ],
  sound: [
    'Production Sound Mixer',
    'Location Sound Mixer',
    'Boom Operator',
    'Utility Sound Technician',
    'Sound Utility',
    'Cable Puller',
    'Playback Operator',
    'Playback Engineer',
    'Sound Designer',
    'ADR Mixer',
    'Foley Artist',
    'Sound Editor',
    'Re-Recording Mixer',
    'Sound Trainee',
    'Sound PA',
  ],
  art: [
    'Production Designer',
    'Art Director',
    'Assistant Art Director',
    'Set Designer',
    'Concept Artist',
    'Storyboard Artist',
    'Set Decorator',
    'Assistant Set Decorator',
    'Leadman',
    'Swing Gang',
    'Set Dresser',
    'On Set Dresser',
    'Prop Master',
    'Assistant Prop Master',
    'Props',
    'Prop Maker',
    'Prop Builder',
    'Standby Props',
    'Set Props',
    'Art Department Coordinator',
    'Art Department Assistant',
    'Art PA',
    'Set PA',
    'Greensman',
    'Greens',
    'Scenic Artist',
    'Paint Foreman',
    'Sign Painter',
    'Model Maker',
    'Miniature Builder',
    'Special Effects Coordinator',
    'Special Effects Technician',
    'Pyrotechnician',
    'Mechanical Effects',
    'Practical Effects',
  ],
  wardrobe: [
    'Costume Designer',
    'Assistant Costume Designer',
    'Costume Supervisor',
    'Wardrobe Supervisor',
    'Key Costumer',
    'Costumer',
    'Wardrobe Stylist',
    'Wardrobe Assistant',
    'On Set Costumer',
    'Standby Costumer',
    'Costume PA',
    'Wardrobe PA',
    'Tailor',
    'Seamstress',
    'Costume Breakdown',
    'Costume Buyer',
    'Costume Coordinator',
  ],
  hmu: [
    'Hair & Makeup',
    'Hair & Makeup Department Head',
    'Key Hair & Makeup Artist',
    'Assistant Hair & Makeup Artist',
    'Hair & Makeup Assistant',
    'Hair & Makeup PA',
    'Special Effects Makeup Artist',
    'SFX Makeup Artist',
    'Prosthetics Artist',
    'Prosthetics Designer',
    'Body Makeup Artist',
    'Tattoo Artist',
    'Wig Master',
    'Wig Designer',
    'Hair & Makeup Supervisor',
  ],
} as const

/**
 * Role alias map: variant → canonical name
 * Used to deduplicate roles that are the same job with different titles.
 * The canonical name (value) is what gets displayed; the key is what gets normalized.
 */
export const ROLE_ALIASES: Record<string, string> = {
  // Camera
  'dp': 'Director of Photography (DP)',
  'director of photography': 'Director of Photography (DP)',
  'director of photography (dp)': 'Director of Photography (DP)',
  'cinematographer': 'Director of Photography (DP)',
  '1st ac': '1st AC',
  '1st assistant camera': '1st AC',
  'focus puller': '1st AC',
  '2nd ac': '2nd AC',
  '2nd assistant camera': '2nd AC',
  'clapper loader': '2nd AC',
  'dit': 'Digital Imaging Technician (DIT)',
  'digital imaging technician': 'Digital Imaging Technician (DIT)',
  'digital imaging technician (dit)': 'Digital Imaging Technician (DIT)',
  'drone operator': 'Drone Operator',
  'drone pilot': 'Drone Operator',
  'still photographer': 'Still Photographer',
  'bts photographer': 'Still Photographer',
  'behind the scenes photographer': 'Still Photographer',
  // Lighting
  'gaffer': 'Gaffer',
  'chief lighting technician': 'Gaffer',
  'electric': 'Electrician',
  'electrician': 'Electrician',
  // Sound
  'production sound mixer': 'Production Sound Mixer',
  'location sound mixer': 'Production Sound Mixer',
  'utility sound technician': 'Sound Utility',
  'sound utility': 'Sound Utility',
  'playback operator': 'Playback Operator',
  'playback engineer': 'Playback Operator',
  // Wardrobe
  'costume supervisor': 'Costume Supervisor',
  'wardrobe supervisor': 'Costume Supervisor',
  // HMU
  'hair stylist': 'Hair & Makeup',
  'hair department head': 'Hair & Makeup Department Head',
  'key hair stylist': 'Key Hair & Makeup Artist',
  'makeup artist': 'Hair & Makeup',
  'makeup department head': 'Hair & Makeup Department Head',
  'key makeup artist': 'Key Hair & Makeup Artist',
  'assistant hair stylist': 'Assistant Hair & Makeup Artist',
  'assistant makeup artist': 'Assistant Hair & Makeup Artist',
  'hair assistant': 'Hair & Makeup Assistant',
  'makeup assistant': 'Hair & Makeup Assistant',
  'hair and makeup supervisor': 'Hair & Makeup Supervisor',
  'special effects makeup artist': 'SFX Makeup Artist',
  'sfx makeup artist': 'SFX Makeup Artist',
}

/**
 * Normalize a role name to its canonical form.
 * Returns the original role if no alias is found.
 */
export function normalizeRole(role: string): string {
  const lower = role.trim().toLowerCase()
  return ROLE_ALIASES[lower] || role.trim()
}

/**
 * Get all roles for a specific department
 */
export function getRolesByDepartment(
  department: keyof typeof CREW_ROLES_BY_DEPARTMENT | null
): string[] {
  if (!department) {
    // Return all roles from all departments
    return Object.values(CREW_ROLES_BY_DEPARTMENT).flat()
  }
  return CREW_ROLES_BY_DEPARTMENT[department] || []
}

/**
 * Get all unique roles across all departments
 */
export function getAllRoles(): string[] {
  return Object.values(CREW_ROLES_BY_DEPARTMENT).flat()
}

/**
 * Check if a role belongs to a specific department
 */
export function getDepartmentForRole(role: string): keyof typeof CREW_ROLES_BY_DEPARTMENT | null {
  for (const [dept, roles] of Object.entries(CREW_ROLES_BY_DEPARTMENT)) {
    if (roles.includes(role as any)) {
      return dept as keyof typeof CREW_ROLES_BY_DEPARTMENT
    }
  }
  return null
}

