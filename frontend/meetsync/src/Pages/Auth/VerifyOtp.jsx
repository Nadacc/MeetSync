import { useDispatch } from 'react-redux'
import { verifyOtp, registerUser } from '../../features/authSlice'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'


// Import your reusable components
import Label from '../../ui/Label'
import Input from '../../ui/Input'
import Button from '../../ui/Button'

function VerifyOtp() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email
  const { register, handleSubmit, formState: { errors } } = useForm()

  const [counter, setCounter] = useState(300) 
  const [resendTimer, setResendTimer] = useState(60) 

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prev) => (prev > 0 ? prev - 1 : 0))
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const onSubmit = async (data) => {
    const result = await dispatch(verifyOtp({ email, otp: data.otp }))
    if (verifyOtp.fulfilled.match(result)) {
      console.log("OTP verified successfully");
      
      navigate('/login')
    } else {
      console.log(result.payload.message || "OTP verification failed")
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return

    const result = await dispatch(resendOtp({ email }))

    if (registerUser.fulfilled.match(result)) {
      
      setCounter(300)
      setResendTimer(60)
    } else {
      console.log(result.payload?.message || 'Failed to resend OTP')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">OTP Verification</h2>
      <p className="text-sm text-gray-600 text-center mb-2">
        Enter the OTP sent to <span className="font-semibold">{email}</span>
      </p>
      <p className="text-xs text-red-500 text-center mb-4">OTP expires in: {formatTime(counter)}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="otp">OTP</Label>
          <Input
            id="otp"
            type="text"
            maxLength={6}
            {...register("otp", { required: "OTP is required" })}
            placeholder="Enter 6-digit OTP"
          />
          {errors.otp && (
            <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full">Verify OTP</Button>
      </form>

      <div className="text-center mt-4">
        <button
          className={`text-blue-600 hover:underline disabled:opacity-50`}
          onClick={handleResendOtp}
          disabled={resendTimer > 0}
        >
          Resend OTP {resendTimer > 0 && `in ${resendTimer}s`}
        </button>
      </div>
    </div>
  )
}

export default VerifyOtp
