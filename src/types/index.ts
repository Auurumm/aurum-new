export interface NavigationItem {
    label: string;
    href: string;
  }
  
  export interface ProgressStep {
    id: number;
    title: string;
    isCompleted: boolean;
    isActive: boolean;
  }
  
  export interface ProgressSectionProps {
    currentStep?: number;
    totalSteps?: number;
    onStepClick?: (step: number) => void;
  }
  