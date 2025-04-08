import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { signupSchema } from '../../Validation/authSchema'
import Input from '../../ui/Input'
import Label from '../../ui/Label'
import Button from '../../ui/Button'
import { DevTool } from '@hookform/devtools'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../features/authSlice'
import { useNavigate } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import SearchableSelect from '../../ui/SearchableSelect'

import { timezones } from '../../utils/timezones'
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
  const { loading, error,user } = useSelector((state) => state.auth)

  const onSubmit = (data) => {
    dispatch(registerUser(data))
      
  }
  useEffect(() => {
    if (!loading && !error && user) {
      navigate('/login')
    }
  }, [user, loading, error, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-6"
        noValidate
      >
        <h2 className="text-2xl font-semibold text-center">Sign Up</h2>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register('password')} />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        {/* Timezone Dropdown */}
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

        {/* Error */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
        <div className="text-center">
          <p className="text-sm">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      </form>
      <DevTool control={control} />
    </div>
  )
}

export default Signup
