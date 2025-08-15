
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TravelChatbot from '@/components/TravelChatbot';

const TravelAssistant = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container px-4 py-6 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">AI Travel Assistant</h1>
            <p className="text-muted-foreground">
              Get personalized travel advice and recommendations for Sri Lanka
            </p>
          </div>

          <div className="flex justify-center">
            <TravelChatbot />
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default TravelAssistant;
