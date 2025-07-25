export type CapsuleType = 'daily' | 'future' | 'lift'

export interface Capsule {
  id: string
  type: CapsuleType
  title?: string // Optional
  createdAt: number // Unix timestamp
  duration: number // Seconds
  mediaType: 'video' | 'audio'
  filePath: string // Relative path
  
  // Future-specific
  unlockDate?: number
  isUnlocked?: boolean
  
  // Lift-specific
  emotion?: string
}

export interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  mediaType: 'video' | 'audio'
}

export interface CapsuleCardProps {
  capsule: Capsule
  onPress: () => void
}

export interface RadialMenuProps {
  onSelect: (type: CapsuleType) => void
  onClose: () => void
}

export interface EmptyStateProps {
  type: CapsuleType
}

export interface TimerDisplayProps {
  duration: number
  maxDuration: number
  isRecording: boolean
}

export interface VideoPlayerProps {
  source: string
  paused?: boolean
  onEnd?: () => void
}