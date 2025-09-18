export interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }
  
  export interface CountDownProps {
    initialTime?: TimeLeft;
    onTimeEnd?: () => void;
    onVideoPlay?: () => void;
    onWisdomWrite?: () => void;
  }
  