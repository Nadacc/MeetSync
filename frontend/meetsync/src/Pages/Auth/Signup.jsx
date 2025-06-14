import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { signupSchema } from '../../utils/Validation/authSchema'
import Input from '../../components/ui/Input'
import Label from '../../components/ui/Label'
import Button from '../../components/ui/Button'
import { DevTool } from '@hookform/devtools'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../features/authSlice'
import { useNavigate } from 'react-router-dom'
import SearchableSelect from '../../components/ui/SearchableSelect'
import axiosInstance from '../../api/axiosInstance'
import { timezones } from '../../utils/timezones'
import signupImage from '../../assets/signup-illustration.svg'

const timezoneOptions = timezones.map((tz) => ({
  label: tz,
  value: tz,
}))

function Signup() {
  const form = useForm({
    resolver: yupResolver(signupSchema),
  })

  const { register, control, handleSubmit, formState } = form
  const { errors } = formState

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, user } = useSelector((state) => state.auth)

  const [emailAvailable, setEmailAvailable] = useState(null)
  const [checkingEmail, setCheckingEmail] = useState(false)

  const handleEmailBlur = async (e) => {
    const email = e.target.value
    if (!email) return

    setCheckingEmail(true)
    try {
      const res = await axiosInstance.get(`/users/check-email?email=${email}&context=password-reset`)
      setEmailAvailable(!res.data.exists)
    } catch (err) {
      console.error('Email check failed:', err)
      setEmailAvailable(null)
    } finally {
      setCheckingEmail(false)
    }
  }

  const onSubmit = (data) => {
    if (emailAvailable === false) return
    dispatch(registerUser(data))
  }

  useEffect(() => {
    if (!loading && !error && user?.email) {
      navigate('/verify-otp', { state: { email: user.email } })
    }
  }, [user, loading, error, navigate])

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image or Branding */}
      <div className="w-1/2 hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-10">
        <div className="space-y-4 max-w-md">
          <h1 className="text-4xl font-bold">Welcome to MeetSync</h1>
          <p className="text-lg">
            Simplify your scheduling experience. Join us and get started in minutes.
          </p>
          <img src={signupImage} alt="Signup Visual" className="w-full" />
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6"
          noValidate
        >
          <h2 className="text-3xl font-bold text-center text-gray-800">Create Your Account</h2>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              onBlur={handleEmailBlur}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            {checkingEmail && <p className="text-blue-500 text-sm">Checking email availability...</p>}
            {emailAvailable === false && <p className="text-red-500 text-sm">Email already exists</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Controller
              name="timezone"
              control={control}
              defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
              render={({ field }) => (
                <SearchableSelect
                  id="timezone"
                  label="Timezone"
                  options={timezoneOptions}
                  value={timezoneOptions.find((option) => option.value === field.value)}
                  onChange={(selectedOption) => field.onChange(selectedOption.value)}
                  onBlur={field.onBlur}
                  error={errors.timezone?.message}
                />
              )}
            />
            {errors.timezone && (
              <p className="text-red-500 text-sm">{errors.timezone.message}</p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button
            type="submit"
            className="w-full text-white font-semibold"
            disabled={loading || emailAvailable === false}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>

          <p className="text-sm text-center">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </form>
        <DevTool control={control} />
      </div>
    </div>
  )
}

export default Signup