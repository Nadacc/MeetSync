import React from 'react';
import Button from './ui/Button';
import { Calendar, Video, Users, Shield, Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/register')
    console.log('Navigate to register');
  };

  const handleLogin = () => {
    navigate('/login')
    console.log('Navigate to login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              MeetSync
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-white cursor-pointer">
            
            <Button variant="outline" size="sm" onClick={handleLogin} className='cursor-pointer'>Login</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative px-6 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-indigo-200 rounded-full opacity-60 animate-pulse delay-1000"></div>
            <div className="absolute bottom-40 left-20 w-12 h-12 bg-purple-200 rounded-full opacity-60 animate-pulse delay-2000"></div>
            
            

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Simplify Your
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Scheduling
                </span>
                with MeetSync
              </h1>
              <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed">
                Automate meeting coordination, eliminate scheduling conflicts, and connect instantly — 
                all in one intelligent platform designed for modern teams.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
              <Button
                size="lg"
                className="px-8 py-4 text-lg font-semibold shadow-2xl text-white cursor-pointer"
                onClick={handleGetStarted}
              >
                Get Started
                
              </Button>
              
            </div>

            
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to
              <span className="block text-blue-600">schedule smarter</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to eliminate the back-and-forth of scheduling 
              and help your team focus on what matters most.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Scheduling</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered scheduling that automatically handles time zones, prevents conflicts, 
                and finds the perfect meeting times for everyone.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Meetings</h3>
              <p className="text-gray-600 leading-relaxed">
                Join video meetings with one click. No downloads, no waiting rooms, 
                no technical barriers—just seamless collaboration.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Team Coordination</h3>
              <p className="text-gray-600 leading-relaxed">
                Coordinate across teams, departments, and time zones with intelligent 
                availability matching and automated reminders.
              </p>
            </div>

            

            

            
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to transform your scheduling?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of teams who've eliminated scheduling chaos and 
            reclaimed hours of productive time every week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-50 shadow-2xl"
              onClick={handleGetStarted}
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-8 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">MeetSync</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MeetSync. All rights reserved. Built with ❤️ for productive teams.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;  