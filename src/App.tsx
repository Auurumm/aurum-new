import React, { useState } from 'react';
import { Header } from './Components/Header/Header.tsx';
import { ProgressSection } from './Components/ProgressSection/ProgressSection.tsx';
import { CountDown } from './Components/CountDown/CountDown.tsx';
import { MainContentSection } from './Components/MainContent/MainContentSection.tsx';
import { NavigationSection} from './Components/NavigationSection/NavigationSection.tsx';
import { ReactionCardsSection } from './Components/NavigationSection/ReactionCardsSection.tsx';
import { WisdomCardGrid } from './Components/NavigationSection/CardsSection.tsx';
import { FooterSection } from './Components/Footer/FooterSection.tsx';
import './styles/index.css';

const App: React.FC = () => {
  const [isWisdomCompleted, setIsWisdomCompleted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111410] to-black">
      <Header />
      <ProgressSection isCompleted={isWisdomCompleted} />
      <div id="countdown-section">
        <CountDown 
          isCompleted={isWisdomCompleted}
          onComplete={() => setIsWisdomCompleted(true)} 
        />
      </div>
      <MainContentSection />
      <div id="navigation-section">
        <NavigationSection />
      </div>
      <ReactionCardsSection />
      <WisdomCardGrid isWisdomCompleted={isWisdomCompleted} />
      <FooterSection />
    </div>
  );
};

export default App;