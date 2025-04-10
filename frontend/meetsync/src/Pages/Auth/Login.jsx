import React from 'react'
import Button from '.././../components/ui/Button'
import Label from '.././../components/ui/Label'
import Input from '.././../components/ui/Input'
import { useForm } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../../features/authSlice'
import { useNavigate } from 'react-router-dom'
import { loginSchema } from '../../Validation/authSchema'
import { yupResolver } from '@hookform/resolvers/yup'

function Login() {
  const form = useForm({
    resolver:yupResolver(loginSchema)
  })
  const { register, control, handleSubmit, formState } = form
  const { errors } = formState

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const onSubmit = (data) => {
    dispatch(loginUser(data))
      .unwrap()
      .then(() => {
        navigate('/') 
      })
      .catch((err) => {
        console.log('Login failed:', err)
      })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-6"
        noValidate
      >
        <h2 className="text-2xl font-semibold text-center">Login</h2>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: 'Invalid email format',
              },
            })}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Minimum 6 characters required',
              },
            })}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

          <p
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-blue-600 hover:underline cursor-pointer text-right mt-1"
          >
            Forgot Password?
          </p>
        </div>

        {/* Error from API */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>


        <div className="text-center">
          <p className="text-sm">
            Don&apos;t have an account?{' '}
            <span
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Register
            </span>
          </p>
        </div>
      </form>

      <DevTool control={control} />
    </div>
  )
}

export default Login
