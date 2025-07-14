
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Sparkles } from 'lucide-react';
import TravelChatbot from '@/components/TravelChatbot';
import AITripPlanner from '@/components/AITripPlanner';

const TravelAssistant = () => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container px-4 py-6 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">AI Travel Assistant</h1>
            <p className="text-muted-foreground">
              Get personalized travel advice and AI-powered trip planning for Sri Lanka
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8">
              <TabsTrigger value="chat" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Travel Chat
              </TabsTrigger>
              <TabsTrigger value="planner" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Trip Planner
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-0">
              <div className="flex justify-center">
                <TravelChatbot />
              </div>
            </TabsContent>

            <TabsContent value="planner" className="mt-0">
              <AITripPlanner />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TravelAssistant;
