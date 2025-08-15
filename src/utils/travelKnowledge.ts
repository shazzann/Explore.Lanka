
export const travelKnowledge = {
  destinations: {
    keywords: ['destination', 'place', 'visit', 'city', 'town', 'beach', 'mountain', 'temple', 'national park'],
    responses: [
      "Sri Lanka offers incredible destinations! Some must-visit places include:\n\n🏛️ **Cultural Triangle**: Sigiriya, Polonnaruwa, Anuradhapura\n🏖️ **Beaches**: Mirissa, Unawatuna, Arugam Bay\n🏔️ **Hill Country**: Kandy, Ella, Nuwara Eliya\n🐘 **Wildlife**: Yala National Park, Udawalawe\n\nWhat type of experience interests you most?",
      "Popular Sri Lankan destinations by region:\n\n**South Coast**: Beautiful beaches, whale watching, colonial forts\n**Central Highlands**: Tea plantations, scenic train rides, cool weather\n**Ancient Cities**: Historical ruins, ancient temples, cultural heritage\n**East Coast**: Surfing, pristine beaches, less crowded\n\nWhich region sounds most appealing?"
    ]
  },
  food: {
    keywords: ['food', 'eat', 'restaurant', 'cuisine', 'rice', 'curry', 'spicy', 'local food'],
    responses: [
      "Sri Lankan cuisine is amazing! Must-try dishes include:\n\n🍛 **Rice & Curry** - The national dish with various curries\n🥥 **Kottu Roti** - Chopped flatbread stir-fry\n🦐 **Hoppers** - Bowl-shaped pancakes, try with egg!\n🍜 **Lamprais** - Dutch-influenced rice packet\n🥄 **Curd & Treacle** - Traditional dessert\n\nAre you looking for specific restaurants or cooking experiences?",
      "Sri Lankan food tips:\n\n🌶️ **Spice Level**: Ask for 'less spicy' if you're not used to heat\n🥥 **Coconut**: Used in most dishes - fresh coconut water is everywhere\n🍃 **Tea**: World's best Ceylon tea - try different estates\n🐟 **Seafood**: Coastal areas have amazing fresh fish curries\n\nWhat type of flavors do you enjoy?"
    ]
  },
  transport: {
    keywords: ['transport', 'travel', 'train', 'bus', 'tuk tuk', 'taxi', 'getting around'],
    responses: [
      "Getting around Sri Lanka:\n\n🚂 **Trains**: Scenic routes, especially Kandy to Ella\n🚌 **Buses**: Cheap but can be crowded\n🛺 **Tuk-tuks**: Great for short distances, negotiate prices\n🚗 **Private Driver**: Comfortable for longer trips\n🚕 **Ride Apps**: PickMe app works in major cities\n\nWhat's your preferred way to travel?",
      "Transport tips for Sri Lanka:\n\n⏰ **Book Early**: Train tickets for popular routes sell out\n💰 **Negotiate**: Always negotiate tuk-tuk prices beforehand\n🗺️ **Plan Routes**: Some areas are better connected than others\n🎒 **Pack Light**: Easier for train and bus travel\n\nWhich routes are you planning to take?"
    ]
  },
  culture: {
    keywords: ['culture', 'tradition', 'festival', 'temple', 'buddhist', 'religion', 'customs'],
    responses: [
      "Sri Lankan culture is rich and diverse:\n\n🙏 **Buddhism**: Majority religion, beautiful temples everywhere\n🎭 **Festivals**: Vesak, Kandy Perahera, Sinhala New Year\n👗 **Dress Code**: Cover shoulders/knees at temples\n🎵 **Arts**: Traditional dance, drumming, handicrafts\n📿 **Etiquette**: Remove shoes before entering homes/temples\n\nAre you interested in any specific cultural experiences?",
      "Cultural experiences to try:\n\n🏛️ **Temple of the Tooth** - Sacred Buddhist site in Kandy\n🎪 **Cultural Shows** - Traditional dance performances\n🎨 **Handicraft Villages** - Watch artisans at work\n🌅 **Meditation Retreats** - Many temples offer programs\n📚 **Cooking Classes** - Learn to make authentic curries\n\nWhat cultural aspects interest you most?"
    ]
  },
  weather: {
    keywords: ['weather', 'climate', 'season', 'rain', 'monsoon', 'temperature', 'when to visit'],
    responses: [
      "Sri Lanka's weather by season:\n\n☀️ **Dec-Mar**: Best time - dry and sunny everywhere\n🌧️ **Apr-Jun**: Southwest monsoon affects west/south coasts\n🌦️ **Oct-Nov**: Inter-monsoon - short showers\n⛈️ **Jun-Sep**: Southeast monsoon affects east coast\n\n🌡️ **Temperature**: Tropical year-round, cooler in hills\n\nWhen are you planning to visit?",
      "Weather planning tips:\n\n🏖️ **Beach Season**: West/South coasts best Dec-Mar, East coast Jun-Sep\n🏔️ **Hill Country**: Can be cool and rainy, bring layers\n☔ **Monsoon**: Don't let rain stop you - it's often brief!\n🌞 **UV Protection**: Strong sun year-round, use sunscreen\n\nWhich regions are you considering?"
    ]
  },
  activities: {
    keywords: ['activity', 'adventure', 'wildlife', 'safari', 'surfing', 'hiking', 'diving', 'things to do'],
    responses: [
      "Amazing activities in Sri Lanka:\n\n🐘 **Wildlife Safaris** - Yala, Udawalawe, Minneriya\n🏄 **Surfing** - Arugam Bay, Mirissa, Hikkaduwa\n🥾 **Hiking** - Adam's Peak, Sigiriya Rock, Little Adam's Peak\n🐋 **Whale Watching** - Mirissa (Nov-Apr)\n🤿 **Diving/Snorkeling** - Trincomalee, Hikkaduwa\n🚂 **Train Journey** - Kandy to Ella scenic route\n\nWhat type of adventure interests you?",
      "Adventure planning:\n\n🌅 **Adam's Peak**: Climb at night for sunrise (Dec-May)\n🦎 **Wildlife**: Early morning safaris have best animal sightings\n🌊 **Water Sports**: Check seasonal conditions for each coast\n🏞️ **National Parks**: Book accommodations in advance\n📸 **Photography**: Golden hour lighting is spectacular\n\nAre there specific activities you'd like to plan?"
    ]
  }
};

export const generateResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  // Check each category for keyword matches
  for (const [category, data] of Object.entries(travelKnowledge)) {
    const hasKeyword = data.keywords.some(keyword => message.includes(keyword));
    if (hasKeyword) {
      const randomResponse = data.responses[Math.floor(Math.random() * data.responses.length)];
      return randomResponse;
    }
  }

  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! Welcome to Sri Lanka travel assistance! I can help you with destinations, food, transport, culture, weather, and activities. What would you like to know?";
  }

  // Thank you responses
  if (message.includes('thank') || message.includes('thanks')) {
    return "You're welcome! I'm here to help make your Sri Lankan adventure amazing. Feel free to ask me anything else about traveling in Sri Lanka! 🇱🇰";
  }

  // Default response with helpful suggestions
  return "I'd love to help you explore Sri Lanka! You can ask me about:\n\n🗺️ **Destinations** - Best places to visit\n🍛 **Food** - Local cuisine and restaurants\n🚗 **Transport** - Getting around the island\n🎭 **Culture** - Traditions and customs\n🌤️ **Weather** - Best times to visit\n🏄 **Activities** - Adventures and experiences\n\nWhat interests you most?";
};
