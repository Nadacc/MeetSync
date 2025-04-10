import * as yup from 'yup'


export const loginSchema = yup.object().shape({
  email: yup.string().required('Email is required').email('Invalid email format'),
  password: yup.string().required('Password is required').min(6, 'Minimum 6 characters'),
})


export const signupSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().required('Email is required').email('Invalid email'),
  password: yup.string().required('Password is required').min(6, 'At least 6 characters'),
  timezone: yup.string().required("Timezone is required"),

})
