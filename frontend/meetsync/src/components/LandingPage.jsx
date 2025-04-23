import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'
import { Calendar, Video } from 'lucide-react'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight">
          Simplify Your Scheduling with <span className="text-blue-600">MeetSync</span>
        </h1>
        <p className="text-gray-600 text-lg sm:text-xl">
          Automate meeting coordination, eliminate scheduling conflicts, and connect instantly — all in one platform.
        </p>

        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Button
            className="px-6 py-3 text-lg font-medium text-white"
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            className="px-6 py-3 text-lg font-medium text-white"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </div>

        
        <div className="grid sm:grid-cols-2 gap-6 mt-12 text-left">
          <div className="flex items-start gap-4">
            <Calendar className="text-blue-600 w-8 h-8" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Smart Scheduling</h3>
              <p className="text-gray-600 text-sm">
                Automatically handle time zones, avoid overlaps, and send invites.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Video className="text-blue-600 w-8 h-8" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Real-Time Meetings</h3>
              <p className="text-gray-600 text-sm">
                Join video meetings instantly .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
