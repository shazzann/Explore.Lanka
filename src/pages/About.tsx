import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Users, Heart, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-gradient text-white py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About Explore<span className="text-primary">.Lanka</span>
              </h1>
              <p className="text-xl text-white/90">
                Connecting travelers with the authentic beauty and rich culture of Sri Lanka through interactive exploration and meaningful experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg text-muted-foreground">
                  To make Sri Lankan tourism more engaging, educational, and rewarding by combining traditional exploration with modern technology.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Why ExploreLanka?</h3>
                  <p className="text-muted-foreground mb-6">
                    Sri Lanka is a treasure trove of diverse landscapes, ancient history, and vibrant culture. From pristine beaches to misty mountains, bustling cities to serene temples, every corner tells a unique story.
                  </p>
                  <p className="text-muted-foreground">
                    We believe that travel should be more than just visiting places – it should be about discovering stories, earning achievements, and creating lasting memories while supporting local communities.
                  </p>
                </div>
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 flex items-center justify-center">
                    <Globe className="h-32 w-32 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="mb-4 p-4 bg-primary/10 rounded-full w-fit mx-auto">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Authentic Discovery</h3>
                  <p className="text-muted-foreground">
                    We promote genuine experiences that showcase the real Sri Lanka, beyond tourist hotspots.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mb-4 p-4 bg-secondary/50 rounded-full w-fit mx-auto">
                    <Users className="h-8 w-8 text-lanka-green" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Community First</h3>
                  <p className="text-muted-foreground">
                    Supporting local communities and businesses while fostering connections between travelers.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mb-4 p-4 bg-accent/20 rounded-full w-fit mx-auto">
                    <Heart className="h-8 w-8 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Sustainable Tourism</h3>
                  <p className="text-muted-foreground">
                    Encouraging responsible travel that preserves Sri Lanka's natural beauty for future generations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Our Story</h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  ExploreLanka was born from a simple idea: what if exploring a country could be as engaging as playing a game? Our team of travel enthusiasts and technology experts came together to create a platform that transforms traditional sightseeing into an interactive adventure.
                </p>
                <p>
                  We recognized that Sri Lanka's incredible diversity – from ancient cities like Anuradhapura to pristine beaches in Mirissa, from tea plantations in Nuwara Eliya to wildlife safaris in Yala – deserved a modern approach to discovery.
                </p>
                <p>
                  Today, ExploreLanka helps thousands of travelers unlock the secrets of Sri Lanka while earning rewards, sharing experiences, and building connections that last a lifetime.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;