import * as yup from 'yup'

export const meetingSchema = yup.object().shape({
    title: yup.string().required('Title is required'),
    agenda: yup.string().required('Agenda is required'),
    type: yup.string().oneOf(['online', 'in-person'], 'Invalid meeting type').required('Meeting type is required'),
    location: yup.string().when('type', {
      is: 'in-person',
      then: (schema) => schema.required('Location is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    attendees: yup.array().of(
      yup.string().email('Invalid email')
    ).min(1, 'At least one attendee is required'),
    
    
  });